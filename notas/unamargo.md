# Un Amargo — E-commerce (conversión)

> Nota armada leyendo el código (no a partir del chat original). Completá lo que falte.

## Qué es
Tienda de mates artesanales (Uruguay). La venta se cierra por WhatsApp (`59897022638`).

## Archivos
- `index.html` — tienda: hero, catálogo ("La tienda"), personalizados, empresas,
  "Cómo recibís", modal de producto y carrito (guardado en `localStorage`).
- `como-cebar.html` — "Cómo cebar un buen amargo": recorrido de 7 pasos con scroll y un mate 3D
  (three.js desde CDN). La calabaza se tornea con la silueta de `images/mate-calabaza.jpg` y lleva esa
  foto proyectada encima; bombillón de acero y termo negro de 1 L a escala real.
  Estética blanco y negro, Helvetica con interlineado negativo (bold + regular). Inspirado en el concepto "ritual" de @made_byfede. Enlazado desde
  el menú y el footer de la tienda. Si el navegador no tiene WebGL muestra `images/camionero-virola.jpg`.
- `como-curar.html` — "Cómo curar tu mate": misma base que `como-cebar.html`, con selector de mate
  (calabaza o algarrobo ranchero). Cada mate tiene su propio recorrido con los pasos de Un Amargo
  (calabaza: 3 pasos; algarrobo: 5 pasos, con manteca) y las secciones se arman según el mate elegido.
  Usa `images/mate-ranchero.jpg` y `images/mate-ranchero-interior.jpg` además de las del cebado.
- `admin.html` — panel interno local: ventas, stock, gastos, dinero en cuenta, respaldo.
- `panel-compartido/` — el mismo panel en Google Apps Script + Google Sheets para usar entre los 3
  (instalación en `panel-compartido/INSTRUCCIONES.md`).
- `images/` — fotos de productos (`_mapa_imagenes.csv` mapea nombres).
- `.claude/serve.ps1` — servidor local en el puerto 3000 (solo Windows).

## Decisiones vigentes
- Envío gratis en Montevideo desde $3.490 UYU.
- Descuento por transferencia.
- Las fotos originales en PNG (`images_originales/`, ~170 MB) quedan solo en OneDrive, no en GitHub.

## Pendientes
- [ ] Completar con lo que quedó pendiente en el chat original de conversión.
