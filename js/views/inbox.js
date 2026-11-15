/* MultiDeck 2.0 · Bandeja: mensajes y menciones ficticios */
window.MD = window.MD || {};

MD.inboxView = (function () {
  const { store, ui, utils } = MD;
  const { esc } = utils;
  const FILTERS = [
    { id: 'all', label: 'Todas' },
    { id: 'mentions', label: 'Menciones' },
    { id: 'unread', label: 'No leídas' }
  ];
  let root, selectedId = null, showDetailOnMobile = false;

  function kindLabel(c) { return c.kind === 'mention' ? 'Mención' : 'Mensaje'; }

  function emptyHtml(filter) {
    if (store.selectedBrands().length === 0) {
      return '<div class="empty"><div class="empty__icon">' + ui.icon('filter') + '</div><h3>No hay marcas activas</h3><p>Activa una o varias marcas para ver sus conversaciones de muestra.</p>' +
        '<button type="button" class="btn btn--sm btn--outline" data-action="select-all">Seleccionar todas</button></div>';
    }
    if (filter === 'unread') return '<div class="empty"><div class="empty__icon">' + ui.icon('check') + '</div><h3>Todo al día</h3><p>No quedan conversaciones sin leer para las marcas activas.</p><button type="button" class="btn btn--sm btn--outline" data-filter="all">Ver todas</button></div>';
    if (filter === 'mentions') return '<div class="empty"><div class="empty__icon">' + ui.icon('at') + '</div><h3>Sin menciones</h3><p>Las marcas activas no tienen menciones de muestra.</p></div>';
    return '<div class="empty"><div class="empty__icon">' + ui.icon('inbox') + '</div><h3>Bandeja vacía</h3><p>No hay conversaciones de muestra para las marcas activas.</p></div>';
  }

  function itemHtml(c) {
    const brand = store.brandById(c.brand);
    const active = c.id === selectedId;
    return '<li class="conv' + (c.unread ? ' is-unread' : '') + (active ? ' is-active' : '') + '" style="--brand:' + esc(brand.color) + '">' +
      '<button type="button" class="conv__open" data-open="' + esc(c.id) + '"' + (active ? ' aria-current="true"' : '') + '>' +
        '<span class="avatar avatar--sm" aria-hidden="true">' + esc(utils.initials(c.name)) + '</span>' +
        '<span class="conv__main">' +
          '<span class="conv__top"><span class="conv__name">' + esc(c.name) + '</span><time class="conv__time">' + esc(utils.relativeTime(c.last.date, Date.now())) + '</time></span>' +
          '<span class="conv__meta">' + ui.brandDot(brand) + esc(brand.name) + ' · <span class="kind kind--' + c.kind + '">' + kindLabel(c) + '</span>' + (c.unread ? '<span class="sr-only">, no leída</span>' : '') + '</span>' +
          '<span class="conv__snippet">' + esc(c.last.text) + '</span>' +
        '</span>' +
      '</button>' +
      '<button type="button" class="icon-btn icon-btn--sm conv__toggle" data-toggle="' + esc(c.id) + '" aria-label="' + (c.unread ? 'Marcar como leída' : 'Marcar como no leída') + ': ' + esc(c.name) + '" title="' + (c.unread ? 'Marcar como leída' : 'Marcar como no leída') + '">' +
        (c.unread ? '<span class="unread-dot" aria-hidden="true"></span>' : ui.icon('mail')) +
      '</button>' +
    '</li>';
  }

  function detailHtml(c) {
    if (!c) {
      return '<div class="empty empty--detail"><div class="empty__icon">' + ui.icon('mail') + '</div><h3>Selecciona una conversación</h3><p>Abre un mensaje o una mención para leerlo completo.</p></div>';
    }
    const brand = store.brandById(c.brand);
    return '<div class="thread" style="--brand:' + esc(brand.color) + '">' +
      '<header class="thread__head">' +
        '<button type="button" class="btn btn--ghost btn--sm thread__back" data-action="back">' + ui.icon('left') + 'Conversaciones</button>' +
        '<div class="thread__who"><span class="avatar" aria-hidden="true">' + esc(utils.initials(c.name)) + '</span>' +
          '<div><h2 class="thread__name">' + esc(c.name) + '</h2><span class="muted">@' + esc(c.handle) + '</span></div></div>' +
        '<div class="thread__tags">' + ui.brandTag(brand) + '<span class="channel-tag">' + esc(store.channelName(c.channel)) + '</span><span class="kind kind--' + c.kind + '">' + kindLabel(c) + '</span></div>' +
        '<button type="button" class="btn btn--sm btn--outline" data-toggle="' + esc(c.id) + '">' + ui.icon(c.unread ? 'check' : 'mail') + (c.unread ? 'Marcar como leída' : 'Marcar como no leída') + '</button>' +
      '</header>' +
      '<ol class="thread__messages">' + c.messages.map((m) => {
        const mine = m.from === 'brand';
        return '<li class="bubble' + (mine ? ' bubble--mine' : '') + '">' +
          '<span class="bubble__who">' + esc(mine ? brand.name : c.name) + ' · <time>' + esc(utils.relativeTime(m.date, Date.now())) + '</time></span>' +
          '<p>' + utils.richText(m.text, '') + '</p></li>';
      }).join('') + '</ol>' +
      '<footer class="thread__foot">' + ui.icon('info') + '<span>Conversación ficticia. En esta demostración no se envían ni reciben mensajes.</span></footer>' +
    '</div>';
  }

  function render() {
    const filter = store.state.inboxFilter;
    const visible = store.visibleConversations(filter);
    const all = store.conversations();
    const selected = all.find((c) => c.id === selectedId && store.isSelected(c.brand));
    if (!selected) { selectedId = null; showDetailOnMobile = false; }
    const counts = {
      all: store.visibleConversations('all').length,
      mentions: store.visibleConversations('mentions').length,
      unread: store.visibleConversations('unread').length
    };
    const listScroll = root.querySelector('.conv-list') ? root.querySelector('.conv-list').scrollTop : 0;

    root.innerHTML = '<div class="inbox' + (showDetailOnMobile ? ' is-detail' : '') + '">' +
      '<div class="inbox__pane inbox__pane--list">' +
        '<div class="inbox__toolbar">' +
          '<div class="segmented" role="group" aria-label="Filtrar conversaciones">' +
            FILTERS.map((f) => '<button type="button" class="segmented__btn' + (filter === f.id ? ' is-on' : '') + '" aria-pressed="' + (filter === f.id) + '" data-filter="' + f.id + '">' + f.label + ' <span class="segmented__count">' + counts[f.id] + '</span></button>').join('') +
          '</div>' +
          '<button type="button" class="btn btn--link btn--sm" data-action="read-all"' + (counts.unread ? '' : ' disabled') + '>Marcar todo como leído</button>' +
        '</div>' +
        (visible.length ? '<ul class="conv-list" aria-label="Conversaciones">' + visible.map(itemHtml).join('') + '</ul>' : emptyHtml(filter)) +
      '</div>' +
      '<div class="inbox__pane inbox__pane--detail" aria-live="polite">' + detailHtml(selected) + '</div>' +
    '</div>';
    const list = root.querySelector('.conv-list');
    if (list) list.scrollTop = listScroll;
  }

  function refocus(selector) {
    const el = root.querySelector(selector);
    if (el) el.focus();
  }

  function onClick(e) {
    const t = e.target;
    const filterBtn = t.closest('[data-filter]');
    if (filterBtn) { store.setInboxFilter(filterBtn.dataset.filter); refocus('[data-filter="' + filterBtn.dataset.filter + '"]'); return; }
    const open = t.closest('[data-open]');
    if (open) {
      selectedId = open.dataset.open;
      showDetailOnMobile = true;
      const c = store.conversations().find((x) => x.id === selectedId);
      if (c && c.unread) store.setUnread(selectedId, false); else render();
      const isMobile = window.matchMedia('(max-width: 760px)').matches;
      refocus(isMobile ? '.thread__back' : '[data-open="' + selectedId + '"]');
      return;
    }
    const tog = t.closest('[data-toggle]');
    if (tog) {
      const id = tog.dataset.toggle;
      const c = store.conversations().find((x) => x.id === id);
      const inDetail = !!tog.closest('.thread');
      store.setUnread(id, !c.unread);
      ui.toast(c.unread ? 'Conversación marcada como leída.' : 'Conversación marcada como no leída.', { duration: 3000 });
      refocus(inDetail ? '.thread [data-toggle]' : '[data-toggle="' + id + '"]');
      return;
    }
    const action = t.closest('[data-action]');
    if (!action) return;
    if (action.dataset.action === 'back') { showDetailOnMobile = false; render(); refocus('[data-open="' + selectedId + '"]'); }
    if (action.dataset.action === 'select-all' && !store.allSelected()) store.toggleAll();
    if (action.dataset.action === 'read-all') {
      const unread = store.visibleConversations('unread');
      store.markRead(unread.map((c) => c.id));
      ui.toast(utils.plural(unread.length, 'conversación marcada', 'conversaciones marcadas') + ' como leídas.', { duration: 3000 });
    }
  }

  function init() {
    root = document.getElementById('view-bandeja');
    root.addEventListener('click', onClick);
    store.subscribe((scope) => { if (['inbox', 'brands', 'all'].indexOf(scope) !== -1) render(); });
    render();
  }

  return {
    init, render,
    title: 'Bandeja',
    subtitle: () => utils.plural(store.unreadCount(), 'conversación sin leer', 'conversaciones sin leer') + ' · mensajes y menciones ficticios',
    actions: () => ''
  };
})();
