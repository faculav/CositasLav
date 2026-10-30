# TIRRA (antes PATRIA) — Landing page de cuero

> Nota armada leyendo el código (no a partir del chat original). Completá lo que falte.

## Qué es
La marca se llamaba PATRIA y ahora es **TIRRA** (la carpeta sigue siendo `patria/`).
Landing / catálogo de TIRRA: llaveros, brazaletes, collares, cintos, monederos y
sobres de cuero genuino hechos a mano en Uruguay. Las ventas se cierran por WhatsApp.

## Archivos
- `patria/index.html` — estructura de la página (barra de anuncios, hero, categorías, productos, Instagram, footer).
- `patria/styles.css` — estilos (tonos cuero, tipografía Inter).
- `patria/script.js` — render del catálogo, filtros y links a WhatsApp.
- `patria/productos.js` — **único archivo a tocar para contenido**: `CONFIG` (WhatsApp, Instagram, email) y la lista `PRODUCTOS`.
- `patria/images/LEEME.txt` — lista exacta de nombres de foto que espera la web.

## Decisiones
- Copia la estructura de delsurleather.com (WebFetch no la abre, pero `curl` y Playwright con el proxy sí):
  header blanco con logo a la izquierda y hamburguesa a la derecha en todos los tamaños (pedido del usuario),
  hero 650px (400px en celu) con título centrado, "Espíritu Tirra", "Nuestro estilo" (categorías), "Esenciales Tirra"
  (productos, 8 + "Ver más"), banner "Pedidos a medida", "Nuestro cuero", "Cuidado del cuero", "Calidad Tirra" (sellos),
  "Más Tirra", footer gris oscuro. Tipografía Raleway, botones de línea finos.
- Portada = video `images/hero.mp4` + `hero.webm` (28 s, 1920x1080, loop, mudo), armado con ffmpeg desde 6 fotos 4K de Pexels (serie de M.Emin BİLİR, IDs en `images/LEEME.txt`) con zoom/paneo lento, fundidos, grano y viñeta. Poster `hero.jpg`. La búsqueda de pexels.com bloquea robots, pero images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg descarga directo.
- Instagram, email y WhatsApp salen sólo de `CONFIG` en `productos.js`.
- Tarjetas de producto como la referencia: `img` = producto en fondo blanco, `img2` = ambiente al pasar el mouse. Si falta `img`, se usa `img2` (data-respaldo en script.js).
- Título de portada: "100% **cuero** genuino **uruguayo**", interlineado .96.
- Si una foto falta, la web muestra un placeholder con el nombre de la pieza (no se rompe).
- Logo: `images/logo.png` (marrón, header) y `images/logo-claro.png` (crema, footer), sacados del logo de Tirra con forma de Uruguay. Si faltan, escribe "TIRRA" en Inter bold.
- El hero está pensado para la foto del logo grabado en cuero con pelo (título abajo a la izquierda).

## Pendientes
- [ ] Poner el WhatsApp real en `productos.js` (hoy `59899000000`).
- [x] Instagram de Tirra: `tirra.uy`.
- [ ] Email de Tirra (hoy sigue `hola@patria.uy`).
- [x] Productos reales (del Figma "UnAmargoMates", página TIRRA, nodo 1769:2): Collares Tierra, Pampa, Ocre, Greda; Brazaletes Origen, Brava, Sombra; Pulseras Tierra, Raíces, Savia. Categorías ahora: collares | brazaletes | pulseras.
- [ ] Precios reales del resto (hoy `precio:null` → "Consultar precio"). Pechera Cría: $1990.
- [x] Categoría Chalecos (key `chalecos`): Pechera Cría $1990, Chaleco Cruz $1990. Pechera Cría (fotos del usuario recortadas a fondo blanco: frente = principal, espalda = al pasar el mouse). El usuario va a ir pasando más productos (pendiente: Chaleco Latte Básico $1990, falta que reenvíe la foto como archivo).
- [ ] Foto de Pulsera Savia.
- [x] Collares en fondo blanco (`prod-col-*-blanco.jpg`): piedra real recortada con OpenCV (GrabCut) + cordón/argolla dibujados. Ideal a futuro: fotos reales de estudio.
- [x] Logo de Tirra cargado (PNG marrón y crema).
- [x] Rediseño estilo delsurleather.com.
- [ ] ¿Renombrar carpeta `patria/` a `tirra/`?
- [x] Video de intro con fotos (versión gratis).
- [x] Video rearmado con fotos 4K de Pexels.
- [ ] Opcional: caballos en movimiento real (video de Pexels o IA con Higgsfield).
- [ ] Subir `hero.jpg` (antes era el logo PATRIA grabado en cuero; ver si hay foto nueva con Tirra).
- [ ] Fotos de categorías (`cat-*.jpg`), Instagram (`ig-1..6.jpg`) y productos (`prod-*.jpg`).
- [x] Fotos pasadas a JPG (de ~16 MB a ~1 MB).
- [x] Fotos con PATRIA reemplazadas por las de Tirra del Figma (box con cartel TIRRA, caballo con la marca).
- [ ] Publicar el sitio (definir hosting y dominio).

## Figma
- Archivo `odW6QtxGYJebJXcswZqBB5` (UnAmargoMates), página TIRRA `1769:2`. El plan Starter de Figma tiene un límite chico de pedidos por MCP.
