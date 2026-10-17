/* MultiDeck 2.0 · Utilidades compartidas */
window.MD = window.MD || {};

MD.utils = (function () {
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ESC[c]);
  }

  // Minúsculas y sin tildes, para búsquedas tolerantes ("cafe" encuentra "café").
  function fold(str) {
    return String(str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  // Devuelve HTML escapado con <mark> en las coincidencias (sin distinguir tildes).
  function highlight(text, query) {
    const q = fold(query).trim();
    if (!q) return esc(text);
    // Construye el texto normalizado con un mapa al índice original de cada carácter.
    const chars = Array.from(text);
    let folded = '';
    const map = [];
    chars.forEach((ch, i) => {
      const f = fold(ch);
      for (let k = 0; k < f.length; k++) { folded += f[k]; map.push(i); }
    });
    let out = '';
    let cursor = 0;
    let from = 0;
    let idx;
    while ((idx = folded.indexOf(q, from)) !== -1) {
      const start = map[idx];
      const end = map[idx + q.length - 1] + 1;
      if (start >= cursor) {
        out += esc(chars.slice(cursor, start).join('')) + '<mark>' + esc(chars.slice(start, end).join('')) + '</mark>';
        cursor = end;
      }
      from = idx + q.length;
    }
    return out + esc(chars.slice(cursor).join(''));
  }

  // Texto de publicación: resalta @menciones, #etiquetas y coincidencias de búsqueda.
  function richText(text, query) {
    const parts = String(text).split(/([@#][\wÀ-ÿ]+)/g);
    return parts.map((part) => {
      if (/^@\w+$/.test(part)) {
        const handle = part.slice(1);
        return '<button type="button" class="mention-link" data-action="mention" data-handle="' + esc(handle) + '" title="Crear columna con menciones a @' + esc(handle) + '">' + highlight(part, query) + '</button>';
      }
      if (/^#/.test(part) && part.length > 1) return '<span class="hashtag">' + highlight(part, query) + '</span>';
      return highlight(part, query);
    }).join('');
  }

  function extractMentions(text) {
    const out = [];
    const re = /@([A-Za-z0-9_]+)/g;
    let m;
    while ((m = re.exec(text))) out.push(m[1].toLowerCase());
    return out;
  }

  function relativeTime(date, now) {
    const diff = Math.max(0, Math.round((now - date) / 60000));
    if (diff < 1) return 'ahora';
    if (diff < 60) return 'hace ' + diff + ' min';
    const h = Math.round(diff / 60);
    if (h < 24) return 'hace ' + h + ' h';
    const d = Math.round(h / 24);
    if (d === 1) return 'ayer';
    if (d < 7) return 'hace ' + d + ' días';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  function initials(name) {
    return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  // Fecha local en formato AAAA-MM-DD (sin desfases por zona horaria).
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function parseLocal(dateStr, timeStr) {
    const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || '');
    const tm = /^(\d{2}):(\d{2})$/.exec(timeStr || '');
    if (!dm || !tm) return null;
    const y = +dm[1], mo = +dm[2] - 1, d = +dm[3], h = +tm[1], mi = +tm[2];
    const date = new Date(y, mo, d, h, mi);
    // Rechaza fechas desbordadas como 31 de febrero.
    if (date.getFullYear() !== y || date.getMonth() !== mo || date.getDate() !== d || h > 23 || mi > 59) return null;
    return date;
  }

  function formatNumber(n) {
    return new Intl.NumberFormat('es-ES').format(Math.round(n));
  }

  function formatCompact(n) {
    if (n >= 1e6) return (n / 1e6).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' M';
    if (n >= 1e4) return (n / 1e3).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' mil';
    return formatNumber(n);
  }

  // Generador pseudoaleatorio determinista (mulberry32) para cifras ilustrativas.
  function seeded(seedStr) {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    let a = h >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function slug(str) {
    return fold(str).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'marca';
  }

  function uid(prefix) {
    return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  return { esc, fold, highlight, richText, extractMentions, relativeTime, initials, pad, isoDate, parseLocal, formatNumber, formatCompact, seeded, slug, uid, plural };
})();
