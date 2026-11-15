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
    assert response is not None
    page.wait_for_url("**/multideck-2/index.html*", timeout=15000)
    assert page.locator(".demo-banner").get_by_text("Datos de demostración").is_visible()

    for view, name in VIEWS.items():
        page.locator(f"a[data-view='{view}']").click()
        assert page.locator("#view-title").inner_text() == name, view
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
    check.goto(BASE + "multideck-2/index.html", wait_until="domcontentloaded", timeout=30000)
    assert check.locator("#view-title").inner_text() == "Inicio"
    assert "no se pudieron guardar" in check.locator("#persist-note").inner_text().lower()
    restricted.close()

    print("MultiDeck: four views, keyboard nav state, local storage and privacy verified at 320–1280 px")
    browser.close()
