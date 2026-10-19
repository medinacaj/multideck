/* MultiDeck 2.0 · Piezas de interfaz compartidas: iconos, avisos y diálogos */
window.MD = window.MD || {};

MD.ui = (function () {
  const { esc } = MD.utils;

  // Iconos de trazo simple dibujados para esta demo.
  const PATHS = {
    home: '<path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10v9h11v-9"/><path d="M10 19v-5h4v5"/>',
    inbox: '<path d="M4 13.5 6.5 6h11L20 13.5V18H4z"/><path d="M4 13.5h4.5l1 2h5l1-2H20"/>',
    calendar: '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M4 10h16M9 4v4M15 4v4"/>',
    chart: '<path d="M5 19V5"/><path d="M5 19h14"/><path d="M8.5 15.5 12 11l3 2.5 4-5.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    search: '<circle cx="11" cy="11" r="5.5"/><path d="m15.5 15.5 4 4"/>',
    left: '<path d="M14.5 6 8.5 12l6 6"/>',
    right: '<path d="m9.5 6 6 6-6 6"/>',
    check: '<path d="m5.5 12.5 4 4 9-9"/>',
    at: '<circle cx="12" cy="12" r="3.5"/><path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.5 6.9"/>',
    list: '<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="5" cy="7" r=".8"/><circle cx="5" cy="12" r=".8"/><circle cx="5" cy="17" r=".8"/>',
    users: '<circle cx="9" cy="9" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M15 6.5a3 3 0 0 1 0 5.5M17.5 19a5.5 5.5 0 0 0-2.5-4.6"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
    edit: '<path d="M5 19h3.5L18 9.5 14.5 6 5 15.5z"/><path d="m13 7.5 3.5 3.5"/>',
    reset: '<path d="M5 12a7 7 0 1 0 2-4.9"/><path d="M5 4.5V8h3.5"/>',
    info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8h.01"/>',
    mail: '<rect x="4" y="6" width="16" height="12" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/>',
    dot: '<circle cx="12" cy="12" r="4"/>',
    reply: '<path d="M10 8 5 12.5l5 4.5"/><path d="M5.5 12.5H14a5 5 0 0 1 5 5V19"/>',
    repeat: '<path d="M6 10V8.5A2.5 2.5 0 0 1 8.5 6H17l-2-2M18 14v1.5a2.5 2.5 0 0 1-2.5 2.5H7l2 2"/>',
    heart: '<path d="M12 19s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 2.5C19 14.6 12 19 12 19z"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    table: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 10h16M10 10v9"/>'
  };

  function icon(name, cls) {
    return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (PATHS[name] || '') + '</svg>';
  }

  function brandDot(brand) {
    if (!brand) return '';
    return '<span class="brand-dot" style="--brand:' + esc(brand.color) + '" aria-hidden="true"></span>';
  }

  function brandTag(brand) {
    if (!brand) return '';
    return '<span class="brand-tag" style="--brand:' + esc(brand.color) + '">' + brandDot(brand) + esc(brand.name) + '</span>';
  }

  // --- Avisos (toasts) --------------------------------------------------------
  function toast(message, opts) {
    const o = opts || {};
    const region = document.getElementById('toasts');
    // Evita duplicados y mantiene como máximo tres avisos a la vez.
    Array.from(region.children).forEach((t) => { if (t.dataset.msg === message) t.remove(); });
    while (region.children.length >= 3) region.firstElementChild.remove();
    const el = document.createElement('div');
    el.dataset.msg = message;
    el.className = 'toast' + (o.tone ? ' toast--' + o.tone : '');
    el.setAttribute('role', o.tone === 'error' ? 'alert' : 'status');
    el.innerHTML = icon(o.tone === 'error' ? 'info' : 'check') + '<div class="toast__body">' +
      (o.title ? '<strong>' + esc(o.title) + '</strong>' : '') + '<span>' + esc(message) + '</span></div>' +
      (o.action ? '<button type="button" class="btn btn--link toast__action">' + esc(o.action.label) + '</button>' : '') +
      '<button type="button" class="icon-btn icon-btn--sm toast__close" aria-label="Cerrar aviso">' + icon('close') + '</button>';
    region.appendChild(el);
    const remove = () => { el.classList.add('is-leaving'); setTimeout(() => el.remove(), 200); };
    el.querySelector('.toast__close').addEventListener('click', remove);
    if (o.action) el.querySelector('.toast__action').addEventListener('click', () => { o.action.onClick(); remove(); });
    setTimeout(remove, o.duration || 6000);
  }

  // --- Diálogos nativos ------------------------------------------------------
  let lastFocus = null;

  function openDialog(dialog) {
    lastFocus = document.activeElement;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    const first = dialog.querySelector('[autofocus], input:not([type=hidden]):not([type=radio]), select, textarea, button');
    if (first) setTimeout(() => first.focus(), 0);
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function fieldError(input, message) {
    const id = input.id + '-error';
    let el = document.getElementById(id);
    if (!message) {
      input.removeAttribute('aria-invalid');
      if (el) el.textContent = '';
      return;
    }
    input.setAttribute('aria-invalid', 'true');
    if (el) el.textContent = message;
  }

  return { icon, brandDot, brandTag, toast, openDialog, closeDialog, fieldError };
})();
