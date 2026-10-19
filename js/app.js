/* MultiDeck 2.0 · Arranque, navegación y elementos globales */
(function () {
  const { store, ui, utils } = MD;
  const VIEWS = {
    inicio: MD.homeView,
    bandeja: MD.inboxView,
    calendario: MD.calendarView,
    analitica: MD.analyticsView
  };

  function fillIcons(scope) {
    (scope || document).querySelectorAll('[data-icon]').forEach((el) => {
      if (el.dataset.iconDone) return;
      el.insertAdjacentHTML('afterbegin', ui.icon(el.dataset.icon));
      el.dataset.iconDone = '1';
    });
  }

  function updateChrome() {
    const view = store.state.view;
    const v = VIEWS[view];
    document.getElementById('view-title').textContent = v.title;
    document.getElementById('view-subtitle').textContent = v.subtitle();
    document.getElementById('view-actions').innerHTML = v.actions();
    document.title = v.title + ' · MultiDeck 2.0 (demostración)';
    const unread = store.unreadCount();
    const badge = document.getElementById('nav-unread');
    badge.hidden = unread === 0;
    badge.textContent = unread;
    badge.setAttribute('aria-label', utils.plural(unread, 'conversación sin leer', 'conversaciones sin leer'));
  }

  function show(view, opts) {
    if (!VIEWS[view]) view = 'inicio';
    if (store.state.view !== view) store.setView(view);
    Object.keys(VIEWS).forEach((k) => { document.getElementById('view-' + k).hidden = k !== view; });
    document.querySelectorAll('.nav__item').forEach((a) => {
      const on = a.dataset.view === view;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.body.dataset.view = view;
    updateChrome();
    if (VIEWS[view].onShow) VIEWS[view].onShow();
    if (opts && opts.focus) document.getElementById('main').focus({ preventScroll: true });
  }

  function viewFromHash() { return (location.hash || '').replace('#', ''); }

  function init() {
    fillIcons();
    MD.brandsView.init();
    Object.keys(VIEWS).forEach((k) => VIEWS[k].init());

    if (!store.persistent) {
      document.getElementById('persist-note').textContent = '· El almacenamiento local no está disponible: los cambios durarán solo esta sesión.';
    }

    // Diálogos: botones de cierre y clic en el fondo.
    document.querySelectorAll('dialog').forEach((d) => {
      fillIcons(d);
      d.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]') || e.target === d) ui.closeDialog(d);
      });
    });

    document.getElementById('reset-demo').addEventListener('click', () => {
      if (!window.confirm('¿Restablecer la demostración? Se borrarán las columnas, marcas locales y publicaciones que hayas añadido en este navegador.')) return;
      store.reset();
      show('inicio');
      ui.toast('La demostración volvió a su estado inicial.', { title: 'Demo restablecida' });
    });

    window.addEventListener('hashchange', () => show(viewFromHash(), { focus: true }));
    store.subscribe(() => updateChrome());

    const initial = VIEWS[viewFromHash()] ? viewFromHash() : store.state.view;
    if (location.hash.replace('#', '') !== initial) history.replaceState(null, '', '#' + initial);
    show(initial);

    // Actualiza los tiempos relativos ("hace 5 min") cada minuto.
    setInterval(() => { if (store.state.view === 'inicio') MD.homeView.refreshTimes(); }, 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
