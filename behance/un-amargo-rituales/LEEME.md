# Un Amargo — Rituales · Proyecto para Behance

Todo lo necesario para publicar el proyecto de las guías interactivas en 3D
("Cómo cebar un buen amargo" y "Cómo curar tu mate").

## Orden de subida

Los números de los archivos ya marcan el orden. Las láminas en `laminas/` y los videos en `videos/` se intercalan así:

| # | Archivo | Qué es |
|---|---------|--------|
| 01 | `laminas/01-intro.jpg` | Título "Rituales." + la guía en un navegador |
| 02 | `laminas/02-concepto.jpg` | Desafío / Idea / Resultado |
| 03 | `videos/03-video-como-cebar.mp4` | Recorrido completo de la guía de cebar (19 s) |
| 04 | `laminas/04-como-cebar.jpg` | Los 6 pasos en grilla |
| 05 | `videos/05a-video-curar-calabaza.mp4` | Guía de curado, camino calabaza (14 s) |
| 05 | `videos/05b-video-curar-algarrobo.mp4` | Guía de curado, camino algarrobo (19 s). Opcional: si querés un proyecto más corto, subí solo uno de los dos |
| 06 | `laminas/06-como-curar.jpg` | Calabaza vs. algarrobo |
| 07 | `laminas/07-mobile.jpg` | 4 pantallas de celular |
| 08 | `videos/08a-video-mobile-cebar.mp4` | Recorrido en celular (opcional) |
| 09 | `laminas/09-sistema.jpg` | Tipografía, colores y reglas del sistema |
| 10 | `laminas/10-cierre.jpg` | El paso final en negro, a pantalla completa |
| 11 | `laminas/11-gracias.jpg` | Cierre con créditos |

**Portada del proyecto (cover):** `laminas/00-portada-808x632.jpg`. Hay también una versión al doble de tamaño (`-2x`) por si Behance te pide recortarla.

**Textos, tags y campos:** en `TEXTO-BEHANCE.md`.

## Cómo subir

1. Behance → **Create a Project**.
2. Subí las láminas con **Image** y los videos con **Video**, en el orden de la tabla.
3. En **Settings** del editor: ancho de contenido **1400 px**, espaciado entre módulos **0**, fondo blanco `#FFFFFF`. Así las láminas quedan pegadas, como una sola pieza.
4. Los videos de Behance normalmente necesitan un clic para reproducirse. Si querés que se muevan solos al scrollear, convertilos a GIF y subilos como imagen. Revisá el límite de peso que muestra Behance al subir.
5. Portada, título, descripción y tags: copiarlos de `TEXTO-BEHANCE.md`.

## Detalles técnicos

- Las láminas miden 2800 px de ancho (el doble de 1400) para que se vean nítidas en pantallas retina.
- Los videos se grabaron en cámara lenta y después se aceleraron a velocidad real, para que las animaciones 3D queden fluidas (30 fps).
- `fuente/` tiene el HTML de las láminas y los scripts que las generaron, para poder rehacerlas si cambia algo en las guías. Las capturas que usa (`stills/`) no están en el repo: se vuelven a sacar con Playwright.
- **Tipografía:** las capturas se sacaron en un entorno sin Helvetica Neue, así que el texto de las guías y de las láminas se ve en **Inter**, que es muy parecida. Si querés que sea Helvetica exacta, hay que volver a sacar las capturas en una Mac.
