# PATRIA — Landing page de cuero

> Nota armada leyendo el código (no a partir del chat original). Completá lo que falte.

## Qué es
Landing / catálogo de PATRIA: llaveros, brazaletes, collares, cintos, monederos y
sobres de cuero genuino hechos a mano en Uruguay. Las ventas se cierran por WhatsApp.

## Archivos
- `patria/index.html` — estructura de la página (barra de anuncios, hero, categorías, productos, Instagram, footer).
- `patria/styles.css` — estilos (tonos cuero, tipografía Inter).
- `patria/script.js` — render del catálogo, filtros y links a WhatsApp.
- `patria/productos.js` — **único archivo a tocar para contenido**: `CONFIG` (WhatsApp, Instagram, email) y la lista `PRODUCTOS`.
- `patria/images/LEEME.txt` — lista exacta de nombres de foto que espera la web.

## Decisiones
- Si una foto falta, la web muestra un placeholder con el nombre de la pieza (no se rompe).
- Si falta el logo, escribe "PATRIA" en Inter bold.
- El hero está pensado para la foto del logo grabado en cuero con pelo (título abajo a la izquierda).

## Pendientes
- [ ] Poner el WhatsApp real en `productos.js` (hoy `59899000000`).
- [ ] Confirmar Instagram (`somospatria.uy`) y email (`hola@patria.uy`).
- [ ] Reemplazar productos y precios de ejemplo por los reales.
- [ ] Subir logo (`logo.svg` / `logo-claro.svg` o PNG transparente).
- [ ] Subir `hero.jpg` (logo grabado en cuero con pelo).
- [ ] Fotos de categorías (`cat-*.jpg`), Instagram (`ig-1..6.jpg`) y productos (`prod-*.jpg`).
- [ ] Pasar los PNG actuales (2–8 MB) a JPG calidad 80.
- [ ] Publicar el sitio (definir hosting y dominio).
