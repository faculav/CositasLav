# Lavis Studio · Web nueva: guía para integrarla

Esta carpeta trae el diseño nuevo de la web de Lavis listo para reemplazar la portada actual
(`lavis-studio.vercel.app`). El diseño está terminado; falta conectarlo a la agenda y las cuentas que ya
existen en el proyecto actual (Next.js en Vercel).

## Qué hay en la carpeta

| Archivo | Qué es |
|---|---|
| `index.html` | La web completa: HTML, CSS y JavaScript en un solo archivo. |
| `assets/` | Logo, fotos del equipo, servicios, salón, productos y los 4 videos de antes y después. |
| `ENTREGA.md` | Esta guía. |

No usar `lavis-preview.html` ni `lavis-demo.html`: son copias para mostrar, con imágenes comprimidas y datos de ejemplo.

## Cómo ponerla en el proyecto actual

La opción más simple, sin rehacer nada en React:

1. Copiar `index.html` y la carpeta `assets/` del paquete a `public/nueva/` del proyecto Next.js.
2. Hacer que `/` muestre esa página. Por ejemplo, con un rewrite en `next.config.js` de `/` a `/nueva/index.html`,
   o reemplazando la página de inicio por un redirect.
3. Como queda en el mismo dominio, la página nueva **ya lee sola** las rutas `/api/turnos/...` del proyecto.

`/reservar`, `/mi-cuenta` y `/login` pueden quedar como están mientras tanto.

## Qué ya está conectado (lee del sistema actual)

La agenda nueva llama a estas rutas, que ya existen en el proyecto:

- `GET /api/turnos/servicios`: lista de servicios, precios y duraciones (incluidos los de membresía, `solo_membresia`).
- `GET /api/turnos/barberos`: barberos.
- `GET /api/turnos/disponibilidad?fecha=AAAA-MM-DD&duracion_min=N`: horarios libres por barbero.

Si alguna falla, la página usa datos de ejemplo para no romperse.

## Lo que falta conectar (en orden de importancia)

### 1. Guardar la reserva (lo principal)

Al tocar **Confirmar reserva**, la página llama a `window.LAVIS_CONFIRMAR(payload)` **si existe**. Hoy no
existe, así que muestra la confirmación pero no guarda nada. Hay que definir esa función para que llame al mismo
endpoint que usa hoy `/reservar` para crear el turno. Ese es el que dispara el WhatsApp y el mail de confirmación
(la otra IA vinculada).

El `payload` que recibe:

```js
{
  servicios:   ["<id servicio>", ...],   // ids de /api/turnos/servicios
  barbero_id:  "<id>" | null,            // null = "el primero libre"
  fecha:       "AAAA-MM-DD",
  hora:        "HH:MM",
  telefono:    "...",
  nombre:      "...",
  email:       "...",
  cumpleanos:  "AAAA-MM-DD" | null
}
```

Ejemplo, para pegar antes de `</body>` en `index.html`, adaptando la URL y los nombres de campos a los del endpoint real:

```html
<script>
window.LAVIS_CONFIRMAR = async (p) => {
  const r = await fetch('/api/turnos/reservar', {      // ← usar la ruta real de creación de turnos
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p)                           // ← mapear campos si el endpoint espera otros nombres
  });
  if (!r.ok) throw new Error('No se pudo reservar');
  const d = await r.json();
  if (d.token) localStorage.setItem('lavis_cliente_token', d.token); // si el endpoint devuelve el token de la cuenta
  return d;
};
</script>
```

Si `LAVIS_CONFIRMAR` lanza un error, la página avisa "No pudimos guardar la reserva" y no muestra el "¡Listo!".
Cuando está definida, desaparece el aviso de "Vista previa" de la agenda.

### 2. Cuponera real

Hoy la cuponera de la página nueva usa un contador de ejemplo en el navegador (`localStorage: lavis_sellos_demo`).
Hay que reemplazarlo por los sellos reales:
- Si hay `lavis_cliente_token` guardado, llamar a `GET /api/cliente/yo` con el header `x-cliente-token` (como hace hoy
  `cuponera-flotante.js`) y pintar los sellos.
- La pantalla "Ver mi cuponera" (entrar con el teléfono) puede mandar directo a `/mi-cuenta` hasta que se integre.

Funciones a tocar en `index.html`: `renderCuenta()`, `renderDone()` y la línea que pinta `.stamps` al cargar.

### 3. Oferta de black mask

La agenda actual ofrece sumar black mask con descuento (`GET /api/turnos/oferta`). La nueva todavía no la muestra.
Se agrega entre "Elegí la hora" y "Tus datos".

### 4. Links y datos a revisar

- **WhatsApp:** `wa.me/59895459911`, con mensajes ya escritos.
- **Membresía:** link de suscripción de Mercado Pago (el mismo de la web actual).
- **Instagram:** `@laviss_studio`.
- **Google Maps:** el local de "Lavis Style". Conviene unificar el nombre a "Lavis Studio" en Google.
- **Próximo turno** (portada): se calcula con `/api/turnos/disponibilidad`.
- **Mensaje de confirmación por WhatsApp:** hoy manda a `/mi-cuenta`. Si cambia esa ruta, actualizar el link en el sistema que lo envía.
- **Textos inventados que conviene revisar:** los nombres de los videos de antes y después ("Rulos definidos", etc.)
  y la especialidad de cada barbero (hoy dice solo "Barbero").

## Detalles técnicos

- La silla 3D usa three.js desde `cdn.jsdelivr.net` (versión 0.160.0). Necesita internet.
- El mapa es un embed de Google Maps. No necesita clave de API.
- Las fuentes vienen de Google Fonts: Inter, Jost, Unbounded y JetBrains Mono.
- Si el navegador no ejecuta JavaScript, la página se ve completa pero sin animaciones, sin silla y sin agenda.
- Respeta "reducir movimiento": si el dispositivo lo tiene activado, no hay animaciones.

## Prompt sugerido para Claude

> Tengo la web de mi barbería en Next.js (Vercel) con agenda propia en `/api/turnos`, cuentas de cliente y cuponera.
> Te paso una nueva portada en `index.html` + `assets/` y su guía `ENTREGA.md`. Integrala en el proyecto como página
> de inicio y conectá la reserva: implementá `window.LAVIS_CONFIRMAR(payload)` usando el mismo endpoint que hoy usa
> `/reservar` para crear turnos (así se siguen enviando el WhatsApp y el mail de confirmación). Después conectá la
> cuponera real con `/api/cliente/yo` y agregá la oferta de `/api/turnos/oferta`. No cambies el diseño.
