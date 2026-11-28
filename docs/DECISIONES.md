# MultiDeck — decisiones y límites del producto

**Fuente de verdad:** decisiones de este archivo → issues/ADR del producto → PR, commit y pruebas GitHub del propio repositorio. **Actualizado:** 2026-11-28 (registro fechado añadido). Las notas anteriores se conservan como historia, no se presumen vigentes.

## Decisiones específicas

- **[CONFIRMADO]** El hito **DEMO v1** no implica integración social real ni producto operativo final.
- **[PENDIENTE/REVISAR]** Comprobar las integraciones, autenticación, flujos reales y el issue #13 antes de declarar el producto terminado.
- Respetar la rama predeterminada efectiva del repositorio, aunque no se llame main, y conservar los flujos existentes.

## Registro de decisiones confirmadas

Cada fila es una decisión del propietario con fuente verificable. Para cambiar una, añadir una fila nueva que la reemplace (indicando cuál) en lugar de borrar la anterior.

| ID | Fecha | Decisión | Fuente |
|---|---|---|---|
| D-01 | 2026-10-17 | App web en español, HTML/CSS/JS nativo sin frameworks, backend ni dependencias; datos ficticios, sin llamadas de red, sin credenciales ni conexión a redes reales; estado en `localStorage` con respaldo en memoria. | Encargo inicial; commit `4bbdd0e` |
| D-02 | 2026-10-17 | Estética cálida y editorial (marfil, carbón, terracota; serif en títulos y publicaciones), adaptable a escritorio y móvil, y aviso permanente «Datos de demostración · Sin conexión a redes sociales». | Encargo inicial; `index.html`, `css/styles.css` |
| D-03 | 2026-10-19 | Publicación en GitHub Pages con *Deploy from a branch* desde la rama predeterminada, carpeta raíz. Revierte la indicación inicial de no publicar. | Configuración realizada por el propietario; PR #4 |
| D-04 | 2026-10-19 | La app se sirve en la raíz (`https://medinacaj.github.io/multideck/`) **sin redirección**; se elimina `multideck-2/`. | Instrucción del propietario; PR #9 (sustituye a #5) |
| D-05 | 2026-10-19 | Flujo multi-IA: rama nueva por tarea, PR con SHA y pruebas, sin editar ni fusionar la rama predeterminada por cuenta propia; la fusión la decide el propietario. | `docs/agent-workflow.md`, PR #1 y #2 |
| D-06 | 2026-11-15 | DEMO v1 es un hito de interfaz, no un producto operativo; la fase operativa (#13) requiere autorizaciones del propietario antes de implementarse. | Issues #12 y #13, PR #11 |
| D-07 | 2026-11-20 | La continuidad reside en este repositorio, sin dependencia de `medinacaj/ai-project-control`. | PR #15 |
| D-08 | 2026-11-28 | Memoria y continuidad obligatorias para todo agente (recuperar contexto, no duplicar, actualizar memoria con pruebas, bloqueos y siguiente acción). | Instrucción del propietario; sección de `AGENTS.md` |
| D-09 | 2026-10-19 | Idioma de trabajo y de respuesta al propietario: español. | Instrucción del propietario |

**Hecho vigente, no decisión:** la rama predeterminada se llama `claude/intelligent-cray-7r5z52` porque fue la primera rama subida al repositorio vacío. Renombrarla (por ejemplo a `main`) queda **pendiente de decisión del propietario**; hasta entonces todo flujo debe usar el nombre real.

## Criterios obligatorios del producto

- **[NO MODIFICAR]** Conservar fixtures y datos ficticios útiles. Los escenarios sintéticos y los mecanismos de reset deben quedar aislados de producción.
- **[NO MODIFICAR]** No presentar DEMO ni GitHub Actions/CI satisfactoria como prueba de despliegue, funcionamiento en hosting o autorización comercial.
- Para datos mutables, exigir UI funcional, API con permisos, persistencia real, errores, pruebas y auditoría según el riesgo; no sustituir procesos reales por botones decorativos.
- Separar desarrollo, staging y producción; verificar identidades de bases antes de ejecutar migraciones o limpiezas. Respaldos/restauración y rollback cuando corresponda.
- Reutilizar módulos existentes y registrar pruebas, SHA, entorno efectivamente verificado, pendientes y siguiente acción.
- No exponer credenciales, datos reales de clientes ni información privada en documentación pública.
- Las decisiones confirmadas se modifican solo mediante nueva instrucción expresa del propietario y registro revisado **en este repositorio**. El snapshot automático no puede cambiarlas.

## Independencia operativa

La continuidad de MultiDeck reside en este repositorio. La memoria local y `docs/ESTADO_GITHUB_AUTO.md` se consultan aquí, y este último puede estar desactualizado. No se exige leer, actualizar ni sincronizar `medinacaj/ai-project-control`. Las decisiones históricas de ese centro se migran por revisión humana, sin sobrescribir este archivo automáticamente.
