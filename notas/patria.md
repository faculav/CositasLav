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
- Estructura tipo delsurleather.com (según lo que contó el usuario; el sitio está bloqueado en la red de la sesión): sin barra de promociones, logo a la izquierda, hamburguesa a la derecha (panel desde la derecha), header transparente sobre la portada y blanco al bajar.
- Portada = video a pantalla completa (`images/hero.mp4`, poster `hero.jpg`) con el texto encima.
- Si una foto falta, la web muestra un placeholder con el nombre de la pieza (no se rompe).
- Logo: `images/logo.png` (marrón, header) y `images/logo-claro.png` (crema, footer), sacados del logo de Tirra con forma de Uruguay. Si faltan, escribe "TIRRA" en Inter bold.
- El hero está pensado para la foto del logo grabado en cuero con pelo (título abajo a la izquierda).

## Pendientes
- [ ] Poner el WhatsApp real en `productos.js` (hoy `59899000000`).
- [ ] Instagram y email nuevos de Tirra (hoy siguen `somospatria.uy` y `hola@patria.uy`).
- [ ] Reemplazar productos y precios de ejemplo por los reales.
- [x] Logo de Tirra cargado (PNG marrón y crema).
- [ ] Rediseño estilo delsurleather.com (hay que habilitar ese dominio en la red de la sesión o pasar capturas).
- [ ] ¿Renombrar carpeta `patria/` a `tirra/`?
- [ ] Video de intro: el usuario pasa fotos de caballos y se arma `hero.mp4` cinemático.
- [ ] Subir `hero.jpg` (antes era el logo PATRIA grabado en cuero; ver si hay foto nueva con Tirra).
- [ ] Fotos de categorías (`cat-*.jpg`), Instagram (`ig-1..6.jpg`) y productos (`prod-*.jpg`).
- [ ] Pasar los PNG actuales (2–8 MB) a JPG calidad 80.
- [ ] Publicar el sitio (definir hosting y dominio).
