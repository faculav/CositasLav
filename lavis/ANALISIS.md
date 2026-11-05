# Lavis Studio: auditoría web y propuesta de rediseño

Sitio analizado: https://lavis-studio.vercel.app (noviembre 2026)
Prototipo de rediseño: `lavis/index.html` (abrir en el navegador; usa las fotos reales del salón en `lavis/assets/`)

## 1. Debilidades principales

1. **Estética de plantilla de IA.** Crema + dorado, Montserrat negrita, palabra clave en letra cursiva (Yellowtail) en *cada* título ("Lo que *hacemos*", "Antes y *después*", "volvieron a *gustarse*"), tarjetas con bordes redondeados y sombras, pastillas, contadores grandes (05 / +700 / +150 / 03). Es exactamente el patrón que genera cualquier constructor con IA, así que no se distingue de otras barberías.
2. **El titular es negativo.** "Tu imagen no te representa" le dice al cliente que se ve mal. Una barbería top vende aspiración y confianza, no culpa.
3. **Demasiado ruido para vender un corte de $750.** Popup de cuponera arriba a la derecha, botón flotante de WhatsApp, barra fija de reserva, 8 burbujas de WhatsApp falsas flotando, 8 capturas de reseñas de Google, un audio con flecha manuscrita, tarjeta de socio "N.º 0086", contador de 85 de 150 socios… Todo compite y nada se destaca.
4. **La prueba social parece armada.** Los mensajes estilo WhatsApp con horario y doble check, sin nombre, se leen como inventados aunque sean reales. Las capturas de reseñas son imágenes: no se pueden leer bien en móvil, no indexan en Google y se ven pixeladas.
5. **"Antes y después" sin antes.** La sección muestra 4 retratos finales: la promesa del título no se cumple.
6. **Mobile saturado.** En el primer pantallazo hay 4 botones (Reservar arriba, píldora de Cuponera, Reservar flotante, WhatsApp flotante) tapando la foto del hero. La cuponera pisa el texto "EL PINAR · ATRÁS DE LA ANCAP".
7. **Fotografía inconsistente.** Fondos distintos (pared gris, salón, primerísimo plano de cejas), luz de celular, sin tratamiento de color común. Es lo que más baja la percepción de "premium".
8. **Jerarquía de oferta confusa.** Corte $750 y Corte+barba $750 (mismo precio, se ve como error), la membresía aparece tan fuerte como el servicio principal, y "Ver precios" manda a otra página.
9. **Marca débil.** El logo es correcto, pero la web no tiene un sistema propio: se suma Montserrat + Archivo Black + Yellowtail + Times (3–4 familias sin rol claro).
10. **SEO / técnico.** `og:image` con ruta relativa (al compartir el link por WhatsApp/Instagram puede salir sin imagen), sin datos estructurados `BarberShop` (horarios, rating, dirección para Google), reseñas en imagen sin texto, el Google Maps dice "Lavis Style" y la web "Lavis Studio" (nombre inconsistente), sin dominio propio (`.vercel.app` en la bio de Instagram resta seriedad).

## 2. Inventario para recrearla (qué tiene hoy)

**Páginas / rutas**: `/` (landing), `/reservar` (agenda), `/mi-cuenta` (cuponera de cliente), `/login` (acceso barberos).

**Secciones de la home**
1. Header: logo, menú (Servicios, Antes y después, Membresía, Academia, Dónde estamos), botón Reservar turno.
2. Hero: ubicación, titular, bajada, chips (Corte $750 · 40 min · Martes a sábado), CTA Reservar + Membresía, "Cómo llegar", foto con badge 5.0 / 390 reseñas.
3. Métricas: 5 años, +700 clientes, +150 reservas/semana, 3 barberos.
4. Servicios: Corte $750, Corte y barba $750, Cejas $250 + chips (Corte y lavado, Black mask, Mechas, Platinado, Tinta, Tratamientos) y método en 3 pasos (Miramos tu cara / Te cortamos / Te enseñamos a mantenerlo).
5. Antes y después: 4 videos verticales con poster.
6. Reseñas: burbujas tipo WhatsApp, rating Google, 8 capturas de reseñas, audio de cliente (18 s).
7. Membresía VIP: $1.300/mes (antes $1.800), beneficios, contador 85/150 socios, pago por suscripción Mercado Pago.
8. Dónde estamos: 3 fotos del salón, dirección, horario, turnos, botones.
9. FAQ (6 preguntas).
10. Academia: 3 niveles × 3 meses, grupos de 10, $5.500/mes, CTA WhatsApp.
11. CTA final + footer (contacto, links, acceso barberos).
12. Widget flotante "Cuponera" (5 cortes = premio), botón flotante WhatsApp, barra fija de reserva en móvil.

**Integraciones**: agenda propia (`/reservar`), cuentas de cliente con cuponera, Mercado Pago (suscripciones), WhatsApp (wa.me con texto prellenado), Google Maps, Instagram.

**Assets**: logo wordmark PNG, 4 fotos de servicios, 4 videos + posters, 3 fotos del salón, 8 capturas de reseñas, 1 audio, imagen de callout.

**Stack**: HTML/CSS estático en Vercel, Google Fonts, un script `cuponera-flotante.js`.

## 3. Qué cambiaría (como agencia de imagen)

### Posicionamiento
- Pasar de "te arreglamos" a **"el corte que es tuyo"**: el visagismo como método silencioso, no como argumento de venta gritado.
- Un solo mensaje por sección, un solo CTA principal (Reservar). WhatsApp como secundario.

### Dirección visual (aplicada en el prototipo)
- **Paleta**: negro tinta `#0E0E0D` + hueso `#F3F0EA`. Sin dorado. El color lo ponen las fotos.
- **Tipografía**: dos familias con roles claros. Serif editorial (*Instrument Serif*) para títulos y precios; grotesca neutra (*Inter Tight*) para texto. Cero cursivas decorativas.
- **Layout**: mucho aire, líneas finas en vez de tarjetas, servicios como **carta de precios** (como un restaurante bueno), grilla de trabajos en B/N que se colorea al pasar el mouse.
- **Menos widgets**: sin popup, sin burbujas falsas, sin contadores. En móvil una sola barra inferior (Reservar + WhatsApp).
- **Reseñas como texto**: 3 citas cortas con nombre + el 5.0 grande y link a Google. Más creíble y legible.

### Fotografía (lo que más impacto tiene)
- Una sesión de fotos profesional de media jornada: fondo único (la pared de mármol negro del salón es ideal), misma luz, mismo encuadre, el mismo color grading. Retratos de 3/4 + perfil + detalle de manos/herramientas + el equipo.
- Antes y después real: díptico lado a lado, mismo encuadre, o eliminar la sección.
- Retrato de cada barbero con nombre (humaniza y diferencia).

### Oferta
- Revisar el precio Corte vs Corte y barba (mismo precio confunde; si es un error, corregir; si es estrategia, comunicarlo como "barba incluida").
- Membresía en su propia sección tranquila, sin contadores de urgencia.
- Academia y cuponera fuera del flujo principal (bloque discreto / dentro de "Mi cuenta").

### Técnico / SEO
- Dominio propio (`lavis.uy` o `lavisstudio.com.uy`).
- Unificar el nombre en Google Business Profile (Lavis Style → Lavis Studio).
- `og:image` con URL absoluta, datos estructurados `BarberShop` (ya incluidos en el prototipo), imágenes en WebP/AVIF, `alt` descriptivos.
- Medición: evento de clic en "Reservar" y "WhatsApp" (Meta Pixel / GA4) para saber qué convierte desde Instagram.

## 4. Próximos pasos sugeridos
1. Validar dirección visual con el prototipo.
2. Sesión de fotos (antes de pulir el diseño final).
3. Llevar el mismo sistema a `/reservar` y `/mi-cuenta`.
4. Dominio + Google Business + Instagram bio con link nuevo.
