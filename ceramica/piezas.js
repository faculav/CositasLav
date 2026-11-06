/* =========================================================
   PIEZAS — editá esta lista para cargar las piezas de LU.
   - foto: ruta a la imagen dentro de /img (jpg, png o webp)
   - estado: "disponible" | "vendida" | "encargo"
   - medidas / precio: dejar "" para no mostrarlos
   - nota: opcional, un texto destacado (premios, muestras, etc.)
   ========================================================= */
const PIEZAS = [
  { nombre: "Jarra Musgo",      medidas: "", material: "Gres, esmalte verde moteado, base sin esmaltar", precio: "", estado: "disponible", foto: "img/jarra-musgo.webp" },
  { nombre: "Cuenco Líneas",    medidas: "", material: "Gres blanco mate, esgrafiado a mano",            precio: "", estado: "disponible", foto: "img/cuenco-lineas.webp" },
  { nombre: "Porta sahumerio",  medidas: "", material: "Bandeja esmaltada verde oliva, soporte ámbar",  precio: "", estado: "disponible", foto: "img/porta-sahumerio.webp" },
  { nombre: "La magia del abrazo", medidas: "", material: "Gres texturado, sin esmaltar, piezas encastrables", precio: "", estado: "disponible", foto: "img/abrazo.webp",
    nota: "Proyecto destacado del taller «Lazos primordiales»." },
];

/* Datos de contacto: cambiá estos valores */
const CONTACTO = {
  whatsapp: "59898590483",             // código país + número, sin + ni espacios
  instagram: "",                       // sin @ — vacío = "próximamente"
};
