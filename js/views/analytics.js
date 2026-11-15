/* MultiDeck 2.0 · Analítica ilustrativa (cifras generadas localmente) */
window.MD = window.MD || {};

MD.analyticsView = (function () {
  const { store, ui, utils, data } = MD;
  const { esc } = utils;
  const RANGES = [7, 14, 30];
  let root, showTable = false, hoverIndex = null, resizeTimer = null;

  // Serie diaria determinista por marca: 60 días (periodo actual + anterior).
  function seriesFor(brand) {
    const rnd = utils.seeded(brand.id);
    const base = 2200 + Math.floor(rnd() * 3800);
    const rate = 0.035 + rnd() * 0.035;
    const trend = (rnd() - 0.35) * 0.012;
    const days = [];
    const now = new Date();
    for (let i = 59; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const weekday = d.getDay();
      const weekly = weekday === 0 || weekday === 6 ? 0.82 : 1 + (weekday === 3 ? 0.12 : 0);
      const growth = 1 + trend * (59 - i);
      const reach = base * weekly * growth * (0.82 + rnd() * 0.36);
      const inter = reach * rate * (0.8 + rnd() * 0.4);
      days.push({ date: d, reach, inter, followers: Math.max(0, Math.round(inter * (0.04 + rnd() * 0.05))) });
    }
    const weights = data.channels.map(() => 0.4 + rnd());
    const total = weights.reduce((a, b) => a + b, 0);
    return { brand, days, channelShare: weights.map((w) => w / total) };
  }

  function sum(arr, key) { return arr.reduce((a, d) => a + d[key], 0); }

  function compute(range) {
    const brands = store.selectedBrands();
    const series = brands.map(seriesFor);
    const cur = (s) => s.days.slice(60 - range);
    const prev = (s) => s.days.slice(60 - 2 * range, 60 - range);
    const tot = (fn, key) => series.reduce((a, s) => a + sum(fn(s), key), 0);
    const kpi = {
      reach: [tot(cur, 'reach'), tot(prev, 'reach')],
      inter: [tot(cur, 'inter'), tot(prev, 'inter')],
      followers: [tot(cur, 'followers'), tot(prev, 'followers')]
    };
    kpi.rate = [kpi.inter[0] / (kpi.reach[0] || 1), kpi.inter[1] / (kpi.reach[1] || 1)];
    const channels = data.channels.map((c, i) => ({ name: c.name, value: series.reduce((a, s) => a + sum(cur(s), 'inter') * s.channelShare[i], 0) }));
    const perBrand = series.map((s) => ({ brand: s.brand, value: sum(cur(s), 'inter') }));
    return { series, cur, kpi, channels, perBrand };
  }

  function delta(curr, prev, isRate) {
    if (!prev) return '';
    const diff = isRate ? (curr - prev) * 100 : ((curr - prev) / prev) * 100;
    const up = diff >= 0;
    const txt = (up ? '+' : '−') + Math.abs(diff).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + (isRate ? ' pp' : ' %');
    return '<span class="kpi__delta ' + (up ? 'is-up' : 'is-down') + '"><span aria-hidden="true">' + (up ? '▲' : '▼') + '</span> ' + txt + ' <span class="muted">vs. periodo anterior</span></span>';
  }

  function kpiHtml(k) {
    const tiles = [
      { label: 'Alcance estimado', value: utils.formatCompact(k.reach[0]), d: delta(k.reach[0], k.reach[1]) },
      { label: 'Interacciones', value: utils.formatCompact(k.inter[0]), d: delta(k.inter[0], k.inter[1]) },
      { label: 'Tasa de interacción', value: (k.rate[0] * 100).toLocaleString('es-ES', { maximumFractionDigits: 2 }) + ' %', d: delta(k.rate[0], k.rate[1], true) },
      { label: 'Nuevos seguidores', value: utils.formatNumber(k.followers[0]), d: delta(k.followers[0], k.followers[1]) }
    ];
    return '<div class="kpis">' + tiles.map((t) => '<div class="kpi card"><span class="kpi__label">' + t.label + ' <span class="demo-tag demo-tag--xs">ilustrativo</span></span><strong class="kpi__value">' + t.value + '</strong>' + t.d + '</div>').join('') + '</div>';
  }

  // --- Gráfico de líneas (SVG) --------------------------------------------------
  function niceMax(v) {
    const pow = Math.pow(10, Math.floor(Math.log10(v || 1)));
    const n = v / pow;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
  }

  function lineChartHtml(model, range, width) {
    const W = Math.max(280, width);
    const narrow = W < 520;
    const H = narrow ? 220 : 260;
    const m = { l: 44, r: narrow ? 16 : 104, t: 14, b: 28 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const lines = model.series.map((s) => ({ brand: s.brand, pts: model.cur(s) }));
    const n = range;
    const maxV = niceMax(Math.max.apply(null, lines.map((l) => Math.max.apply(null, l.pts.map((p) => p.inter)))) * 1.05);
    const x = (i) => m.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
    const y = (v) => m.t + ih - (v / maxV) * ih;
    let g = '';
    for (let t = 0; t <= 4; t++) {
      const v = (maxV / 4) * t;
      g += '<line class="grid" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>' +
        '<text class="axis" x="' + (m.l - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + utils.formatCompact(v) + '</text>';
    }
    const step = n <= 7 ? 1 : n <= 14 ? (narrow ? 3 : 2) : (narrow ? 7 : 5);
    const dates = lines.length ? lines[0].pts.map((p) => p.date) : [];
    dates.forEach((d, i) => {
      if ((n - 1 - i) % step !== 0) return;
      g += '<text class="axis" x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + d.getDate() + '/' + (d.getMonth() + 1) + '</text>';
    });
    g += '<line class="baseline" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(0) + '" y2="' + y(0) + '"/>';
    const paths = lines.map((l) => '<path class="series" style="--brand:' + esc(l.brand.color) + '" d="' + l.pts.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.inter).toFixed(1)).join(' ') + '"/>').join('');
    // Etiquetas directas al final de cada línea, separadas para no solaparse.
    let labels = '';
    if (!narrow && lines.length <= 4) {
      const ends = lines.map((l) => ({ l, y: y(l.pts[n - 1].inter) })).sort((a, b) => a.y - b.y);
      for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 15) ends[i].y = ends[i - 1].y + 15;
      labels = ends.map((e) => '<circle class="end-dot" style="--brand:' + esc(e.l.brand.color) + '" cx="' + x(n - 1) + '" cy="' + y(e.l.pts[n - 1].inter) + '" r="4"/>' +
        '<text class="direct-label" x="' + (x(n - 1) + 10) + '" y="' + (e.y + 4) + '">' + esc(e.l.brand.name) + '</text>').join('');
    }
    let hover = '';
    if (hoverIndex !== null && hoverIndex < n) {
      hover = '<line class="crosshair" x1="' + x(hoverIndex) + '" x2="' + x(hoverIndex) + '" y1="' + m.t + '" y2="' + (m.t + ih) + '"/>' +
        lines.map((l) => '<circle class="hover-dot" style="--brand:' + esc(l.brand.color) + '" cx="' + x(hoverIndex) + '" cy="' + y(l.pts[hoverIndex].inter) + '" r="5"/>').join('');
    }
    const svg = '<svg class="line-chart" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Interacciones diarias ilustrativas por marca en los últimos ' + n + ' días">' + g + paths + labels + hover +
      '<rect class="hit" x="' + m.l + '" y="' + m.t + '" width="' + iw + '" height="' + ih + '" data-n="' + n + '" data-l="' + m.l + '" data-w="' + iw + '"/></svg>';
    let tip = '';
    if (hoverIndex !== null && hoverIndex < n && dates[hoverIndex]) {
      const left = x(hoverIndex);
      tip = '<div class="chart-tip" style="left:' + left + 'px;' + (left > W * 0.6 ? 'transform:translateX(calc(-100% - 12px))' : 'transform:translateX(12px)') + '">' +
        '<strong>' + esc(dates[hoverIndex].toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })) + '</strong>' +
        lines.slice().sort((a, b) => b.pts[hoverIndex].inter - a.pts[hoverIndex].inter).map((l) => '<span>' + ui.brandDot(l.brand) + esc(l.brand.name) + '<b>' + utils.formatNumber(l.pts[hoverIndex].inter) + '</b></span>').join('') + '</div>';
    }
    return svg + tip;
  }

  function tableHtml(model, range) {
    const lines = model.series.map((s) => ({ brand: s.brand, pts: model.cur(s) }));
    if (!lines.length) return '';
    return '<div class="table-wrap"><table class="data-table"><caption class="sr-only">Interacciones diarias ilustrativas</caption><thead><tr><th scope="col">Fecha</th>' +
      lines.map((l) => '<th scope="col">' + esc(l.brand.name) + '</th>').join('') + '</tr></thead><tbody>' +
      lines[0].pts.map((p, i) => '<tr><th scope="row">' + esc(p.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })) + '</th>' +
        lines.map((l) => '<td>' + utils.formatNumber(l.pts[i].inter) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div>';
  }

  function barsHtml(rows, opts) {
    const max = Math.max.apply(null, rows.map((r) => r.value)) || 1;
    const total = rows.reduce((a, r) => a + r.value, 0) || 1;
    return '<ul class="bars">' + rows.map((r) => {
      const pct = (r.value / total) * 100;
      const tip = r.name + ': ' + utils.formatNumber(r.value) + ' interacciones (' + pct.toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' %)';
      return '<li class="bars__row" tabindex="0" data-tip="' + esc(tip) + '" aria-label="' + esc(tip) + '">' +
        '<span class="bars__label">' + (r.brand ? ui.brandDot(r.brand) : '') + esc(r.name) + '</span>' +
        '<span class="bars__track"><span class="bars__fill" style="width:' + ((r.value / max) * 100).toFixed(1) + '%;' + (r.color ? '--bar:' + esc(r.color) : '') + '"></span></span>' +
        '<span class="bars__value">' + utils.formatCompact(r.value) + (opts && opts.pct ? ' <span class="muted">· ' + pct.toLocaleString('es-ES', { maximumFractionDigits: 0 }) + ' %</span>' : '') + '</span>' +
      '</li>';
    }).join('') + '</ul>';
  }

  function topPostsHtml() {
    const posts = store.allPosts().filter((p) => store.isSelected(p.brand)).sort((a, b) => (b.stats[0] + b.stats[1] + b.stats[2]) - (a.stats[0] + a.stats[1] + a.stats[2])).slice(0, 5);
    return '<ol class="top-posts">' + posts.map((p, i) => {
      const b = store.brandById(p.brand);
      return '<li><span class="top-posts__rank">' + (i + 1) + '</span><div><p>' + esc(p.text) + '</p><span class="top-posts__meta">' + ui.brandTag(b) + '<span class="muted">@' + esc(p.handle) + ' · ' + esc(store.channelName(p.channel)) + '</span></span></div>' +
        '<strong class="top-posts__score">' + utils.formatNumber(p.stats[0] + p.stats[1] + p.stats[2]) + '<small>interacciones de ejemplo</small></strong></li>';
    }).join('') + '</ol>';
  }

  function render() {
    const range = store.state.analyticsRange;
    const brands = store.selectedBrands();
    const head = '<div class="analytics-head">' +
      '<p class="notice">' + ui.icon('info') + '<span><strong>Vista ilustrativa.</strong> Todas las cifras se generan localmente para esta demostración; no provienen de ninguna plataforma ni reflejan resultados reales.</span></p>' +
      '<div class="segmented" role="group" aria-label="Periodo">' + RANGES.map((r) => '<button type="button" class="segmented__btn' + (r === range ? ' is-on' : '') + '" aria-pressed="' + (r === range) + '" data-range="' + r + '">' + r + ' días</button>').join('') + '</div>' +
    '</div>';
    if (!brands.length) {
      root.innerHTML = head + '<div class="card"><div class="empty"><div class="empty__icon">' + ui.icon('chart') + '</div><h3>No hay marcas activas</h3><p>Selecciona al menos una marca para ver sus métricas ilustrativas.</p><button type="button" class="btn btn--sm btn--outline" data-action="select-all">Seleccionar todas</button></div></div>';
      return;
    }
    const model = compute(range);
    root.innerHTML = head + kpiHtml(model.kpi) +
      '<div class="analytics-grid">' +
        '<section class="card chart-card chart-card--wide" aria-labelledby="ch1">' +
          '<header class="chart-card__head"><div><h2 id="ch1">Interacciones por día</h2><p class="muted">Últimos ' + range + ' días · cifras de ejemplo</p></div>' +
          '<button type="button" class="btn btn--sm btn--ghost" data-action="table" aria-pressed="' + showTable + '">' + ui.icon(showTable ? 'chart' : 'table') + (showTable ? 'Ver gráfico' : 'Ver tabla') + '</button></header>' +
          '<div class="legend">' + brands.map((b) => '<span>' + '<i class="legend__line" style="--brand:' + esc(b.color) + '"></i>' + esc(b.name) + '</span>').join('') + '</div>' +
          (showTable ? tableHtml(model, range) : '<div class="chart-box" id="line-box" tabindex="0" aria-describedby="line-help"></div><p class="sr-only" id="line-help">Usa las flechas izquierda y derecha para recorrer los días.</p>') +
        '</section>' +
        '<section class="card chart-card" aria-labelledby="ch2"><header class="chart-card__head"><div><h2 id="ch2">Interacciones por canal</h2><p class="muted">Canales genéricos de ejemplo</p></div></header>' +
          barsHtml(model.channels.map((c) => ({ name: c.name, value: c.value })).sort((a, b) => b.value - a.value), { pct: true }) + '</section>' +
        '<section class="card chart-card" aria-labelledby="ch3"><header class="chart-card__head"><div><h2 id="ch3">Reparto por marca</h2><p class="muted">Interacciones del periodo</p></div></header>' +
          barsHtml(model.perBrand.map((p) => ({ name: p.brand.name, value: p.value, brand: p.brand, color: p.brand.color })).sort((a, b) => b.value - a.value), { pct: true }) + '</section>' +
        '<section class="card chart-card chart-card--wide" aria-labelledby="ch4"><header class="chart-card__head"><div><h2 id="ch4">Publicaciones destacadas</h2><p class="muted">Según las cifras de muestra de cada publicación</p></div></header>' + topPostsHtml() + '</section>' +
      '</div><div class="chart-tip chart-tip--float" id="bar-tip" hidden></div>';
    drawLine(model);
  }

  let lastModel = null;
  function drawLine(model) {
    lastModel = model || lastModel;
    const box = document.getElementById('line-box');
    if (!box || !lastModel) return;
    box.innerHTML = lineChartHtml(lastModel, store.state.analyticsRange, box.clientWidth);
  }

  function indexFromEvent(e) {
    const hit = root.querySelector('.hit');
    if (!hit) return null;
    const svg = hit.ownerSVGElement.getBoundingClientRect();
    const n = +hit.dataset.n, l = +hit.dataset.l, w = +hit.dataset.w;
    const px = e.clientX - svg.left - l;
    return Math.max(0, Math.min(n - 1, Math.round((px / w) * (n - 1))));
  }

  function init() {
    root = document.getElementById('view-analitica');
    root.addEventListener('click', (e) => {
      const r = e.target.closest('[data-range]');
      if (r) { hoverIndex = null; store.setAnalyticsRange(+r.dataset.range); root.querySelector('[data-range="' + r.dataset.range + '"]').focus(); return; }
      const a = e.target.closest('[data-action]');
      if (!a) return;
      if (a.dataset.action === 'table') { showTable = !showTable; render(); root.querySelector('[data-action="table"]').focus(); }
      if (a.dataset.action === 'select-all' && !store.allSelected()) store.toggleAll();
    });
    root.addEventListener('pointermove', (e) => {
      if (e.target.closest('#line-box')) {
        const i = indexFromEvent(e);
        if (i !== hoverIndex) { hoverIndex = i; drawLine(); }
      }
      const row = e.target.closest('[data-tip]');
      const tip = document.getElementById('bar-tip');
      if (!tip) return;
      if (row) {
        tip.hidden = false; tip.textContent = row.dataset.tip;
        tip.style.left = Math.min(e.clientX + 14, window.innerWidth - tip.offsetWidth - 12) + 'px'; tip.style.top = (e.clientY + 14) + 'px';
      } else tip.hidden = true;
    });
    root.addEventListener('pointerleave', () => { hoverIndex = null; drawLine(); const tip = document.getElementById('bar-tip'); if (tip) tip.hidden = true; });
    root.addEventListener('pointerout', (e) => { if (e.target.closest && e.target.closest('#line-box') && !e.relatedTarget?.closest?.('#line-box')) { hoverIndex = null; drawLine(); } });
    root.addEventListener('keydown', (e) => {
      if (!e.target.closest('#line-box')) return;
      const n = store.state.analyticsRange;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        hoverIndex = hoverIndex === null ? n - 1 : Math.max(0, Math.min(n - 1, hoverIndex + (e.key === 'ArrowRight' ? 1 : -1)));
        drawLine();
      } else if (e.key === 'Escape') { hoverIndex = null; drawLine(); }
    });
    root.addEventListener('focusout', (e) => { if (e.target.id === 'line-box') { hoverIndex = null; drawLine(); } });
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (!root.hidden) drawLine(); }, 120); });
    store.subscribe((scope) => { if (['analytics', 'brands', 'all'].indexOf(scope) !== -1) render(); });
  }

  return {
    init,
    render,
    onShow: () => render(),
    title: 'Analítica',
    subtitle: () => 'Métricas de muestra · solo con fines ilustrativos',
    actions: () => ''
  };
})();
