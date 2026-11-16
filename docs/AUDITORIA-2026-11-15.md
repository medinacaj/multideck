# Auditoría MultiDeck — 15/11/2026

**Alcance:** demo estática de redes sociales; marcas, cuentas, cifras y mensajes ficticios. Sin backend, redes externas ni autenticación. Fuente y despliegue desde la rama predeterminada `claude/intelligent-cray-7r5z52`.

| Control | Estado | Evidencia y límite |
|---|---|---|
| Alcance/identidad y rutas | Verificado en código | `README.md`, `index.html`, cinco módulos de vistas; cuatro secciones principales |
| Demo y privacidad | Verificado en Chromium | Aviso explícito, CSP sin conexiones; test rechaza solicitudes de terceros |
| Estado y almacenamiento | Verificado en Node y Chromium | `tests/store-persistence.test.cjs`, persistencia tras recarga y aviso sin almacenamiento |
| Teclado, diálogo, filtros y reinicio | Verificado con Chromium tras CI | `tests/browser-qa.py`: skip-link, cuatro vistas, Todo/Nada, marca local, foco y confirmación de reset |
| Responsive | Verificado con Chromium tras CI | 320/390/768/1280 px sin desbordamiento de documento |
| Publicación desde raíz | CI Pages aprobada | PR #9; [Pages run 43725975181](https://github.com/medinacaj/multideck/actions/runs/43725975181) |
| Autenticación/roles, pagos, base de datos y SEO comercial | No aplicable | Producto no transaccional; contenido ficticio local |
| Contraste, lectores de pantalla, zoom, Safari/Android físico y Core Web Vitals | Pendiente | No afirmar WCAG 2.2 AA completo solo por Chromium |
| Licencias externas y reutilización comercial | Pendiente | Revisar recursos y atribuciones antes de comercializar |
| Protecciones del repositorio | Pendiente de permiso | La rama predeterminada figuraba `protected:false`; revisión de rulesets/administración requiere acceso autorizado |

**Resultado de la auditoría proporcional a la DEMO:** rutas, cinco vistas, persistencia, errores, datos ficticios, privacidad local, teclado básico, responsive y CI están inspeccionados y probados. Las materias no pertinentes a una demo estática (backend, cuentas reales, pagos, SEO comercial) se declaran No aplicables. El propio producto queda entregado como **demo funcional v1**, no plataforma comercial.

**Hallazgos diferidos a seguimiento específico (no conformidad declarada):** WCAG manual y dispositivos, licencia/atribución para reutilización o venta, protección de rama y reglas de revisión. No se certifica un lector de pantalla real ni se afirma que GitHub tenga reglas de protección vigentes. El issue general de auditoría #6 puede cerrarse **sólo como evaluación técnica realizada**, una vez enlazado el seguimiento específico; el producto continúa rotulado y limitado como DEMO.
