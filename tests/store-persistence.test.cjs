const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'multideck-2', 'js', 'store.js'), 'utf8');

function build({ failWrites = false, failReads = false, noStorage = false } = {}) {
  const items = new Map();
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
