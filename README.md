# MultiDeck 2.0 · Demostración

Panel de gestión de redes sociales con columnas al estilo deck, en español.
**Todo es de demostración:** marcas, cuentas, publicaciones, mensajes, calendario y cifras son inventados.
La app no se conecta a ninguna red social, no hace llamadas de red y no publica ni envía nada.

## Estado de entrega: DEMO v1 funcional (15/11/2026)

**Hito técnico completo para el alcance de demostración estática.** La web publicada sirve desde la raíz y permite usar Inicio, Bandeja, Calendario, Analítica, gestión de marcas ficticias y estado local. Las pruebas Node y Chromium comprobaron navegación, teclado básico, persistencia y errores de almacenamiento, filtros, diálogos y responsive de 320 a 1280 px. Los flujos no contactan servicios terceros; el sitio no tiene backend, cuentas, pagos ni publicación real en redes.

**No es una plataforma de redes sociales comercial ni una auditoría completa WCAG.** Para conectar cuentas reales, habilitar roles, programar publicaciones o enviar mensajes se necesita **otro alcance de producto**. Quedan como pendientes de mantenimiento: comprobación manual de lectores de pantalla/Safari/Android/zoom, decisión de licencia del código para reutilización y protección de rama según permisos del repositorio. Esos puntos no impiden usar la demo estática para revisar UX, pero sí impiden afirmar seguridad/compatibilidad comercial o licenciamiento de terceros.

**Criterio de mantenimiento:** cualquier cambio del código debe pasar suites Node y Chromium en PR y en la rama principal. No usar los datos ficticios para tomar decisiones comerciales.

## Cómo iniciarla

Sin dependencias ni compilación. Desde la raíz del repositorio:

```bash
python3 -m http.server 8080
# o bien: npx serve .
```

Abre <http://localhost:8080>. La versión publicada está en <https://medinacaj.github.io/multideck/>. También funciona abriendo `index.html` directamente en el navegador.

## Qué incluye

- **Inicio:** tablero horizontal de columnas (Inicio, Menciones, Menciones de cuentas, Listas) con búsqueda local,
  estados vacíos y opciones para añadir, editar, mover y quitar columnas (con deshacer). Al pulsar una @mención se
  abre una columna de menciones de esa cuenta.
- **Marcas:** Tierra Sur, Lumbre Studio y Casa Nativa, con multiselección, contador de marcas activas y botón
  **Todo/Nada**. Puedes añadir hasta seis marcas locales. Cero marcas es un estado válido.
- **Bandeja:** conversaciones ficticias con filtros Todas / Menciones / No leídas y marcado de leído/no leído.
- **Calendario:** vista mensual, agenda del día y editor con validación en español. Lo programado solo existe en este navegador.
- **Analítica:** cifras y gráficos ilustrativos generados localmente que responden al filtro de marcas y al periodo.

Las preferencias y cambios se guardan en `localStorage` (clave `multideck2.demo.v1`). Si no está disponible,
la app funciona en memoria durante la sesión. «Restablecer demo», en la barra lateral, vuelve al estado inicial.

## Estructura

```
index.html          Estructura, diálogos y aviso de demostración
css/styles.css      Estilos (tokens de color, diseño adaptable)
js/data.js          Datos ficticios
js/utils.js         Utilidades (búsqueda sin tildes, fechas, formato)
js/store.js         Estado, persistencia y acciones
js/ui.js            Iconos, avisos y diálogos
js/views/*.js       Marcas, Inicio, Bandeja, Calendario y Analítica
js/app.js           Arranque y navegación
```


## Migración desde la subcarpeta antigua

Desde noviembre de 2026 la demo se sirve directamente en la raíz. `/multideck-2/` dejó de ser una ruta publicada; reemplaza los marcadores de esa dirección por `/multideck/`. La clave de `localStorage` (`multideck2.demo.v1`) no cambia y conserva los datos del mismo origen.

Las pruebas de navegador (`tests/browser-qa.py`) y de persistencia (`tests/store-persistence.test.cjs`) se ejecutan en PR; la aplicación sigue siendo una demo sin integraciones externas.

## Continuidad y estado verificable · 21/11/2026

**Propósito:** Demo estática de gestión de redes sociales.

**Límite del alcance:** No hay integración ni publicación en redes reales.

- **Código:** revisar la rama por defecto, los PR y los commits antes de afirmar novedades; las evidencias históricas anteriores mantienen su fecha.
- **Pruebas:** consultar los workflows correspondientes al commit evaluado. Esta modificación documental no verifica funcionalidades mediante pruebas de aplicación.
- **Entorno:** no confundir demo, CI y código fusionado con despliegue funcional o producción comprobada.
- **Próxima acción:** identificar el bloqueo vigente en los issues y registrar en este repositorio rama, SHA, pruebas, entorno verificado, pendientes y siguiente paso.
- **Seguridad:** preservar los datos ficticios útiles y no publicar secretos ni información personal.

**Fuente de verdad:** las decisiones y la documentación del propio producto. Consultar primero [memoria operativa](docs/MEMORIA_OPERATIVA.md) y [decisiones](docs/DECISIONES.md). [Issue de seguimiento](https://github.com/medinacaj/multideck/issues/13).
