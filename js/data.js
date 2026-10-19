/*
 * MultiDeck 2.0 · Datos de demostración
 * Todo el contenido de este archivo es inventado. Ninguna cuenta, persona,
 * mensaje o cifra corresponde a perfiles o plataformas reales.
 */
window.MD = window.MD || {};

MD.data = (function () {
  // Colores validados para distinguir marcas (incluye visión con daltonismo).
  const BRAND_PALETTE = ['#B8791A', '#A8385E', '#1478A8', '#5A8A2E', '#7A4FB0', '#D0603C'];

  const brands = [
    { id: 'tierra-sur', name: 'Tierra Sur', handle: 'tierrasur', color: BRAND_PALETTE[0], tagline: 'Café de origen y despensa de huerta', custom: false },
    { id: 'lumbre-studio', name: 'Lumbre Studio', handle: 'lumbrestudio', color: BRAND_PALETTE[1], tagline: 'Iluminación y diseño artesanal', custom: false },
    { id: 'casa-nativa', name: 'Casa Nativa', handle: 'casanativa', color: BRAND_PALETTE[2], tagline: 'Textiles y hogar hechos a mano', custom: false }
  ];

  // Canales genéricos de demostración: no representan plataformas reales.
  const channels = [
    { id: 'breve', name: 'Microblog' },
    { id: 'galeria', name: 'Galería' },
    { id: 'pro', name: 'Red profesional' },
    { id: 'boletin', name: 'Boletín' }
  ];

  const lists = [
    { id: 'prensa', name: 'Prensa y medios', members: ['diario_valle', 'revista_fogon', 'cronica_urbana', 'radio_ladera'] },
    { id: 'aliados', name: 'Aliados y proveedores', members: ['mercado_alto', 'cooperativa_lomas', 'feria_oficios', 'hostal_mirador'] },
    { id: 'creadores', name: 'Creadores locales', members: ['ana_quiroga', 'tomas_ilustra', 'nidia_ceramica', 'taller_brasa', 'ruta_cafe'] }
  ];

  // ago = minutos transcurridos respecto a la carga de la página.
  const posts = [
    // Tierra Sur
    { id: 'p1', brand: 'tierra-sur', kind: 'post', channel: 'breve', author: 'Tierra Sur', handle: 'tierrasur', ago: 6, text: 'Llegó la cosecha de altura: notas de panela, mandarina y cacao. Tostamos en lotes pequeños los martes y viernes. #CaféDeOrigen', stats: [12, 8, 64] },
    { id: 'p2', brand: 'tierra-sur', kind: 'mention', channel: 'breve', author: 'Ana Quiroga', handle: 'ana_quiroga', ago: 18, text: 'Probé el filtrado de @tierrasur con la receta 1:16 que compartieron y es otro café. Gracias por la guía tan clara.', stats: [3, 1, 22] },
    { id: 'p3', brand: 'tierra-sur', kind: 'post', channel: 'galeria', author: 'Mercado Alto', handle: 'mercado_alto', ago: 42, text: 'Este sábado tenemos puesto compartido con @tierrasur y @cooperativa_lomas. Habrá cata guiada a las 11:00.', stats: [5, 14, 91] },
    { id: 'p4', brand: 'tierra-sur', kind: 'mention', channel: 'pro', author: 'Revista Fogón', handle: 'revista_fogon', ago: 75, text: 'En nuestro próximo número hablamos de despensas de proximidad. @tierrasur nos abrió las puertas de su tostaduría.', stats: [7, 22, 140] },
    { id: 'p5', brand: 'tierra-sur', kind: 'post', channel: 'breve', author: 'Tierra Sur', handle: 'tierrasur', ago: 130, text: 'Pregunta de la semana: ¿prensa francesa o goteo? Respondemos todas sus dudas sobre molienda en el hilo.', stats: [31, 4, 58] },
    { id: 'p6', brand: 'tierra-sur', kind: 'post', channel: 'pro', author: 'Cooperativa Lomas', handle: 'cooperativa_lomas', ago: 210, text: 'Cerramos la temporada con 38 familias productoras. Gracias a aliados como @tierrasur por el precio justo y la planificación compartida.', stats: [9, 27, 203] },
    { id: 'p7', brand: 'tierra-sur', kind: 'mention', channel: 'breve', author: 'Ruta Café', handle: 'ruta_cafe', ago: 300, text: '¿Alguien sabe si @tierrasur vuelve a tener el lote de miel? Lo busqué en el mercado y ya no quedaba.', stats: [6, 0, 11] },
    { id: 'p8', brand: 'tierra-sur', kind: 'post', channel: 'galeria', author: 'Tierra Sur', handle: 'tierrasur', ago: 480, text: 'Así se ve el secado en camas africanas al amanecer. Paciencia, sol y manos expertas. #DetrásDeLaTaza', stats: [4, 19, 176] },
    { id: 'p9', brand: 'tierra-sur', kind: 'mention', channel: 'pro', author: 'Diario del Valle', handle: 'diario_valle', ago: 720, text: 'Reportaje: emprendimientos que reconectan ciudad y campo. Conversamos con @tierrasur y @mercado_alto.', stats: [2, 31, 88] },
    { id: 'p10', brand: 'tierra-sur', kind: 'post', channel: 'boletin', author: 'Tierra Sur', handle: 'tierrasur', ago: 1440, text: 'Nuevo boletín: calendario de cosechas de otoño, receta de granola de la casa y una entrevista con productoras de @cooperativa_lomas.', stats: [1, 3, 40] },
    { id: 'p11', brand: 'tierra-sur', kind: 'mention', channel: 'breve', author: 'Tomás Ilustra', handle: 'tomas_ilustra', ago: 1900, text: 'Terminé las ilustraciones de empaque para @tierrasur. Montañas, colibríes y mucho color tierra.', stats: [8, 12, 132] },
    { id: 'p12', brand: 'tierra-sur', kind: 'post', channel: 'breve', author: 'Feria de Oficios', handle: 'feria_oficios', ago: 2600, text: 'Abrimos convocatoria para la feria de primavera. Productores de alimentos, escriban a la organización antes del día 30.', stats: [14, 40, 77] },

    // Lumbre Studio
    { id: 'p13', brand: 'lumbre-studio', kind: 'post', channel: 'galeria', author: 'Lumbre Studio', handle: 'lumbrestudio', ago: 9, text: 'Prototipo de la lámpara Brasa: pantalla de papel de fibra y base de cerámica esmaltada en ocre. ¿Mesa o pared?', stats: [26, 11, 188] },
    { id: 'p14', brand: 'lumbre-studio', kind: 'mention', channel: 'breve', author: 'Nidia Cerámica', handle: 'nidia_ceramica', ago: 25, text: 'Una semana entera en el horno con @lumbrestudio para las bases de la nueva colección. Resultado: 24 piezas y cero grietas.', stats: [4, 6, 97] },
    { id: 'p15', brand: 'lumbre-studio', kind: 'post', channel: 'pro', author: 'Lumbre Studio', handle: 'lumbrestudio', ago: 66, text: 'Buscamos estudio de arquitectura para colaborar en un proyecto de iluminación cálida para bibliotecas comunitarias.', stats: [11, 9, 54] },
    { id: 'p16', brand: 'lumbre-studio', kind: 'mention', channel: 'galeria', author: 'Hostal Mirador', handle: 'hostal_mirador', ago: 140, text: 'Renovamos el salón con luminarias de @lumbrestudio. Las tardes de lectura ya no son lo mismo.', stats: [5, 8, 121] },
    { id: 'p17', brand: 'lumbre-studio', kind: 'post', channel: 'breve', author: 'Crónica Urbana', handle: 'cronica_urbana', ago: 260, text: 'Ruta de diseño independiente: cinco talleres que vale la pena visitar este mes, entre ellos @lumbrestudio y @taller_brasa.', stats: [9, 35, 160] },
    { id: 'p18', brand: 'lumbre-studio', kind: 'mention', channel: 'breve', author: 'Taller Brasa', handle: 'taller_brasa', ago: 390, text: 'Gracias @lumbrestudio por prestarnos el espacio para el encuentro de oficios. Volvemos pronto.', stats: [2, 3, 45] },
    { id: 'p19', brand: 'lumbre-studio', kind: 'post', channel: 'galeria', author: 'Lumbre Studio', handle: 'lumbrestudio', ago: 610, text: 'Detalle del trenzado de cable textil. Cada metro se revisa a mano antes de salir del taller. #HechoAMano', stats: [3, 7, 99] },
    { id: 'p20', brand: 'lumbre-studio', kind: 'mention', channel: 'pro', author: 'Radio Ladera', handle: 'radio_ladera', ago: 900, text: 'Mañana en el programa de la tarde: diseño, luz y oficio con el equipo de @lumbrestudio.', stats: [1, 12, 38] },
    { id: 'p21', brand: 'lumbre-studio', kind: 'post', channel: 'boletin', author: 'Lumbre Studio', handle: 'lumbrestudio', ago: 1500, text: 'En el boletín de este mes: guía para elegir temperatura de color en casa y adelanto de la colección Ámbar.', stats: [0, 2, 33] },
    { id: 'p22', brand: 'lumbre-studio', kind: 'mention', channel: 'breve', author: 'Ana Quiroga', handle: 'ana_quiroga', ago: 2100, text: '¿@lumbrestudio hace piezas a medida? Tengo un pasillo larguísimo que pide a gritos una lámpara colgante.', stats: [4, 0, 15] },
    { id: 'p23', brand: 'lumbre-studio', kind: 'post', channel: 'pro', author: 'Feria de Oficios', handle: 'feria_oficios', ago: 3000, text: 'Confirmados para la muestra de diseño: @lumbrestudio, @nidia_ceramica y @casanativa. Entrada libre.', stats: [6, 28, 112] },

    // Casa Nativa
    { id: 'p24', brand: 'casa-nativa', kind: 'post', channel: 'galeria', author: 'Casa Nativa', handle: 'casanativa', ago: 12, text: 'Nueva serie de mantas en lana de oveja teñida con nogal y cochinilla. Tejidas en telar de pedal por artesanas de la sierra.', stats: [18, 21, 240] },
    { id: 'p25', brand: 'casa-nativa', kind: 'mention', channel: 'breve', author: 'Revista Fogón', handle: 'revista_fogon', ago: 35, text: 'Mesa puesta para la sesión de fotos: manteles de @casanativa, cerámica de @nidia_ceramica y pan recién horneado.', stats: [3, 10, 85] },
    { id: 'p26', brand: 'casa-nativa', kind: 'post', channel: 'breve', author: 'Casa Nativa', handle: 'casanativa', ago: 95, text: 'Cuidado de textiles en tres pasos: agua fría, jabón neutro y secado a la sombra. Guarden este mensaje.', stats: [7, 33, 150] },
    { id: 'p27', brand: 'casa-nativa', kind: 'mention', channel: 'galeria', author: 'Hostal Mirador', handle: 'hostal_mirador', ago: 180, text: 'Las habitaciones del segundo piso estrenan cojines de @casanativa. Los huéspedes ya preguntan dónde comprarlos.', stats: [6, 4, 102] },
    { id: 'p28', brand: 'casa-nativa', kind: 'post', channel: 'pro', author: 'Casa Nativa', handle: 'casanativa', ago: 330, text: 'Este año pagamos un 20 % por encima del precio de referencia a las tejedoras aliadas. Compartimos nuestro informe de impacto.', stats: [10, 18, 131] },
    { id: 'p29', brand: 'casa-nativa', kind: 'mention', channel: 'breve', author: 'Crónica Urbana', handle: 'cronica_urbana', ago: 560, text: 'Tendencia de temporada: hogares con texturas naturales. Consultamos a @casanativa y a @lumbrestudio.', stats: [2, 16, 70] },
    { id: 'p30', brand: 'casa-nativa', kind: 'post', channel: 'galeria', author: 'Tomás Ilustra', handle: 'tomas_ilustra', ago: 800, text: 'Bocetos para el catálogo de invierno de @casanativa. Patrones inspirados en los caminos de la sierra.', stats: [5, 9, 118] },
    { id: 'p31', brand: 'casa-nativa', kind: 'mention', channel: 'breve', author: 'Ruta Café', handle: 'ruta_cafe', ago: 1200, text: 'Mi taza de @tierrasur sobre un individual de @casanativa: domingo resuelto.', stats: [1, 2, 49] },
    { id: 'p32', brand: 'casa-nativa', kind: 'post', channel: 'boletin', author: 'Casa Nativa', handle: 'casanativa', ago: 1700, text: 'Boletín de octubre: visita al taller de teñido, historias de las artesanas y la lista de ferias del mes.', stats: [0, 1, 27] },
    { id: 'p33', brand: 'casa-nativa', kind: 'mention', channel: 'pro', author: 'Diario del Valle', handle: 'diario_valle', ago: 2300, text: 'Economía creativa en la región: @casanativa y @feria_oficios explican cómo crecer sin perder el carácter artesanal.', stats: [3, 20, 64] },
    { id: 'p34', brand: 'casa-nativa', kind: 'post', channel: 'breve', author: 'Cooperativa Lomas', handle: 'cooperativa_lomas', ago: 3400, text: 'Taller abierto de tintes naturales el próximo mes. Cupos limitados, en colaboración con @casanativa.', stats: [12, 15, 66] }
  ];

  // Conversaciones de la bandeja. from: 'them' | 'brand'
  const conversations = [
    { id: 'c1', brand: 'tierra-sur', kind: 'dm', channel: 'breve', name: 'Lucía Benavides', handle: 'lucia_benavides', unread: true, messages: [
      { from: 'them', ago: 14, text: 'Hola, ¿hacen envíos de café en grano a otras ciudades? Me interesa el lote de altura.' }
    ] },
    { id: 'c2', brand: 'tierra-sur', kind: 'mention', channel: 'breve', name: 'Ruta Café', handle: 'ruta_cafe', unread: true, messages: [
      { from: 'them', ago: 300, text: '¿Alguien sabe si @tierrasur vuelve a tener el lote de miel? Lo busqué en el mercado y ya no quedaba.' }
    ] },
    { id: 'c3', brand: 'tierra-sur', kind: 'dm', channel: 'pro', name: 'Mercado Alto', handle: 'mercado_alto', unread: false, messages: [
      { from: 'them', ago: 900, text: '¿Confirman el puesto compartido del sábado? Necesitamos saber si traen molino propio.' },
      { from: 'brand', ago: 860, text: 'Confirmado. Llevamos molino y dos termos para la cata.' },
      { from: 'them', ago: 840, text: 'Perfecto, les reservamos el espacio junto a la entrada.' }
    ] },
    { id: 'c4', brand: 'tierra-sur', kind: 'mention', channel: 'pro', name: 'Revista Fogón', handle: 'revista_fogon', unread: false, messages: [
      { from: 'them', ago: 75, text: 'En nuestro próximo número hablamos de despensas de proximidad. @tierrasur nos abrió las puertas de su tostaduría.' }
    ] },
    { id: 'c5', brand: 'lumbre-studio', kind: 'dm', channel: 'galeria', name: 'Andrés Salcedo', handle: 'andres_salcedo', unread: true, messages: [
      { from: 'them', ago: 40, text: 'Buenas tardes. ¿La lámpara Brasa estará disponible en color terracota? Quiero dos para un comedor.' }
    ] },
    { id: 'c6', brand: 'lumbre-studio', kind: 'mention', channel: 'breve', name: 'Ana Quiroga', handle: 'ana_quiroga', unread: true, messages: [
      { from: 'them', ago: 2100, text: '¿@lumbrestudio hace piezas a medida? Tengo un pasillo larguísimo que pide a gritos una lámpara colgante.' }
    ] },
    { id: 'c7', brand: 'lumbre-studio', kind: 'dm', channel: 'pro', name: 'Radio Ladera', handle: 'radio_ladera', unread: false, messages: [
      { from: 'them', ago: 1300, text: '¿Podrían acompañarnos en el programa del jueves? Serían veinte minutos de conversación.' },
      { from: 'brand', ago: 1250, text: 'Con gusto. Irá Marta, nuestra directora de diseño.' }
    ] },
    { id: 'c8', brand: 'lumbre-studio', kind: 'mention', channel: 'galeria', name: 'Hostal Mirador', handle: 'hostal_mirador', unread: false, messages: [
      { from: 'them', ago: 140, text: 'Renovamos el salón con luminarias de @lumbrestudio. Las tardes de lectura ya no son lo mismo.' }
    ] },
    { id: 'c9', brand: 'casa-nativa', kind: 'dm', channel: 'galeria', name: 'Valeria Ortúzar', handle: 'valeria_ortuzar', unread: true, messages: [
      { from: 'them', ago: 22, text: 'Hola, ¿las mantas de nogal vienen en tamaño matrimonial? Y ¿cuánto tarda la entrega?' }
    ] },
    { id: 'c10', brand: 'casa-nativa', kind: 'mention', channel: 'breve', name: 'Revista Fogón', handle: 'revista_fogon', unread: true, messages: [
      { from: 'them', ago: 35, text: 'Mesa puesta para la sesión de fotos: manteles de @casanativa, cerámica de @nidia_ceramica y pan recién horneado.' }
    ] },
    { id: 'c11', brand: 'casa-nativa', kind: 'dm', channel: 'pro', name: 'Feria de Oficios', handle: 'feria_oficios', unread: false, messages: [
      { from: 'them', ago: 2800, text: 'Les asignamos el stand 14 para la muestra. ¿Necesitan conexión eléctrica?' },
      { from: 'brand', ago: 2700, text: 'Sí, por favor, para iluminar el telar de demostración.' },
      { from: 'them', ago: 2650, text: 'Anotado. Les enviamos el plano por esta vía la próxima semana.' }
    ] },
    { id: 'c12', brand: 'casa-nativa', kind: 'mention', channel: 'galeria', name: 'Hostal Mirador', handle: 'hostal_mirador', unread: false, messages: [
      { from: 'them', ago: 180, text: 'Las habitaciones del segundo piso estrenan cojines de @casanativa. Los huéspedes ya preguntan dónde comprarlos.' }
    ] }
  ];

  // Publicaciones programadas iniciales (días relativos a hoy).
  const scheduled = [
    { id: 's1', brand: 'tierra-sur', channel: 'breve', day: 1, time: '09:30', text: 'Martes de tueste: abrimos la tostaduría para visitas guiadas de 10:00 a 12:00.' },
    { id: 's2', brand: 'lumbre-studio', channel: 'galeria', day: 2, time: '18:00', text: 'Presentamos la colección Ámbar: seis lámparas, seis maneras de entibiar una habitación.' },
    { id: 's3', brand: 'casa-nativa', channel: 'galeria', day: 3, time: '11:00', text: 'Detrás del telar: conozcan a Rosa, tejedora aliada desde hace doce años.' },
    { id: 's4', brand: 'tierra-sur', channel: 'boletin', day: 5, time: '08:00', text: 'Boletín semanal: lotes disponibles y receta de café frío.' },
    { id: 's5', brand: 'casa-nativa', channel: 'pro', day: 6, time: '10:15', text: 'Informe de impacto trimestral: precios justos y nuevas tejedoras.' },
    { id: 's6', brand: 'lumbre-studio', channel: 'breve', day: 8, time: '13:00', text: 'Encuesta: ¿qué temperatura de luz prefieren para leer?' },
    { id: 's7', brand: 'tierra-sur', channel: 'galeria', day: 10, time: '17:30', text: 'Galería de la cata del sábado con @mercado_alto.' },
    { id: 's8', brand: 'casa-nativa', channel: 'breve', day: 12, time: '12:00', text: 'Recordatorio: taller de tintes naturales con @cooperativa_lomas.' },
    { id: 's9', brand: 'lumbre-studio', channel: 'pro', day: 15, time: '09:00', text: 'Abrimos convocatoria para prácticas en diseño de iluminación.' },
    { id: 's10', brand: 'tierra-sur', channel: 'breve', day: -2, time: '10:00', text: 'Gracias a todos los que vinieron a la cata en el mercado.' },
    { id: 's11', brand: 'casa-nativa', channel: 'galeria', day: -5, time: '16:00', text: 'Nuevos colores de cojines: nogal, índigo suave y cochinilla.' },
    { id: 's12', brand: 'lumbre-studio', channel: 'galeria', day: 20, time: '19:00', text: 'Noche de taller abierto: luz, música y piezas en proceso.' }
  ];

  // Plantillas para generar publicaciones de ejemplo de marcas añadidas localmente.
  const customBrandTemplates = [
    { kind: 'post', channel: 'breve', author: '{name}', handle: '{handle}', ago: 20, text: '¡Hola! Esta es la primera publicación de demostración de {name}. Todo lo que ves aquí es contenido de ejemplo.' },
    { kind: 'mention', channel: 'breve', author: 'Ana Quiroga', handle: 'ana_quiroga', ago: 95, text: 'Acabo de conocer a @{handle} en la feria del barrio. ¡Qué buena propuesta!' },
    { kind: 'post', channel: 'galeria', author: 'Mercado Alto', handle: 'mercado_alto', ago: 400, text: 'Damos la bienvenida a @{handle} a la red de aliados del mercado.' },
    { kind: 'mention', channel: 'pro', author: 'Diario del Valle', handle: 'diario_valle', ago: 1300, text: 'Nuevos emprendimientos de la región: @{handle} cuenta cómo empezó.' }
  ];

  return { BRAND_PALETTE, brands, channels, lists, posts, conversations, scheduled, customBrandTemplates };
})();
