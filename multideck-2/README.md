# MultiDeck 2.0 · Demostración

Panel de gestión de redes sociales con columnas al estilo deck, en español.
**Todo es de demostración:** marcas, cuentas, publicaciones, mensajes, calendario y cifras son inventados.
La app no se conecta a ninguna red social, no hace llamadas de red y no publica ni envía nada.

## Cómo iniciarla

Sin dependencias ni compilación. Desde esta carpeta:

```bash
python3 -m http.server 8080
# o bien: npx serve .
```

Abre <http://localhost:8080>. También funciona abriendo `index.html` directamente en el navegador.

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
