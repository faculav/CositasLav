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
- Portada = video `images/hero.mp4` (loop, mudo). Mientras falte, se ve `ig-1.jpg` de fondo.
- Instagram, email y WhatsApp salen sólo de `CONFIG` en `productos.js`.
- Si una foto falta, la web muestra un placeholder con el nombre de la pieza (no se rompe).
- Logo: `images/logo.png` (marrón, header) y `images/logo-claro.png` (crema, footer), sacados del logo de Tirra con forma de Uruguay. Si faltan, escribe "TIRRA" en Inter bold.
- El hero está pensado para la foto del logo grabado en cuero con pelo (título abajo a la izquierda).

## Pendientes
- [ ] Poner el WhatsApp real en `productos.js` (hoy `59899000000`).
- [ ] Instagram y email nuevos de Tirra (hoy siguen `somospatria.uy` y `hola@patria.uy`).
- [ ] Reemplazar productos y precios de ejemplo por los reales.
- [x] Logo de Tirra cargado (PNG marrón y crema).
- [x] Rediseño estilo delsurleather.com.
- [ ] ¿Renombrar carpeta `patria/` a `tirra/`?
- [ ] Video de intro: el usuario pasa fotos de caballos y se arma `hero.mp4` cinemático.
- [ ] Subir `hero.jpg` (antes era el logo PATRIA grabado en cuero; ver si hay foto nueva con Tirra).
- [ ] Fotos de categorías (`cat-*.jpg`), Instagram (`ig-1..6.jpg`) y productos (`prod-*.jpg`).
- [x] Fotos pasadas a JPG (de ~16 MB a ~1 MB).
- [ ] `taller.jpg` tiene un cartel "PATRIA" e `ig-2.jpg` dice "florece Patria": reemplazar.
- [ ] Publicar el sitio (definir hosting y dominio).
