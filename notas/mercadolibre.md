# Publicar productos de Un Amargo en MercadoLibre

> Nota armada leyendo el código (no a partir del chat original). Completá lo que falte.

## Qué es
`mercadolibre/publicaciones.html`: página de ayuda para cargar a mano cada producto
de la tienda en MercadoLibre. Cada tarjeta trae título, precio y descripción con
botones de copiar, las fotos a subir y una casilla "Publicado" (se guarda en el navegador).

## Cómo se usa
1. En ML: Vender → Publicar producto. Pegar el título (ML sugiere la categoría).
2. Subir las fotos indicadas en la tarjeta (carpeta `images/` de la raíz).
3. Pegar precio y descripción. Marcar "Publicado".

## Decisiones
- Precio ML = precio web ÷ (1 − comisión), redondeado a terminación 90, para cobrar lo mismo que en la web. La comisión se ajusta arriba en la página.
- Las descripciones no llevan teléfono, WhatsApp, web ni redes (ML lo prohíbe y pausa publicaciones).
- El progreso "Publicado" vive en el `localStorage` del navegador: no se comparte entre PCs.

## Pendientes
- [ ] Verificar la comisión actual en ML (Costos de vender).
- [ ] Juntar medidas y peso de cada paquete (Mercado Envíos) y capacidad de los mates.
- [ ] Publicar los productos que falten.
