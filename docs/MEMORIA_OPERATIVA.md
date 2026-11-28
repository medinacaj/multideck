# MultiDeck — memoria operativa vigente

**Última actualización:** 2026-11-28. **Fuente única de continuidad:** este repositorio (ver [`AGENTS.md`](../AGENTS.md), sección «Memoria y continuidad obligatorias»). El historial anterior queda en Git y en la bitácora; no es una instrucción activa.

## Orden para continuar

1. Leer este archivo, [DECISIONES.md](DECISIONES.md) y [CRITERIOS_FUNCIONALIDAD_REAL_Y_FIXTURES.md](CRITERIOS_FUNCIONALIDAD_REAL_Y_FIXTURES.md).
2. Contrastar con GitHub **en vivo**: rama predeterminada y su SHA, PR e issues abiertos, CI del último SHA. [ESTADO_GITHUB_AUTO.md](ESTADO_GITHUB_AUTO.md) es una instantánea que puede estar desactualizada.
3. Distinguir código fusionado, CI aprobada y despliegue verificado; no inventar pruebas ni porcentajes.
4. Ejecutar la **siguiente acción** registrada abajo o el bloqueo vigente. No reiniciar ni duplicar trabajo existente.
5. Al terminar: actualizar «Estado vigente» y «Siguiente acción», y añadir una entrada a la bitácora, en la misma rama/PR del cambio.

## Estado vigente (verificado 2026-11-28)

| Aspecto | Estado | Evidencia |
|---|---|---|
| Rama predeterminada | `claude/intelligent-cray-7r5z52` en `cb15e66` | `git ls-remote`, 2026-11-28 |
| Producto | **DEMO v1** completa: Inicio (columnas), Bandeja, Calendario con editor, Analítica, marcas con Todo/Nada | PR #11, [AUDITORIA-2026-11-15.md](AUDITORIA-2026-11-15.md) |
| Publicación | GitHub Pages desde la raíz: <https://medinacaj.github.io/multideck/> | Pages run 43725975181 (PR #9). **No verificada en vivo** el 2026-11-28: el entorno del agente no accede a `github.io` |
| Último cambio de app | `ea0ea6f` (PR #11, 2026-11-16) | `git log -- js css index.html` |
| CI en rama predeterminada | Browser QA: éxito, run 43783837534 (`ea0ea6f`). Integridad local: éxito, run 44596175854 (`0efc1b9`) | GitHub Actions |
| Fase operativa (#13) | **No iniciada**; bloqueada por autorizaciones del propietario | Issue #13 |

## Cambios pendientes y trabajo abierto

- **PR #16** (`docs/readme-continuidad-20261121`, `a290553`, sin fusionar): sección de continuidad en el README. Su contenido se integra en el PR de esta tarea; si se aprueba este, #16 puede cerrarse como sustituido (decisión del propietario).
- **Issue #13** [P0]: gestor social operativo con backend real. Bloqueo externo: elegir plataformas/API oficiales, credenciales de desarrollador, dominio y hosting. Sin esa autorización **no se implementan integraciones**.
- **Issue #12**: accesibilidad asistiva manual (VoiceOver/NVDA, zoom, dispositivos), decisión de licencia (no existe `LICENSE`) y protección de la rama predeterminada (`protected:false`).
- **Ramas de PR ya cerrados**, conservadas sin borrar: `feat/redirect-raiz` (#4), `feat/app-en-raiz` (#5, sustituido por #9), `governance/legal-tech-review-20261018` (#1), `chore/multi-ai-handoff-2026-10` (#2), `codex/*` (#7–#11), `chore/project-memory-sync-20261119` (#14), `docs/decentralized-continuity-20261120` (#15). Borrarlas requiere autorización del propietario.
- **Decisión pendiente:** renombrar la rama predeterminada (ver DECISIONES.md, «Hecho vigente»).

## Siguiente acción

1. **Propietario:** revisar y fusionar el PR de esta tarea; cerrar #16 si queda sustituido.
2. **Propietario, para desbloquear #13:** indicar qué plataformas/API, hosting y dominio se autorizan.
3. **Agente, si #13 sigue bloqueado:** avanzar la parte automatizable de #12: auditoría de contraste y zoom 200 % con Chromium sobre las cuatro vistas, con evidencia por SHA, en una rama y PR propios.

## Bitácora de sesiones

Formato obligatorio, una entrada por tarea y la más reciente arriba: **fecha · agente · tarea · rama/PR/SHA · pruebas (comando → resultado, entorno) · bloqueos · siguiente acción.**

- **2026-11-28 · Claude Code · Memoria y continuidad permanentes**
  - **Cambio:** obligaciones en `AGENTS.md`; registro fechado en `DECISIONES.md`; reestructuración de esta memoria; sección de continuidad en `README.md`. Rama `docs/memoria-continuidad-20261128`, base `cb15e66`.
  - **Pruebas:** contenedor Linux, Node 22, Python 3.13, Chromium 1243.
    - `node --check js/store.js && node --check js/app.js` → OK.
    - `node --test tests/*.test.cjs` → 5/5.
    - `python3 -m unittest discover -s tests -p 'test_project_memory.py'` → 2/2.
    - `python3 tests/browser-qa.py` con servidor local en el puerto 8765 → éxito. Se ejecutó con un envoltorio que fija `executable_path` al Chromium local, porque Playwright Python 1.56.0 espera otra compilación del navegador; el archivo de prueba no se modificó.
  - **No probado:** la URL publicada.
  - **Bloqueos:** #13 (autorizaciones) y #12 (acciones manuales del propietario).
  - **Siguiente acción:** la indicada arriba.
- **2026-11-20 · (PR #15) · Migración de la continuidad al repositorio del producto:** ver PR #15.
- **2026-11-15/16 · ChatGPT/Codex · Cierre de DEMO v1:** PR #7–#11, auditoría y QA Node/Chromium. Ver [AUDITORIA-2026-11-15.md](AUDITORIA-2026-11-15.md).
- **2026-10-17/19 · Claude Code · Creación de MultiDeck 2.0 y publicación:** commit `4bbdd0e`; Pages activado por el propietario; servida desde la raíz (#4, luego #9).

## Independencia

Ningún paso requiere consultar, sincronizar o actualizar un repositorio central de coordinación. Las decisiones explícitas posteriores del propietario prevalecen y se documentan en DECISIONES.md. Las acciones automáticas solo actualizan `ESTADO_GITHUB_AUTO.md`; no sobrescriben esta memoria ni inventan estados de producción.
