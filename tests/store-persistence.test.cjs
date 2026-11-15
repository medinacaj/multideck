const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'multideck-2', 'js', 'store.js'), 'utf8');

function build({ failWrites = false, failReads = false, noStorage = false, initialSaved } = {}) {
  const items = new Map();
  if (initialSaved !== undefined) items.set('multideck2.demo.v1', JSON.stringify(initialSaved));
  const localStorage = {
    setItem(key, value) {
      if (failWrites && key !== '__md_probe__') throw new Error('QuotaExceededError');
      items.set(key, String(value));
    },
    getItem(key) {
      if (failReads) throw new Error('SecurityError');
      return items.get(key) ?? null;
    },
    removeItem(key) { items.delete(key); }
  };
  const window = { MD: null };
  if (noStorage) {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } });
  } else {
    window.localStorage = localStorage;
  }
  const MD = {
    data: {
      BRAND_PALETTE: ['#123456', '#abcdef'],
      brands: [{ id: 'demo', name: 'Marca demo', handle: 'demo', color: '#123456' }],
      scheduled: [], posts: [], conversations: [], channels: [], lists: [], customBrandTemplates: []
    },
    utils: {}
  };
  window.MD = MD;
  vm.runInNewContext(source, { window, MD }, { filename: 'store.js' });
  return { store: MD.store, items, localStorage };
}

test('guarda cambios correctamente cuando localStorage permite escribir', () => {
  const { store, items } = build();
  assert.equal(store.persistent, true);
  store.setView('bandeja');
  assert.equal(JSON.parse(items.get('multideck2.demo.v1')).view, 'bandeja');
  assert.equal(store.persistent, true);
});

test('un fallo tardío de cuota cambia el estado y conserva cambios solo en memoria', () => {
  const { store, items } = build({ failWrites: true });
  assert.equal(store.persistent, true, 'el probe inicial tiene éxito');
  let observed;
  store.subscribe(() => { observed = store.persistent; });
  store.setView('calendario');
  assert.equal(observed, false, 'los observadores deben detectar el error en la misma acción');
  assert.equal(store.persistent, false);
  assert.equal(store.state.view, 'calendario');
  store.setView('bandeja');
  assert.equal(store.state.view, 'bandeja');
  assert.equal(items.has('multideck2.demo.v1'), false, 'no fingir que se guardó');
});

test('almacenamiento deshabilitado mantiene funcional la demo con aviso de no persistencia', () => {
  const { store } = build({ noStorage: true });
  assert.equal(store.persistent, false);
  store.setView('analitica');
  assert.equal(store.state.view, 'analitica');
  store.reset();
  assert.equal(store.state.view, 'inicio');
  assert.equal(store.persistent, false);
});

test('si falla la lectura tras un probe exitoso no se anuncia persistencia', () => {
  const { store } = build({ failReads: true });
  assert.equal(store.persistent, false);
  store.setView('bandeja');
  assert.equal(store.state.view, 'bandeja');
});

test('estado guardado corrupto se recupera sin perder columnas o marcas válidas', () => {
  const saved = JSON.parse(JSON.stringify({
    version: 1,
    view: 'invalid-view',
    columns: [null, { id: 'ok', type: 'accounts', title: 'Guardada', accounts: ['autor_demo'] },
      { id: 'invalid', type: 'broken' }],
    customBrands: [null, { id: 'local-alfa', name: 'Alfa', handle: 'alfa', color: '#abcdef' }],
    selectedBrands: ['demo', null, 'demo', 'local-alfa'],
    scheduled: [null, { id: 'bad', brand: 'demo', at: 'not-a-date' }],
    unread: null,
    inboxFilter: 'invalid',
    analyticsRange: -100
  }));
  Object.defineProperty(saved, '__proto__', { value: { injected: 'should-not-be-inherited' }, enumerable: true });
  const { store } = build({ initialSaved: saved });
  assert.equal(store.state.injected, undefined, 'no deben heredarse claves de prototipo desde JSON');
  assert.equal(store.state.view, 'inicio');
  assert.equal(store.state.columns.length, 1);
  assert.equal(store.state.columns[0].title, 'Guardada');
  assert.equal(store.state.columns[0].query, '');
  assert.equal(store.state.customBrands.length, 1);
  assert.equal(store.state.selectedBrands.length, 2);
  assert.equal(store.state.scheduled.length, 0);
  assert.equal(store.state.inboxFilter, 'all');
  assert.equal(store.state.analyticsRange, 14);
  assert.doesNotThrow(() => store.conversations());
  assert.doesNotThrow(() => store.postsForColumn(store.state.columns[0]));
  assert.doesNotThrow(() => store.scheduledVisible());
});
