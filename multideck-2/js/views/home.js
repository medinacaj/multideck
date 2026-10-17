/* MultiDeck 2.0 · Inicio: tablero de columnas estilo deck */
window.MD = window.MD || {};

MD.homeView = (function () {
  const { store, ui, utils, data } = MD;
  const { esc } = utils;

  const TYPES = {
    home: { label: 'Inicio', icon: 'home' },
    mentions: { label: 'Menciones', icon: 'at' },
    accounts: { label: 'Menciones de cuentas', icon: 'users' },
    list: { label: 'Lista', icon: 'list' }
  };

  let root, board, pager, dialog, form, editingId = null, observer = null;

  function defaultTitle(type, accounts, listId) {
    if (type === 'accounts') {
      const shown = accounts.slice(0, 2).map((a) => '@' + a).join(', ');
      return 'Menciones de ' + shown + (accounts.length > 2 ? ' y ' + (accounts.length - 2) + ' más' : '');
    }
    if (type === 'list') { const l = store.listById(listId); return l ? l.name : 'Lista'; }
    return TYPES[type].label;
  }

  // --- Pintado ------------------------------------------------------------------
  function postHtml(p, query) {
    const brand = store.brandById(p.brand);
    const own = brand && p.handle === brand.handle;
    return '<article class="post' + (own ? ' post--own' : '') + '" style="--brand:' + esc(brand ? brand.color : '#888') + '">' +
      '<div class="avatar" aria-hidden="true">' + esc(utils.initials(p.author)) + '</div>' +
      '<div class="post__body">' +
        '<header class="post__head">' +
          '<span class="post__author">' + utils.highlight(p.author, query) + '</span>' +
          '<span class="post__handle">' + utils.highlight('@' + p.handle, query) + '</span>' +
          '<time class="post__time" datetime="' + p.date.toISOString() + '" title="' + esc(p.date.toLocaleString('es-ES')) + '">' + esc(utils.relativeTime(p.date, Date.now())) + '</time>' +
        '</header>' +
        '<p class="post__text">' + utils.richText(p.text, query) + '</p>' +
        '<footer class="post__foot">' +
          ui.brandTag(brand) +
          '<span class="channel-tag">' + esc(store.channelName(p.channel)) + '</span>' +
          '<span class="post__stats" aria-label="Cifras de ejemplo: ' + p.stats[0] + ' respuestas, ' + p.stats[1] + ' compartidos, ' + p.stats[2] + ' me gusta">' +
            '<span>' + ui.icon('reply') + p.stats[0] + '</span><span>' + ui.icon('repeat') + p.stats[1] + '</span><span>' + ui.icon('heart') + p.stats[2] + '</span>' +
          '</span>' +
        '</footer>' +
      '</div>' +
    '</article>';
  }

  function emptyHtml(col) {
    if (store.selectedBrands().length === 0) {
      return '<div class="empty"><div class="empty__icon">' + ui.icon('filter') + '</div><h3>No hay marcas activas</h3>' +
        '<p>Activa al menos una marca en el filtro superior para ver publicaciones.</p>' +
        '<button type="button" class="btn btn--sm btn--outline" data-action="select-all">Seleccionar todas</button></div>';
    }
    if (col.query && col.query.trim()) {
      return '<div class="empty"><div class="empty__icon">' + ui.icon('search') + '</div><h3>Sin resultados</h3>' +
        '<p>Ninguna publicación de esta columna coincide con «' + esc(col.query.trim()) + '».</p>' +
        '<button type="button" class="btn btn--sm btn--outline" data-action="clear-search">Limpiar búsqueda</button></div>';
    }
    const msg = col.type === 'accounts'
      ? 'Las marcas activas no tienen publicaciones de muestra que mencionen a estas cuentas.'
      : 'Las marcas activas no tienen publicaciones de muestra en este feed.';
    return '<div class="empty"><div class="empty__icon">' + ui.icon(TYPES[col.type].icon) + '</div><h3>Nada por aquí todavía</h3><p>' + msg + '</p>' +
      (col.type === 'accounts' ? '<button type="button" class="btn btn--sm btn--outline" data-action="edit">Editar cuentas</button>' : '') + '</div>';
  }

  function feedHtml(col) {
    const posts = store.postsForColumn(col);
    return { html: posts.length ? posts.map((p) => postHtml(p, col.query)).join('') : emptyHtml(col), count: posts.length };
  }

  function columnHtml(col, index, total) {
    const t = TYPES[col.type] || TYPES.home;
    const feed = feedHtml(col);
    const titleId = col.id + '-title';
    let extra = '';
    if (col.type === 'accounts') {
      extra = '<div class="column__accounts" aria-label="Cuentas incluidas">' + (col.accounts || []).map((a) => '<span class="account-chip">@' + esc(a) + '</span>').join('') + '</div>';
    } else if (col.type === 'list') {
      const l = store.listById(col.listId);
      extra = '<div class="column__accounts" aria-label="Miembros de la lista">' + (l ? l.members.map((a) => '<span class="account-chip account-chip--quiet">@' + esc(a) + '</span>').join('') : '') + '</div>';
    }
    return '<section class="column column--' + col.type + '" data-col="' + esc(col.id) + '" aria-labelledby="' + titleId + '">' +
      '<header class="column__head">' +
        '<div class="column__titles">' +
          '<span class="column__type">' + ui.icon(t.icon) + esc(t.label) + '</span>' +
          '<h2 class="column__title" id="' + titleId + '">' + esc(col.title) + '</h2>' +
          '<span class="column__meta" data-role="meta">' + esc(utils.plural(feed.count, 'publicación', 'publicaciones')) + '</span>' +
        '</div>' +
        '<div class="column__tools">' +
          '<button type="button" class="icon-btn icon-btn--sm" data-action="left" aria-label="Mover «' + esc(col.title) + '» a la izquierda"' + (index === 0 ? ' disabled' : '') + '>' + ui.icon('left') + '</button>' +
          '<button type="button" class="icon-btn icon-btn--sm" data-action="right" aria-label="Mover «' + esc(col.title) + '» a la derecha"' + (index === total - 1 ? ' disabled' : '') + '>' + ui.icon('right') + '</button>' +
          '<button type="button" class="icon-btn icon-btn--sm" data-action="edit" aria-label="Editar columna «' + esc(col.title) + '»">' + ui.icon('edit') + '</button>' +
          '<button type="button" class="icon-btn icon-btn--sm icon-btn--danger" data-action="remove" aria-label="Quitar columna «' + esc(col.title) + '»">' + ui.icon('close') + '</button>' +
        '</div>' +
      '</header>' +
      extra +
      '<div class="column__search">' + ui.icon('search') +
        '<label class="sr-only" for="' + col.id + '-q">Buscar en «' + esc(col.title) + '»</label>' +
        '<input type="search" id="' + col.id + '-q" data-role="search" placeholder="Buscar en esta columna" value="' + esc(col.query || '') + '" autocomplete="off">' +
      '</div>' +
      '<div class="column__feed" data-role="feed" tabindex="0" aria-label="Publicaciones de «' + esc(col.title) + '»">' + feed.html + '</div>' +
    '</section>';
  }

  function renderBoard() {
    const cols = store.state.columns;
    const scroll = board ? board.scrollLeft : 0;
    root.innerHTML =
      '<nav class="pager" aria-label="Ir a columna"><div class="pager__track">' +
        cols.map((c, i) => '<button type="button" class="pager__pill' + (i === 0 ? ' is-active' : '') + '" data-goto="' + esc(c.id) + '">' + esc(c.title) + '</button>').join('') +
        '<button type="button" class="pager__pill pager__pill--add" data-action="add">' + ui.icon('plus') + 'Columna</button>' +
      '</div></nav>' +
      '<div class="board" id="board">' +
        cols.map((c, i) => columnHtml(c, i, cols.length)).join('') +
        '<button type="button" class="column column--ghost" data-action="add">' + ui.icon('plus') + '<strong>Añadir columna</strong><span>Inicio, menciones, cuentas o listas</span></button>' +
      '</div>';
    board = root.querySelector('#board');
    pager = root.querySelector('.pager');
    board.scrollLeft = scroll;
    if (!cols.length) {
      board.insertAdjacentHTML('afterbegin', '<div class="board-empty"><h3>Tu tablero está vacío</h3><p>Añade una columna para empezar a explorar los datos de muestra.</p></div>');
    }
    observePager();
  }

  function renderFeed(colId) {
    const col = store.state.columns.find((c) => c.id === colId);
    const el = root.querySelector('[data-col="' + colId + '"]');
    if (!col || !el) return;
    const feed = feedHtml(col);
    el.querySelector('[data-role="feed"]').innerHTML = feed.html;
    el.querySelector('[data-role="meta"]').textContent = utils.plural(feed.count, 'publicación', 'publicaciones');
  }

  function renderAllFeeds() { store.state.columns.forEach((c) => renderFeed(c.id)); }

  // Resalta en la barra móvil la columna visible.
  function observePager() {
    if (observer) observer.disconnect();
    if (!('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = en.target.dataset.col;
        pager.querySelectorAll('[data-goto]').forEach((b) => {
          const on = b.dataset.goto === id;
          b.classList.toggle('is-active', on);
          if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
        });
      });
    }, { root: board, threshold: 0.6 });
    board.querySelectorAll('.column[data-col]').forEach((c) => observer.observe(c));
  }

  // --- Diálogo de columna -----------------------------------------------------------
  function syncTypeFields() {
    const type = form.elements.type.value;
    document.getElementById('field-accounts').hidden = type !== 'accounts';
    document.getElementById('field-list').hidden = type !== 'list';
  }

  function openColumnDialog(opts) {
    const o = opts || {};
    editingId = o.edit ? o.edit.id : null;
    form.reset();
    ui.fieldError(document.getElementById('col-accounts'), '');
    const col = o.edit || {};
    form.elements.type.value = col.type || o.type || 'home';
    form.elements.accounts.value = col.accounts ? col.accounts.map((a) => '@' + a).join(', ') : (o.accounts || '');
    form.elements.listId.value = col.listId || data.lists[0].id;
    form.elements.title.value = col.title || '';
    document.getElementById('dialog-column-title').textContent = editingId ? 'Editar columna' : 'Añadir columna';
    document.getElementById('column-submit').textContent = editingId ? 'Guardar cambios' : 'Añadir columna';
    syncTypeFields();
    ui.openDialog(dialog);
    if (o.focusAccounts) setTimeout(() => form.elements.accounts.focus(), 10);
  }

  function onColumnSubmit(e) {
    e.preventDefault();
    const type = form.elements.type.value;
    const patch = { type };
    if (type === 'accounts') {
      const parsed = store.parseAccounts(form.elements.accounts.value);
      if (parsed.error) {
        ui.fieldError(form.elements.accounts, parsed.error);
        form.elements.accounts.focus();
        return;
      }
      ui.fieldError(form.elements.accounts, '');
      patch.accounts = parsed.accounts;
    }
    if (type === 'list') patch.listId = form.elements.listId.value;
    patch.title = form.elements.title.value.trim() || defaultTitle(type, patch.accounts || [], patch.listId);

    ui.closeDialog(dialog);
    if (editingId) {
      store.updateColumn(editingId, patch);
      ui.toast('La columna «' + patch.title + '» se actualizó.', { title: 'Cambios guardados' });
      return;
    }
    const col = store.addColumn(patch);
    const count = store.postsForColumn(col).length;
    ui.toast(utils.plural(count, 'publicación de muestra coincide', 'publicaciones de muestra coinciden') + ' con los filtros actuales.', { title: 'Columna «' + col.title + '» añadida' });
    requestAnimationFrame(() => {
      const el = board.querySelector('[data-col="' + col.id + '"]');
      if (el) { el.scrollIntoView({ behavior: 'smooth', inline: 'end', block: 'nearest' }); el.querySelector('[data-role="search"]').focus({ preventScroll: true }); }
    });
  }

  // --- Eventos --------------------------------------------------------------------
  function onClick(e) {
    const btn = e.target.closest('[data-action], [data-goto]');
    if (!btn) return;
    if (btn.dataset.goto) {
      const el = board.querySelector('[data-col="' + btn.dataset.goto + '"]');
      if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      return;
    }
    const colEl = btn.closest('[data-col]');
    const id = colEl ? colEl.dataset.col : null;
    const col = id ? store.state.columns.find((c) => c.id === id) : null;
    switch (btn.dataset.action) {
      case 'add': openColumnDialog(); break;
      case 'select-all': if (!store.allSelected()) store.toggleAll(); break;
      case 'clear-search': store.updateColumn(id, { query: '' }, 'column:' + id); colEl.querySelector('[data-role="search"]').value = ''; colEl.querySelector('[data-role="search"]').focus(); break;
      case 'left': case 'right': {
        store.moveColumn(id, btn.dataset.action === 'left' ? -1 : 1);
        const moved = board.querySelector('[data-col="' + id + '"] [data-action="' + btn.dataset.action + '"]');
        const target = moved && !moved.disabled ? moved : board.querySelector('[data-col="' + id + '"] [data-action="edit"]');
        if (target) target.focus();
        break;
      }
      case 'edit': openColumnDialog({ edit: col }); break;
      case 'remove': {
        const index = store.state.columns.indexOf(col);
        store.removeColumn(id);
        ui.toast('Se quitó la columna «' + col.title + '».', { title: 'Columna eliminada', action: { label: 'Deshacer', onClick: () => store.restoreColumn(col, index) } });
        break;
      }
      case 'mention': openColumnDialog({ type: 'accounts', accounts: '@' + btn.dataset.handle, focusAccounts: true }); break;
    }
  }

  function onInput(e) {
    const input = e.target.closest('[data-role="search"]');
    if (!input) return;
    const id = input.closest('[data-col]').dataset.col;
    store.updateColumn(id, { query: input.value }, 'column:' + id);
  }

  function init() {
    root = document.getElementById('view-inicio');
    dialog = document.getElementById('dialog-column');
    form = document.getElementById('form-column');

    document.getElementById('col-list').innerHTML = data.lists.map((l) => '<option value="' + esc(l.id) + '">' + esc(l.name) + ' (' + l.members.length + ' cuentas)</option>').join('');
    // Sugerencias: cuentas que aparecen mencionadas en los datos de muestra.
    const counts = {};
    store.allPosts().forEach((p) => p.mentions.forEach((m) => { counts[m] = (counts[m] || 0) + 1; }));
    const brandHandles = store.brands().map((b) => b.handle);
    const top = Object.keys(counts).filter((h) => brandHandles.indexOf(h) === -1).sort((a, b) => counts[b] - counts[a]).slice(0, 5);
    document.getElementById('account-suggestions').innerHTML = top.map((h) => '<button type="button" class="suggest-chip" data-suggest="' + esc(h) + '">@' + esc(h) + '</button>').join(' ');

    form.addEventListener('change', (e) => { if (e.target.name === 'type') syncTypeFields(); });
    form.addEventListener('submit', onColumnSubmit);
    form.addEventListener('click', (e) => {
      const s = e.target.closest('[data-suggest]');
      if (!s) return;
      const input = form.elements.accounts;
      const current = input.value.split(',').map((v) => v.trim()).filter(Boolean);
      if (current.map((v) => v.replace(/^@/, '').toLowerCase()).indexOf(s.dataset.suggest) === -1) current.push('@' + s.dataset.suggest);
      input.value = current.join(', ');
      ui.fieldError(input, '');
      input.focus();
    });

    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    document.addEventListener('click', (e) => { if (e.target.closest('#add-column')) openColumnDialog(); });

    store.subscribe((scope) => {
      if (scope === 'columns' || scope === 'all') renderBoard();
      else if (scope === 'brands') renderAllFeeds();
      else if (scope && scope.indexOf('column:') === 0) renderFeed(scope.slice(7));
    });
    renderBoard();
  }

  return {
    init,
    title: 'Inicio',
    subtitle: () => utils.plural(store.state.columns.length, 'columna', 'columnas') + ' · feeds de muestra desplazables',
    actions: () => '<button type="button" class="btn btn--primary" id="add-column">' + ui.icon('plus') + '<span>Añadir columna</span></button>',
    refreshTimes: renderAllFeeds
  };
})();
