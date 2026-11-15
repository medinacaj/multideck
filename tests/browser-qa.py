#!/usr/bin/env python3
"""MultiDeck demonstrator: real-browser QA without contacting social platforms."""
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8765/"
VIEWS = {"inicio": "Inicio", "bandeja": "Bandeja", "calendario": "Calendario", "analitica": "Analítica"}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    errors, requests = [], []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("request", lambda r: requests.append(r.url))
    response = page.goto(BASE, wait_until="domcontentloaded", timeout=30000)
    assert response is not None and response.status == 200
    assert urlparse(page.url).path in ("/", "/index.html"), "La aplicación debe abrir en la raíz, sin redirección de ruta"
    assert page.locator(".demo-banner").get_by_text("Datos de demostración").is_visible()
    assert not page.locator('meta[http-equiv="refresh"]').count(), "No se permite una redirección en la raíz"

    for view, name in VIEWS.items():
        page.locator(f"a[data-view='{view}']").click()
        page.wait_for_function("title => document.getElementById('view-title')?.textContent === title", arg=name, timeout=5000)
        assert page.locator("#view-" + view).is_visible(), view
        assert page.locator(f"a[data-view='{view}']").get_attribute("aria-current") == "page", view
        for width in (320, 390, 768, 1280):
            page.set_viewport_size({"width": width, "height": 844})
            overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
            assert overflow <= 2, ("page horizontal overflow", view, width, overflow)

    # Navigation choices survive a reload only in browser-local storage.
    page.reload(wait_until="domcontentloaded")
    assert page.locator("#view-title").inner_text() == "Analítica"
    assert page.evaluate("localStorage.getItem('multideck2.demo.v1') !== null")
    unexpected = [url for url in requests if urlparse(url).netloc != urlparse(BASE).netloc]
    assert not unexpected, ("remote connections from the demo", unexpected)
    assert not errors, ("browser JavaScript errors", errors)

    # Browser without localStorage still renders the demo, and warns that
    # unsaved changes will not persist across sessions.
    restricted = browser.new_context(viewport={"width": 390, "height": 844})
    restricted.add_init_script("""Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { throw new Error('Storage disabled by browser'); }
    });""")
    check = restricted.new_page()
    check.goto(BASE, wait_until="domcontentloaded", timeout=30000)
    assert check.locator("#view-title").inner_text() == "Inicio"
    assert "no se pudieron guardar" in check.locator("#persist-note").inner_text().lower()
    restricted.close()

    # Keyboard, brand filter and dialog behavior work without external accounts.
    page.goto(BASE, wait_until="domcontentloaded")
    page.keyboard.press("Tab")
    assert page.locator(".skip-link").evaluate("(el) => el === document.activeElement")
    page.keyboard.press("Enter")
    assert page.locator("#main").evaluate("(el) => el === document.activeElement")
    page.locator("#brand-toggle-all").click()
    assert page.locator("[data-brand][aria-pressed='true']").count() == 0
    assert page.locator(".count-pill").inner_text() == "Ninguna marca activa"
    page.locator("#brand-toggle-all").click()
    assert page.locator("[data-brand][aria-pressed='true']").count() >= 3

    page.locator("#brand-add").click()
    dialog = page.locator("#dialog-brand")
    assert dialog.is_visible()
    assert dialog.get_attribute("aria-labelledby") == "dialog-brand-title"
    page.locator("#brand-name").fill("Marca local de prueba")
    page.locator("#form-brand button[type='submit']").click()
    assert not dialog.is_visible()
    assert page.locator("[data-brand]").count() == 4
    page.locator("#brand-add").click()
    page.locator("#dialog-brand [data-close]").first.click()
    assert not dialog.is_visible()
    assert page.locator("#brand-add").evaluate("(el) => document.activeElement === el")

    page.once("dialog", lambda prompt: prompt.dismiss())
    page.locator("#reset-demo").click()
    assert page.locator("[data-brand]").count() == 4
    page.once("dialog", lambda prompt: prompt.accept())
    page.locator("#reset-demo").click()
    assert page.locator("[data-brand]").count() == 3

    print("MultiDeck: four views, keyboard/brands/dialogs, local storage, privacy and responsive verified")
    browser.close()
