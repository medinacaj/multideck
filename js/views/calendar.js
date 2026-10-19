/* MultiDeck 2.0 · Calendario mensual y editor de publicaciones de demostración */
window.MD = window.MD || {};

MD.calendarView = (function () {
  const { store, ui, utils, data } = MD;
  const { esc, isoDate } = utils;
  const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const MAX_TEXT = 500;

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDay = isoDate(today);
  let flashId = null;
  let draft = null; // conserva lo escrito en el editor entre repintados

  function monthLabel(y, m) {
    const s = new Date(y, m, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function longDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function timeOf(d) { return utils.pad(d.getHours()) + ':' + utils.pad(d.getMinutes()); }

  function byDay(items) {
    const map = {};
    items.forEach((s) => { const k = isoDate(s.date); (map[k] = map[k] || []).push(s); });
    return map;
  }

  function gridHtml(items) {
    const map = byDay(items);
    const first = new Date(viewYear, viewMonth, 1);
    const offset = (first.getDay() + 6) % 7; // lunes = 0
    const start = new Date(viewYear, viewMonth, 1 - offset);
    const todayIso = isoDate(new Date());
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const iso = isoDate(d);
      const list = map[iso] || [];
      const out = d.getMonth() !== viewMonth;
      const label = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) + ', ' + (list.length ? utils.plural(list.length, 'publicación programada', 'publicaciones programadas') : 'sin publicaciones');
      cells += '<button type="button" class="day' + (out ? ' day--out' : '') + (iso === todayIso ? ' day--today' : '') + (iso === selectedDay ? ' is-selected' : '') + '" data-day="' + iso + '" aria-label="' + esc(label) + '"' + (iso === selectedDay ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>' +
        '<span class="day__num">' + d.getDate() + '</span>' +
        '<span class="day__items" aria-hidden="true">' +
          list.slice(0, 3).map((s) => {
            const b = store.brandById(s.brand);
            return '<span class="day__chip' + (s.id === flashId ? ' is-new' : '') + '" style="--brand:' + esc(b.color) + '"><b>' + timeOf(s.date) + '</b> ' + esc(s.text) + '</span>';
          }).join('') +
          (list.length > 3 ? '<span class="day__more">+' + (list.length - 3) + ' más</span>' : '') +
        '</span>' +
        (list.length ? '<span class="day__dots" aria-hidden="true">' + list.slice(0, 4).map((s) => ui.brandDot(store.brandById(s.brand))).join('') + '</span>' : '') +
      '</button>';
      if (i === 34 && new Date(start.getFullYear(), start.getMonth(), start.getDate() + 35).getMonth() !== viewMonth) break;
    }
    return '<div class="cal-grid" role="group" aria-label="Días de ' + esc(monthLabel(viewYear, viewMonth)) + '">' +
      WEEKDAYS.map((w) => '<span class="cal-grid__wd" aria-hidden="true">' + w + '</span>').join('') + cells + '</div>';
  }

  function agendaHtml(items) {
    const list = items.filter((s) => isoDate(s.date) === selectedDay);
    const isPast = selectedDay < isoDate(new Date());
    return '<section class="agenda" aria-labelledby="agenda-title">' +
      '<header class="agenda__head"><h3 id="agenda-title">' + esc(longDate(selectedDay)) + '</h3>' +
      (isPast ? '' : '<button type="button" class="btn btn--sm btn--outline" data-action="use-day">' + ui.icon('plus') + 'Programar este día</button>') + '</header>' +
      (list.length ? '<ul class="agenda__list">' + list.map((s) => {
        const b = store.brandById(s.brand);
        return '<li class="agenda__item' + (s.id === flashId ? ' is-new' : '') + '" style="--brand:' + esc(b.color) + '">' +
          '<time class="agenda__time">' + timeOf(s.date) + '</time>' +
          '<div class="agenda__body"><p>' + utils.richText(s.text, '') + '</p>' +
            '<div class="agenda__tags">' + ui.brandTag(b) + '<span class="channel-tag">' + esc(store.channelName(s.channel)) + '</span>' +
            '<span class="demo-tag">' + (s.date < new Date() ? 'Ejemplo pasado' : 'Programada en la demo') + '</span></div></div>' +
          '<button type="button" class="icon-btn icon-btn--sm icon-btn--danger" data-remove="' + esc(s.id) + '" aria-label="Quitar del calendario de demostración">' + ui.icon('trash') + '</button>' +
        '</li>';
      }).join('') + '</ul>'
        : '<div class="empty empty--inline"><p>' + (store.selectedBrands().length ? 'No hay publicaciones de las marcas activas este día.' : 'No hay marcas activas: activa alguna para ver su calendario.') + '</p></div>') +
    '</section>';
  }

  function composerHtml() {
    const brands = store.brands();
    const d = draft || {};
    const defBrand = d.brand || (store.selectedBrands()[0] || brands[0]).id;
    const minDate = isoDate(new Date());
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    return '<form class="composer card" id="composer" novalidate aria-labelledby="composer-title">' +
      '<header class="composer__head"><h2 id="composer-title">Redactar publicación</h2><span class="demo-tag">Solo demostración</span></header>' +
      '<div class="field"><label for="cmp-text">Texto</label>' +
        '<textarea id="cmp-text" name="text" rows="4" maxlength="' + MAX_TEXT + '" placeholder="¿Qué quieres contar? Puedes mencionar @cuentas y usar #etiquetas." aria-describedby="cmp-text-count cmp-text-error">' + esc(d.text || '') + '</textarea>' +
        '<div class="field__row"><p class="field__error" id="cmp-text-error" aria-live="polite"></p><span class="field__count" id="cmp-text-count">' + (d.text || '').length + ' / ' + MAX_TEXT + '</span></div></div>' +
      '<div class="field-grid">' +
        '<div class="field"><label for="cmp-brand">Marca</label><select id="cmp-brand" name="brand" aria-describedby="cmp-brand-error">' +
          brands.map((b) => '<option value="' + esc(b.id) + '"' + (b.id === defBrand ? ' selected' : '') + '>' + esc(b.name) + '</option>').join('') + '</select>' +
          '<p class="field__error" id="cmp-brand-error" aria-live="polite"></p></div>' +
        '<div class="field"><label for="cmp-channel">Canal de ejemplo</label><select id="cmp-channel" name="channel">' +
          data.channels.map((c) => '<option value="' + esc(c.id) + '"' + (c.id === (d.channel || 'breve') ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select></div>' +
        '<div class="field"><label for="cmp-date">Fecha</label><input id="cmp-date" name="date" type="date" min="' + minDate + '" value="' + esc(d.date != null ? d.date : isoDate(tomorrow)) + '" aria-describedby="cmp-date-error"><p class="field__error" id="cmp-date-error" aria-live="polite"></p></div>' +
        '<div class="field"><label for="cmp-time">Hora</label><input id="cmp-time" name="time" type="time" value="' + esc(d.time || '10:00') + '" aria-describedby="cmp-time-error"><p class="field__error" id="cmp-time-error" aria-live="polite"></p></div>' +
      '</div>' +
      '<p class="composer__note">' + ui.icon('info') + '<span>Se guarda solo en el calendario de este navegador. No se publica ni se envía a ninguna cuenta.</span></p>' +
      '<div class="composer__actions"><button type="reset" class="btn btn--ghost">Limpiar</button><button type="submit" class="btn btn--primary">' + ui.icon('calendar') + 'Programar en la demo</button></div>' +
    '</form>';
  }

  function render() {
    const root = document.getElementById('view-calendario');
    const items = store.scheduledVisible();
    const monthItems = items.filter((s) => s.date.getFullYear() === viewYear && s.date.getMonth() === viewMonth);
    const focusedDay = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.day : null;
    root.innerHTML = '<div class="calendar-layout">' +
      '<div class="card calendar">' +
        '<header class="calendar__head">' +
          '<h2 class="calendar__month" aria-live="polite">' + esc(monthLabel(viewYear, viewMonth)) + '</h2>' +
          '<span class="count-pill">' + utils.plural(monthItems.length, 'publicación', 'publicaciones') + '</span>' +
          '<div class="calendar__nav">' +
            '<button type="button" class="icon-btn" data-action="prev" aria-label="Mes anterior">' + ui.icon('left') + '</button>' +
            '<button type="button" class="btn btn--sm btn--outline" data-action="today">Hoy</button>' +
            '<button type="button" class="icon-btn" data-action="next" aria-label="Mes siguiente">' + ui.icon('right') + '</button>' +
          '</div>' +
        '</header>' +
        gridHtml(items) +
        '<div class="calendar__legend">' + store.selectedBrands().map((b) => '<span>' + ui.brandDot(b) + esc(b.name) + '</span>').join('') + '</div>' +
        agendaHtml(items) +
      '</div>' +
      composerHtml() +
    '</div>';
    if (focusedDay) { const el = root.querySelector('[data-day="' + focusedDay + '"]'); if (el) el.focus(); }
  }

  function readDraft(form) {
    return { text: form.elements.text.value, brand: form.elements.brand.value, channel: form.elements.channel.value, date: form.elements.date.value, time: form.elements.time.value };
  }

  function validate(form) {
    const v = readDraft(form);
    const errors = {};
    if (!v.text.trim()) errors.text = 'Escribe el texto de la publicación.';
    else if (v.text.length > MAX_TEXT) errors.text = 'El texto no puede superar los ' + MAX_TEXT + ' caracteres.';
    if (!store.brandById(v.brand)) errors.brand = 'Elige una marca de la lista.';
    const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(v.date) && utils.parseLocal(v.date, '00:00');
    if (!dateOk) errors.date = 'Introduce una fecha válida (día, mes y año).';
    if (!/^\d{2}:\d{2}$/.test(v.time) || !utils.parseLocal('2000-01-01', v.time)) errors.time = 'Introduce una hora válida.';
    let when = null;
    if (!errors.date && !errors.time) {
      when = utils.parseLocal(v.date, v.time);
      const now = new Date();
      const limit = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
      if (!when) errors.date = 'Introduce una fecha válida (día, mes y año).';
      else if (when <= now) errors.date = 'La fecha y la hora deben ser posteriores al momento actual.';
      else if (when > limit) errors.date = 'Elige una fecha dentro de los próximos dos años.';
    }
    return { v, errors, when };
  }

  function showErrors(form, errors) {
    ['text', 'brand', 'date', 'time'].forEach((k) => ui.fieldError(form.elements[k], errors[k] || ''));
    const firstKey = ['text', 'brand', 'date', 'time'].find((k) => errors[k]);
    if (firstKey) form.elements[firstKey].focus();
  }

  function onSubmit(e) {
    const form = e.target.closest('#composer');
    if (!form) return;
    e.preventDefault();
    const { v, errors, when } = validate(form);
    if (Object.keys(errors).length) {
      showErrors(form, errors);
      ui.toast('Revisa los campos marcados antes de programar.', { tone: 'error', duration: 4000 });
      return;
    }
    const entry = store.addScheduled({ brand: v.brand, channel: v.channel, text: v.text.trim(), at: when.toISOString() });
    const brand = store.brandById(v.brand);
    draft = { brand: v.brand, channel: v.channel, time: v.time };
    viewYear = when.getFullYear(); viewMonth = when.getMonth(); selectedDay = isoDate(when);
    flashId = entry.id;
    render();
    setTimeout(() => { flashId = null; }, 2500);
    const when_ = when.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) + ' a las ' + v.time;
    let msg = 'Se añadió al calendario local para el ' + when_ + '. No se envió ni se enviará a ninguna red social.';
    if (!store.isSelected(brand.id)) msg += ' ' + brand.name + ' está oculta por el filtro de marcas: actívala para verla.';
    ui.toast(msg, { title: 'Programada solo en la demostración', duration: 8000 });
    const agenda = document.querySelector('.agenda');
    if (agenda && window.matchMedia('(max-width: 1100px)').matches) agenda.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function onClick(e) {
    const t = e.target;
    const day = t.closest('[data-day]');
    if (day) {
      selectedDay = day.dataset.day;
      const [y, m] = selectedDay.split('-').map(Number);
      if (m - 1 !== viewMonth || y !== viewYear) { viewYear = y; viewMonth = m - 1; }
      render();
      return;
    }
    const rm = t.closest('[data-remove]');
    if (rm) {
      const item = store.state.scheduled.find((s) => s.id === rm.dataset.remove);
      store.removeScheduled(rm.dataset.remove);
      ui.toast('Se quitó del calendario de demostración.', { title: 'Publicación eliminada', action: { label: 'Deshacer', onClick: () => store.addScheduled(item) } });
      return;
    }
    const a = t.closest('[data-action]');
    if (!a) return;
    const form = document.getElementById('composer');
    if (a.dataset.action === 'prev' || a.dataset.action === 'next') {
      const d = new Date(viewYear, viewMonth + (a.dataset.action === 'prev' ? -1 : 1), 1);
      viewYear = d.getFullYear(); viewMonth = d.getMonth();
      if (form) draft = readDraft(form);
      render();
      document.querySelector('#view-calendario [data-action="' + a.dataset.action + '"]').focus();
    } else if (a.dataset.action === 'today') {
      viewYear = today.getFullYear(); viewMonth = today.getMonth(); selectedDay = isoDate(new Date());
      if (form) draft = readDraft(form);
      render();
    } else if (a.dataset.action === 'use-day') {
      form.elements.date.value = selectedDay;
      ui.fieldError(form.elements.date, '');
      form.elements.text.focus();
      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function onInput(e) {
    const form = e.target.closest('#composer');
    if (!form) return;
    draft = readDraft(form);
    if (e.target.name === 'text') document.getElementById('cmp-text-count').textContent = e.target.value.length + ' / ' + MAX_TEXT;
    if (e.target.getAttribute('aria-invalid')) ui.fieldError(e.target, '');
  }

  function init() {
    const root = document.getElementById('view-calendario');
    root.addEventListener('submit', onSubmit);
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onInput);
    root.addEventListener('reset', (e) => {
      draft = null;
      setTimeout(() => {
        const form = e.target;
        ['text', 'brand', 'date', 'time'].forEach((k) => ui.fieldError(form.elements[k], ''));
        document.getElementById('cmp-text-count').textContent = '0 / ' + MAX_TEXT;
      }, 0);
    });
    store.subscribe((scope) => {
      if (scope === 'calendar' || scope === 'brands' || scope === 'all') {
        const form = document.getElementById('composer');
        if (form && scope !== 'all') draft = readDraft(form);
        if (scope === 'all') draft = null;
        render();
      }
    });
    render();
  }

  return {
    init, render,
    title: 'Calendario',
    subtitle: () => {
      const upcoming = store.scheduledVisible().filter((s) => s.date > new Date()).length;
      return utils.plural(upcoming, 'publicación programada', 'publicaciones programadas') + ' en la demo · nada se publica';
    },
    actions: () => ''
  };
})();
