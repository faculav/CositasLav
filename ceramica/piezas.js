/* =========================================================
   PIEZAS — editá esta lista para cargar la colección.
   - foto: ruta a la imagen dentro de /img (jpg, png o webp)
   - estado: "disponible" | "vendida" | "encargo"
   - precio: dejar "" para no mostrarlo
   ========================================================= */
const PIEZAS = [
  { nombre: "Vasija Tierra",   medidas: "28 × 18 cm", material: "Gres, esmalte mate",       precio: "", estado: "disponible", foto: "img/pieza-1.svg" },
  { nombre: "Arco",            medidas: "24 × 30 cm", material: "Gres negro, sin esmaltar", precio: "", estado: "disponible", foto: "img/pieza-2.svg" },
  { nombre: "Jarra Hueso",     medidas: "26 × 20 cm", material: "Gres blanco, satinado",    precio: "", estado: "vendida",    foto: "img/pieza-3.svg" },
  { nombre: "Ojo",             medidas: "30 × 22 cm", material: "Terracota, engobe ocre",   precio: "", estado: "disponible", foto: "img/pieza-4.svg" },
  { nombre: "Facetada",        medidas: "32 × 16 cm", material: "Gres, esmalte cobalto",    precio: "", estado: "encargo",    foto: "img/pieza-5.svg" },
  { nombre: "Botella Piel",    medidas: "27 × 17 cm", material: "Terracota pulida",          precio: "", estado: "disponible", foto: "img/pieza-6.svg" },
];

/* Datos de contacto: cambiá estos valores */
const CONTACTO = {
  whatsapp: "5490000000000",           // código país + área + número, sin + ni espacios
  instagram: "tu.usuario",             // sin @
  email: "hola@tumarca.com",
};
