# TIRRA (antes PATRIA) — Landing page de cuero

> Nota armada leyendo el código (no a partir del chat original). Completá lo que falte.

## Qué es
La marca se llamaba PATRIA y ahora es **TIRRA** (la carpeta sigue siendo `patria/`).
Landing / catálogo de TIRRA: llaveros, brazaletes, collares, cintos, monederos y
sobres de cuero genuino hechos a mano en Uruguay. Las ventas se cierran por WhatsApp.

## Rediseño "Tirra es tierra" (nov 2026)
Minimalista/editorial: fondo hueso #efe9df, tinta #171412, cuero #7a4a2a. Tipografía SOLO Inter 400 y 700 (pedido del usuario), títulos con interlineado negativo (.84–.9) y tracking -0.05em. Celular: versión minimalista (sin grano, cinta, cifras, etiquetas ni TIRRA gigante; botones en píldora).
Pantalla de carga con contador, cursor propio, grano de película, header que se esconde al bajar,
menú a pantalla completa (círculo que se expande), hero con video que se achica/redondea al bajar y
título letra por letra, manifiesto que se ilumina palabra por palabra, cinta infinita que acelera con el
scroll, brazalete 3D (three.js r128, `pieza3d.js` + texturas embebidas en `texturas.js`) con Origen/Brava/
Sombra, categorías con scroll horizontal fijado (en celu: deslizar), tarjetas de producto con inclinación 3D,
parallax en "Nuestro cuero", cifras con contador, acordeón de cuidados, "Hablemos" con botones imán, footer
con TIRRA gigante. Librerías por CDN: GSAP 3.12.5 + ScrollTrigger (cdnjs), three.js r128 (cdnjs).
Todo funciona abriendo el archivo directo (sin módulos ES ni fetch de texturas). Si una librería no carga,
la página queda usable sin animaciones.

## Carrito y ficha (nov 2026)
- Tocar un producto abre una ficha: foto grande + miniaturas (img, img2 y `fotos` extra), visor a pantalla
  completa (flechas / deslizar), cantidad, "Añadir al carrito" y "consultar por WhatsApp".
- Carrito lateral guardado en el navegador (localStorage `tirra-carrito`): suma, resta, quita, total
  (piezas sin precio = "a consultar") y "Finalizar por WhatsApp" con el pedido armado en el mensaje.
- Con piezas en el carrito el header no se esconde al bajar.
- La cinta en movimiento usa 9 texturas de cuero de Pexels en alta (no fotos de productos; IDs en images/LEEME.txt), con versión -m para celular vía srcset.
- Pulsera Savia eliminada (pedido del usuario).
- Pendiente: el usuario va a mandar videos de cada pieza para mejorar el 3D (idea: visor 360° con
  fotogramas del video, que se gira arrastrando).

## Versión 2 (`patria/v2.html`, nov 2026)
- La v1 (index.html: minimalista, Inter, 3D) quedó guardada en la rama `tirra-v1`.
- v2 = estética de tienda editorial inspirada en criacruz.com (Lora serif, camel #a88563, texto #45322e,
  barra de anuncios, logo centrado, nav en mayúsculas, slider de fotos, bloques camel, grillas 3:4,
  beneficios, lookbook B/N, Instagram, footer marrón). SOLO la estética: fotos y textos son de Tirra
  (no se copió contenido de Cría Cruz).
- Archivos propios: v2.html, v2.css, v2.js e images/v2-*.jpg (fotos de Pexels, serie M.Emin BİLİR).
  Comparte productos.js e imágenes con la v1 y el mismo carrito guardado (`tirra-carrito`).

## Archivos
- `patria/index.html` — estructura de la página (barra de anuncios, hero, categorías, productos, Instagram, footer).
- `patria/styles.css` — estilos (tonos cuero, tipografía Inter).
- `patria/script.js` — catálogo, filtros, WhatsApp/IG/email, menú, cursor, animaciones GSAP.
- `patria/pieza3d.js` + `patria/texturas.js` — brazalete 3D.
- `patria/productos.js` — **único archivo a tocar para contenido**: `CONFIG` (WhatsApp, Instagram, email) y la lista `PRODUCTOS`.
- `patria/images/LEEME.txt` — lista exacta de nombres de foto que espera la web.

## Decisiones
- Copia la estructura de delsurleather.com (WebFetch no la abre, pero `curl` y Playwright con el proxy sí):
  header blanco con logo a la izquierda y hamburguesa a la derecha en todos los tamaños (pedido del usuario),
  hero 650px (400px en celu) con título centrado, "Espíritu Tirra", "Nuestro estilo" (categorías), "Esenciales Tirra"
  (productos, 8 + "Ver más"), banner "Pedidos a medida", "Nuestro cuero", "Cuidado del cuero", "Calidad Tirra" (sellos),
  "Más Tirra", footer gris oscuro. Tipografía Raleway, botones de línea finos.
- Portada = video `images/hero.mp4` (1080p, compu) / `hero-720.mp4` (celu) H.264 con keyframe cada 2 s y faststart; `hero-720.webm` solo si el navegador no tiene H.264. script.js reintenta el play si se pausa o traba. Antes: (28 s, 1920x1080, loop, mudo), armado con ffmpeg desde 6 fotos 4K de Pexels (serie de M.Emin BİLİR, IDs en `images/LEEME.txt`) con zoom/paneo lento, fundidos, grano y viñeta. Poster `hero.jpg`. La búsqueda de pexels.com bloquea robots, pero images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg descarga directo.
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

## Versión 3 «Pieles» (actual, `index.html`)
- Pedido: "minimalista, premium, exótica". Concepto: el cuero como protagonista.
- Archivos: `index.html` + `tirra.css` + `tirra.js` (usa `productos.js`, mismo carrito `tirra-carrito`).
- Secciones: hero con video → intro → "Las pieles" (5 franjas de textura que se abren: Croco, Cebra, Pelo, Gamuza, Grano) → Colección 2026 → "Hecho a mano" con letra rellena de cuero → galería horizontal → El taller (claro, manos en blanco y negro) → Escribinos → pie.
- Versiones anteriores: `v1.html` (rama `tirra-v1`) y `v2.html` (estética editorial tipo Cría Cruz).

## Perchero interactivo (sección `#perchero`)
- Inspirado en un video de referencia (perchero de ropa en web). Barra con los 2 chalecos en perchas y 4 collares colgados.
- Al tocar una pieza: las demás se desenfocan, la elegida va al centro, se balancea y muestra nombre, precio, Frente/Espalda (solo chalecos), Agregar al carrito y Ver detalle. Flechas, deslizar en celular, Esc o "Volver al perchero".
- Fotos recortadas con fondo transparente: `images/perch-*.webp` (salen de las fotos en fondo blanco `prod-*`).
- Para sumar una pieza (ej. Chaleco Latte): recortar su foto a `perch-<id>.webp` y agregarla a la lista `PERCHA` en `tirra.js`.
- Perchas: foto real de la percha de madera con logo TIRRA y gancho dorado (`images/percha-tirra.webp`, recortada). Se compone por detrás de cada chaleco (se ve por el escote) con `images/percha-componer.py` → `perch-<id>.webp` y `perch-<id>-b.webp`.

### Perchero v2 (riel con física)
- Reescrito en JS común (la web no usa React), tomando el comportamiento del componente "ClothingRailHero" que pasó Facundo como referencia: piezas de perfil (−70°) que giran de frente al pasar el mouse, resortes que empujan a las vecinas, balanceo según la aceleración, perchas que se arrastran por la barra, carrusel con deslizar en celular y pieza "descolgada" que vuela al frente y se gira arrastrando (frente/espalda).
- Código: bloque "el perchero" en `tirra.js` (lista `PIEZAS`), estilos `.riel`, `.pieza`, `.detalle` en `tirra.css`.
- Fotos: `images/perch-*.webp` con la percha incluida y el gancho arriba de todo (las de la Pechera Cría las hizo Facundo; frente = bolsillo cebra).
- **3D real (three.js r128, `perchero3d.js`)**: cada pieza es una malla curvada con la foto de frente adelante, la de espalda atrás (espejada y alineada por el gancho) y "rebanadas" intermedias que dan el espesor del cuero; luces reales. El riel usa la misma física y dibuja en un `<canvas>`; la pieza descolgada gira 360°. Si la página se abre como archivo suelto (file://) o no hay WebGL, se ven las fotos planas de antes.
- Fotos del perchero limpiadas: sin halo blanco ni sombras grises de la pared.
- **Vuelta a plano (pedido de Facundo):** el 3D no convenció. Ahora las piezas cuelgan de frente; al pasar se agrandan (zoom) y las vecinas se corren hacia los costados, con balanceo. La pieza descolgada se mantiene (Frente/Espalda con fotos planas). Se borró `perchero3d.js`.
- Fondo general más blanco: `--fondo:#fbfaf8`, `--caja:#f1eee8`.
- Perchero solo con chalecos (se sacaron los collares). Sin sombras (en celular se veían raras). En la pieza abierta: Frente / Espalda / "Más fotos" (próximamente, desactivado).
- Tercer chaleco: **Chaleco Latte Básico** ($1990, gamuza chocolate, abierto). Fotos `prod-cha-latte(-b).jpg` y `perch-cha-latte(-b).webp`.
- Las 6 fotos del perchero se rearmaron en un **mismo lienzo** (820×1341, gancho centrado) para que todas las perchas tengan el mismo tamaño. Script: `images/recortar-percha.py`.
- Pieza abierta estilo tienda: columna de miniaturas a la izquierda (frente, espalda, detalles `det-*.jpg` recortados de las fotos en alta, y "Más fotos · Próximamente"), foto grande al centro, datos + carrito + WhatsApp a la derecha. En celular las miniaturas van en fila debajo.
- Fotos de detalle reales (de Facundo): `det-pec-cria-bolsillo.jpg`, `det-pec-cria-costado.jpg`, `det-cha-cruz-costado.jpg`.
- Pechera Cría: costados emparejados de la sisa al ruedo (`images/emparejar-costados.py`, se corre después de `recortar-percha.py`).
- Gancho real: la barra apoya en la parte interna de la curva y un pedacito de barra (`.pieza__tapa`) tapa la punta, así la punta queda por detrás. En la pieza abierta el hilo baja centrado hasta adentro de la curva del gancho.
- Detalles: una foto por chaleco (bolsillo → Pechera Cría, costado suela → Cruz, costado chocolate → Latte), sin pared y con el tono igualado al chaleco: `images/det-*.webp` (script `images/procesar-detalle.py`). Se muestran centradas en el mismo lugar que frente/espalda.
- Detalle del Cruz sin la sombra de la pared (filtro de grises + borde izquierdo parejo). Pieza abierta con flechas flotantes (‹ ›) y teclas ← → para pasar entre frente, espalda y detalle.
- **Sección Los collares** (`#collares`): cada collar sobre un busto blanco apoyado en un tronco (`images/exhibidor.jpg`, imagen de Facundo con el fondo emparejado a blanco; se usa con `mix-blend-mode:multiply`). Cada collar es el real recortado de su foto (tira de cuero + argolla + piedra) y apoyado en el busto: `images/collar-*.webp` (script `images/collar-en-busto.py`). Sin animación. Clic → ficha del producto.
- Colección: los chalecos usan las fotos del perchero (`perch-*.webp` frente/espalda).
- Galería: se sacó la foto de las pulseras sobre el caballo (`ig-1.jpg`); ahora 2 fotos grandes arriba y 3 abajo.
- Pendiente: textura de croco nueva (Facundo pasó referencia de croco negro brillante; falta el archivo).
- Tronco del exhibidor acortado a la mitad (se quitó una franja del medio con fundido). Los collares sobre el busto siguen siendo montajes de fotos puestas en persona: Facundo dice que no se ven reales → hacen falta fotos/imágenes de cada collar ya puesto en el busto.
- Texto mágico: títulos, intro, frase, texto del taller y contacto se encienden palabra por palabra con el scroll (GSAP ScrollTrigger con scrub; palabras en `span.mt`). Referencia: componente magic-text de 21st.dev (no se pudo abrir el sitio desde la sesión; hecho por descripción).
- Collares: ahora cada uno usa la imagen que pasó Facundo ya puesto en el busto sobre tronco (`images/exhibidor-<nombre>.jpg`). Ojo: la imagen usada para **Tierra** muestra tira negra y piedra gris (parecida al Greda); falta confirmar/recibir la del Tierra real (tira marrón, piedra ámbar).
- Croco: `piel-croco.jpg` reemplazada por la foto de Facundo (croco negro brillante), usada en la franja Croco y en las letras de «Hecho a mano». La foto sobre el caballo (`amb-pulseras.jpg`) se sacó también de las pulseras de la Colección; `ig-1.jpg` queda solo para v1/v2.
