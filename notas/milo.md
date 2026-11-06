# Milo Raciones — Web de ración y accesorios a domicilio

## Qué es
Tienda online de Milo Raciones: venta de ración para perros y gatos, snacks, antipulgas,
arena y accesorios, con entrega a domicilio en Ciudad de la Costa y alrededores.
No hay pago online: el cliente arma el pedido en la web y lo manda por WhatsApp.
Referencia de estructura: altoqueraciones.com (diseño y textos propios).

## Archivos
- `milo/index.html` — estructura: anuncio, header, hero con "¿Llegamos a tu barrio?", beneficios,
  categorías, tienda, cómo funciona, calculadora "¿Cuánto le dura la bolsa?", envíos, quiénes somos,
  preguntas frecuentes, marcas, footer, carrito lateral.
- `milo/styles.css` — estilos con la identidad de Milo: turquesa `#00B5B6`, naranja `#F29348`, blanco; Montserrat (títulos) + Nunito.
- `milo/images/logo-turquesa.png` / `logo-blanco.png` — logo recortado con fondo transparente (sacado del PNG de Canva, ~300 px).
- `milo/images/promo-*.jpg` — piezas de redes de Canva (se muestran en la portada).
- `milo/script.js` — catálogo, filtros, buscador, carrito (se guarda en el navegador),
  armado del mensaje de WhatsApp, zonas y calculadora.
- `milo/alimentos.js` — alimentos para perros y gatos (247 productos, 320 presentaciones) importados de
  distribuidoralopez.com.uy. **Generado**: no se edita a mano.
- `milo/herramientas/importar_lopez.py` — vuelve a bajar alimentos, precios y fotos de la distribuidora
  (`cd milo && python3 herramientas/importar_lopez.py`). Tiene `MARGEN` para sumar un % a los precios.
- `milo/images/alimentos/` — fotos de los alimentos (bajadas por el importador).
- `milo/productos.js` — contenido editable: `CONFIG` (WhatsApp, Instagram,
  email, mínimo para envío sin costo, costo de envío, hora de corte), `ZONAS` y `PRODUCTOS`.
- `milo/images/LEEME.txt` — nombres exactos de fotos y logos que espera la web.

## Decisiones
- Cada producto tiene varias presentaciones (kg o tamaño) con su precio; si tiene `kg` muestra el precio por kilo.
- El carrito arma un mensaje de WhatsApp con productos, total, envío, nombre, barrio, dirección y forma de pago.
- Envío sin costo desde $1.500; si no, $120 (editable en `CONFIG`).
- Ciudad de la Costa: lunes a sábado, en el día si se pide antes de las 14 h. Alrededores: días fijos por zona.
- Estilo minimalista y sin animaciones: botones blancos con letra del color de fondo (turquesa), o con borde y sin relleno sobre fondo blanco.
- La portada muestra las tres piezas de Canva (domicilio, envíos gratuitos, ración).
- Si falta una foto, se muestra un recuadro liso con el nombre de la marca; si falta un logo de marca, se muestra el nombre.

## Pendientes
- [x] WhatsApp (`097 051 833`) y email (`infomiloraciones@gmail.com`) cargados.
- [ ] Confirmar usuario de Instagram (hoy `miloraciones`).
- [x] Alimentos cargados desde Distribuidora López (precios de la distribuidora, sin margen).
- [ ] Definir margen sobre los precios de la distribuidora (`MARGEN` en el importador).
- [ ] Revisar fotos: algunas muestran regalos/promos de la distribuidora (contenedores, galletitas).
- [ ] Confirmar permiso para usar las fotos de la distribuidora.
- [ ] Snacks, antipulgas, arena y accesorios siguen siendo de ejemplo.
- [ ] Confirmar zonas, días de reparto, mínimo de envío gratis, costo de envío y hora de corte.
- [ ] Logo en SVG o PNG grande (el actual sale de una imagen de 304 px; se ve bien en tamaño chico).
- [ ] Piezas de Canva en mayor resolución (1080 px) para las promos.
- [ ] Fotos de productos, logos de marcas y foto de Milo (`milo.jpg`).
- [ ] Publicar el sitio (hosting y dominio).
