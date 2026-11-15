/* MultiDeck 2.0 · Barra de filtro de marcas (multiselección + Todo/Nada) */
window.MD = window.MD || {};

MD.brandsView = (function () {
  const { store, ui, utils } = MD;
  const { esc } = utils;
  let bar, dialog, form;

  function render() {
    const all = store.brands();
    const active = store.selectedBrands().length;
    const allOn = store.allSelected();
    const status = active === 0 ? 'Ninguna marca activa' : active === all.length ? 'Todas activas · ' + active + ' de ' + all.length : active + ' de ' + all.length + ' activas';

    bar.innerHTML =
      '<div class="brandbar__label">' +
        '<span class="brandbar__title" id="brandbar-title">Marcas</span>' +
        '<span class="count-pill' + (active === 0 ? ' count-pill--empty' : '') + '" aria-live="polite">' + esc(status) + '</span>' +
      '</div>' +
      '<div class="brandbar__chips" role="group" aria-labelledby="brandbar-title">' +
        all.map((b) => {
          const on = store.isSelected(b.id);
          return '<button type="button" class="brand-chip' + (on ? ' is-on' : '') + '" style="--brand:' + esc(b.color) + '" aria-pressed="' + on + '" data-brand="' + esc(b.id) + '" title="' + esc(b.tagline) + '">' +
            '<span class="brand-chip__check" aria-hidden="true">' + ui.icon('check') + '</span>' +
            esc(b.name) + (b.custom ? '<span class="brand-chip__local">local</span>' : '') +
          '</button>';
        }).join('') +
      '</div>' +
      '<div class="brandbar__actions">' +
        // Etiqueta dinámica: "Nada" con todas activas; "Todo" en cualquier otro caso.
        '<button type="button" class="btn btn--sm btn--outline" id="brand-toggle-all" aria-label="' + (allOn ? 'Nada: desmarcar todas las marcas' : 'Todo: seleccionar todas las marcas') + '">' + (allOn ? 'Nada' : 'Todo') + '</button>' +
        '<button type="button" class="btn btn--sm btn--ghost" id="brand-add">' + ui.icon('plus') + '<span>Añadir marca</span></button>' +
      '</div>';
  }

  function renderLocalBrands() {
    const wrap = document.getElementById('local-brands');
    const locals = store.state.customBrands;
    if (!locals.length) { wrap.innerHTML = ''; return; }
    wrap.innerHTML = '<h3>Marcas locales</h3><ul>' + locals.map((b) =>
      '<li>' + ui.brandTag(b) + '<span class="muted">@' + esc(b.handle) + '</span>' +
      '<button type="button" class="btn btn--sm btn--ghost" data-remove-brand="' + esc(b.id) + '">Quitar</button></li>'
    ).join('') + '</ul>';
  }

  function openAdd() {
    form.reset();
    ['brand-name', 'brand-handle'].forEach((id) => ui.fieldError(document.getElementById(id), ''));
    renderLocalBrands();
    ui.openDialog(dialog);
  }

  function onSubmit(e) {
    e.preventDefault();
    const nameEl = document.getElementById('brand-name');
    const handleEl = document.getElementById('brand-handle');
    ui.fieldError(nameEl, ''); ui.fieldError(handleEl, '');
    const result = store.addBrand(nameEl.value, handleEl.value);
    if (result.error) {
      const target = result.field === 'handle' ? handleEl : nameEl;
      ui.fieldError(target, result.error);
      target.focus();
      return;
    }
    ui.closeDialog(dialog);
    ui.toast('Se generaron publicaciones de ejemplo para @' + result.brand.handle + '. Es una marca local de demostración.', { title: result.brand.name + ' añadida' });
  }

  function init() {
    bar = document.getElementById('brandbar');
    dialog = document.getElementById('dialog-brand');
    form = document.getElementById('form-brand');

    bar.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-brand]');
      if (chip) { store.toggleBrand(chip.dataset.brand); focusAfter('[data-brand="' + chip.dataset.brand + '"]'); return; }
      if (e.target.closest('#brand-toggle-all')) { store.toggleAll(); focusAfter('#brand-toggle-all'); return; }
      if (e.target.closest('#brand-add')) openAdd();
    });

    form.addEventListener('submit', onSubmit);
    dialog.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-remove-brand]');
      if (!rm) return;
      const brand = store.brandById(rm.dataset.removeBrand);
      store.removeBrand(rm.dataset.removeBrand);
      renderLocalBrands();
      ui.toast('Se quitó ' + brand.name + ' y su contenido de ejemplo.', { title: 'Marca local eliminada' });
    });

    store.subscribe((scope) => { if (scope === 'brands' || scope === 'all') render(); });
    render();
  }

  // Mantiene el foco del teclado tras volver a pintar la barra.
  function focusAfter(selector) {
    const el = bar.querySelector(selector);
    if (el) el.focus();
  }

  return { init, render };
})();
