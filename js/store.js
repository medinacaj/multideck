/*
 * MultiDeck 2.0 · Estado local de la demostración
 * Guarda preferencias y cambios en localStorage. Si no está disponible,
 * la app sigue funcionando con un almacén en memoria durante la sesión.
 */
window.MD = window.MD || {};

MD.store = (function () {
  const { data, utils } = MD;
  const KEY = 'multideck2.demo.v1';
  const MAX_BRANDS = data.BRAND_PALETTE.length;
  const MAX_ACCOUNTS = 8;
  const loadedAt = Date.now();

  // --- Persistencia tolerante a fallos -------------------------------------
  const storage = (function () {
    try {
      const probe = '__md_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return {
        persistent: true,
        get: () => window.localStorage.getItem(KEY),
        set: (v) => { try { window.localStorage.setItem(KEY, v); } catch (e) { /* cuota llena: seguimos en memoria */ } },
        clear: () => { try { window.localStorage.removeItem(KEY); } catch (e) { /* nada */ } }
      };
    } catch (e) {
      let mem = null;
      return { persistent: false, get: () => mem, set: (v) => { mem = v; }, clear: () => { mem = null; } };
    }
  })();

  function defaultColumns() {
    return [
      { id: 'col-inicio', type: 'home', title: 'Inicio', query: '' },
      { id: 'col-menciones', type: 'mentions', title: 'Menciones', query: '' },
      { id: 'col-cuentas', type: 'accounts', title: 'Aliados mencionados', query: '', accounts: ['nidia_ceramica', 'cooperativa_lomas', 'mercado_alto'] },
      { id: 'col-lista', type: 'list', title: 'Prensa y medios', query: '', listId: 'prensa' }
    ];
  }

  function seedScheduled() {
    const today = new Date();
    return data.scheduled.map((s) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + s.day);
      const [h, m] = s.time.split(':').map(Number);
      d.setHours(h, m, 0, 0);
      return { id: s.id, brand: s.brand, channel: s.channel, text: s.text, at: d.toISOString(), userCreated: false };
    });
  }

  function defaults() {
    return {
      version: 1,
      view: 'inicio',
      customBrands: [],
      selectedBrands: data.brands.map((b) => b.id),
      columns: defaultColumns(),
      unread: {},
      inboxFilter: 'all',
      scheduled: seedScheduled(),
      analyticsRange: 14
    };
  }

  function load() {
    try {
      const raw = storage.get();
      if (!raw) return defaults();
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1) return defaults();
      const base = defaults();
      const merged = Object.assign(base, parsed);
      if (!Array.isArray(merged.columns)) merged.columns = defaultColumns();
      if (!Array.isArray(merged.selectedBrands)) merged.selectedBrands = base.selectedBrands;
      if (!Array.isArray(merged.customBrands)) merged.customBrands = [];
      if (!Array.isArray(merged.scheduled)) merged.scheduled = seedScheduled();
      return merged;
    } catch (e) {
      return defaults();
    }
  }

  let state = load();
  const listeners = [];

  function save() { storage.set(JSON.stringify(state)); }

  function emit(scope) {
    save();
    listeners.forEach((fn) => fn(scope));
  }

  function subscribe(fn) { listeners.push(fn); }

  // --- Selectores -----------------------------------------------------------
  function brands() { return data.brands.concat(state.customBrands); }
  function brandById(id) { return brands().find((b) => b.id === id); }
  function isSelected(id) { return state.selectedBrands.indexOf(id) !== -1; }
  function selectedBrands() { return brands().filter((b) => isSelected(b.id)); }
  function channelName(id) { const c = data.channels.find((ch) => ch.id === id); return c ? c.name : id; }
  function listById(id) { return data.lists.find((l) => l.id === id); }

  function fill(str, brand) {
    return str.replace(/\{name\}/g, brand.name).replace(/\{handle\}/g, brand.handle);
  }

  // Publicaciones de ejemplo, incluidas las generadas para marcas añadidas localmente.
  function allPosts() {
    const generated = [];
    state.customBrands.forEach((b) => {
      data.customBrandTemplates.forEach((t, i) => {
        generated.push({
          id: 'gen-' + b.id + '-' + i, brand: b.id, kind: t.kind, channel: t.channel,
          author: fill(t.author, b), handle: fill(t.handle, b), ago: t.ago, text: fill(t.text, b), stats: [1 + i, 2 * i, 12 + i * 9]
        });
      });
    });
    return data.posts.concat(generated).map((p) => Object.assign({}, p, {
      date: new Date(loadedAt - p.ago * 60000),
      mentions: utils.extractMentions(p.text)
    })).sort((a, b) => b.date - a.date);
  }

  function matchesQuery(post, q) {
    if (!q) return true;
    const needle = utils.fold(q).trim();
    if (!needle) return true;
    return utils.fold(post.text + ' ' + post.author + ' @' + post.handle).indexOf(needle) !== -1;
  }

  function postsForColumn(col) {
    const list = col.type === 'list' ? listById(col.listId) : null;
    const accounts = (col.accounts || []).map((a) => a.toLowerCase());
    return allPosts().filter((p) => {
      if (!isSelected(p.brand)) return false;
      if (col.type === 'home' && p.kind !== 'post') return false;
      if (col.type === 'mentions' && p.kind !== 'mention') return false;
      if (col.type === 'accounts' && !p.mentions.some((m) => accounts.indexOf(m) !== -1)) return false;
      if (col.type === 'list' && (!list || list.members.indexOf(p.handle) === -1)) return false;
      return matchesQuery(p, col.query);
    });
  }

  function conversations() {
    const generated = state.customBrands.map((b) => ({
      id: 'gen-conv-' + b.id, brand: b.id, kind: 'mention', channel: 'breve', name: 'Ana Quiroga', handle: 'ana_quiroga', unread: true,
      messages: [{ from: 'them', ago: 95, text: 'Acabo de conocer a @' + b.handle + ' en la feria del barrio. ¡Qué buena propuesta!' }]
    }));
    return data.conversations.concat(generated).map((c) => {
      const messages = c.messages.map((m) => Object.assign({}, m, { date: new Date(loadedAt - m.ago * 60000) }));
      return Object.assign({}, c, {
        unread: Object.prototype.hasOwnProperty.call(state.unread, c.id) ? state.unread[c.id] : c.unread,
        messages,
        last: messages[messages.length - 1]
      });
    }).sort((a, b) => b.last.date - a.last.date);
  }

  function visibleConversations(filter) {
    return conversations().filter((c) => {
      if (!isSelected(c.brand)) return false;
      if (filter === 'mentions') return c.kind === 'mention';
      if (filter === 'unread') return c.unread;
      return true;
    });
  }

  function unreadCount() {
    return conversations().filter((c) => c.unread && isSelected(c.brand)).length;
  }

  function scheduledVisible() {
    return state.scheduled
      .filter((s) => isSelected(s.brand) && brandById(s.brand))
      .map((s) => Object.assign({}, s, { date: new Date(s.at) }))
      .sort((a, b) => a.date - b.date);
  }

  // --- Acciones ---------------------------------------------------------------
  function setView(view) { state.view = view; emit('view'); }

  function toggleBrand(id) {
    state.selectedBrands = isSelected(id) ? state.selectedBrands.filter((b) => b !== id) : state.selectedBrands.concat(id);
    emit('brands');
  }

  function allSelected() { return brands().every((b) => isSelected(b.id)); }

  // Todo/Nada: si están todas, desmarca todas; si no, selecciona todas.
  function toggleAll() {
    state.selectedBrands = allSelected() ? [] : brands().map((b) => b.id);
    emit('brands');
  }

  function validateBrand(name, handle) {
    const clean = String(name || '').trim();
    const h = String(handle || '').trim().replace(/^@/, '');
    if (!clean) return { error: 'Escribe un nombre para la marca.', field: 'name' };
    if (clean.length > 30) return { error: 'El nombre puede tener hasta 30 caracteres.', field: 'name' };
    if (brands().length >= MAX_BRANDS) return { error: 'La demostración admite hasta ' + MAX_BRANDS + ' marcas.', field: 'name' };
    if (brands().some((b) => utils.fold(b.name) === utils.fold(clean))) return { error: 'Ya existe una marca con ese nombre.', field: 'name' };
    const finalHandle = (h || utils.slug(clean).replace(/-/g, '')).toLowerCase();
    if (!/^[a-z0-9_]{2,30}$/.test(finalHandle)) return { error: 'El @usuario solo admite letras sin tilde, números y guion bajo (2 a 30 caracteres).', field: 'handle' };
    if (brands().some((b) => b.handle === finalHandle)) return { error: 'Ese @usuario ya pertenece a otra marca.', field: 'handle' };
    return { name: clean, handle: finalHandle };
  }

  function addBrand(name, handle) {
    const v = validateBrand(name, handle);
    if (v.error) return v;
    const used = brands().map((b) => b.color);
    const color = data.BRAND_PALETTE.find((c) => used.indexOf(c) === -1) || data.BRAND_PALETTE[0];
    let id = 'local-' + utils.slug(v.name);
    while (brandById(id)) id += '-x';
    const brand = { id, name: v.name, handle: v.handle, color, tagline: 'Marca local de demostración', custom: true };
    state.customBrands = state.customBrands.concat(brand);
    state.selectedBrands = state.selectedBrands.concat(id);
    emit('brands');
    return { brand };
  }

  function removeBrand(id) {
    state.customBrands = state.customBrands.filter((b) => b.id !== id);
    state.selectedBrands = state.selectedBrands.filter((b) => b !== id);
    state.scheduled = state.scheduled.filter((s) => s.brand !== id);
    emit('brands');
  }

  // Normaliza "@a, b ,@c" -> ['a','b','c'] y valida hasta ocho cuentas.
  function parseAccounts(input) {
    const raw = String(input || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (!raw.length) return { error: 'Indica al menos un @usuario.' };
    const invalid = raw.filter((s) => !/^@?[A-Za-z0-9_]{1,30}$/.test(s));
    if (invalid.length) return { error: 'Revisa estos usuarios: ' + invalid.join(', ') + '. Usa letras sin tilde, números o guion bajo.' };
    const unique = [];
    raw.forEach((s) => { const h = s.replace(/^@/, '').toLowerCase(); if (unique.indexOf(h) === -1) unique.push(h); });
    if (unique.length > MAX_ACCOUNTS) return { error: 'Puedes indicar hasta ocho cuentas por columna (escribiste ' + unique.length + ').' };
    return { accounts: unique };
  }

  function addColumn(col) {
    const column = Object.assign({ id: utils.uid('col'), query: '' }, col);
    state.columns = state.columns.concat(column);
    emit('columns');
    return column;
  }

  function updateColumn(id, patch, scope) {
    state.columns = state.columns.map((c) => (c.id === id ? Object.assign({}, c, patch) : c));
    emit(scope || 'columns');
  }

  function removeColumn(id) {
    state.columns = state.columns.filter((c) => c.id !== id);
    emit('columns');
  }

  function restoreColumn(col, index) {
    const cols = state.columns.slice();
    cols.splice(Math.min(index, cols.length), 0, col);
    state.columns = cols;
    emit('columns');
  }

  function moveColumn(id, delta) {
    const i = state.columns.findIndex((c) => c.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= state.columns.length) return;
    const cols = state.columns.slice();
    const tmp = cols[i]; cols[i] = cols[j]; cols[j] = tmp;
    state.columns = cols;
    emit('columns');
  }

  function setUnread(id, value) {
    state.unread = Object.assign({}, state.unread, { [id]: value });
    emit('inbox');
  }

  function markRead(ids) {
    const next = Object.assign({}, state.unread);
    ids.forEach((id) => { next[id] = false; });
    state.unread = next;
    emit('inbox');
  }

  function setInboxFilter(f) { state.inboxFilter = f; emit('inbox'); }

  function addScheduled(item) {
    const entry = Object.assign({ id: utils.uid('sch'), userCreated: true }, item);
    state.scheduled = state.scheduled.concat(entry);
    emit('calendar');
    return entry;
  }

  function removeScheduled(id) {
    state.scheduled = state.scheduled.filter((s) => s.id !== id);
    emit('calendar');
  }

  function setAnalyticsRange(n) { state.analyticsRange = n; emit('analytics'); }

  function reset() {
    storage.clear();
    state = defaults();
    emit('all');
  }

  return {
    get state() { return state; },
    persistent: storage.persistent,
    loadedAt, MAX_ACCOUNTS, MAX_BRANDS,
    subscribe, brands, brandById, isSelected, selectedBrands, allSelected, channelName, listById,
    allPosts, postsForColumn, conversations, visibleConversations, unreadCount, scheduledVisible,
    setView, toggleBrand, toggleAll, addBrand, removeBrand, validateBrand, parseAccounts,
    addColumn, updateColumn, removeColumn, restoreColumn, moveColumn, setUnread, markRead, setInboxFilter,
    addScheduled, removeScheduled, setAnalyticsRange, reset
  };
})();
