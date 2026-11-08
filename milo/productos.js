/* =========================================================
   MILO RACIONES — datos editables
   Este es el ÚNICO archivo que hay que tocar para cambiar
   el contenido: teléfono, zonas de envío, productos y precios.
   ========================================================= */

const CONFIG = {
  // WhatsApp en formato internacional, sin + ni espacios (097 051 833)
  whatsapp: "59897051833",
  instagram: "miloraciones" /* TODO: confirmar usuario */,
  email: "infomiloraciones@gmail.com",
  // El envío es siempre gratis (sin mínimo de compra).
  // Hora límite para recibir el pedido en el día
  horaCorte: "14 h"
};

/* ---------------------------------------------------------
   ZONAS DE ENVÍO
   zona    : nombre del barrio / localidad
   dias    : días de reparto
   tipo    : "costa" (Carrasco y Ciudad de la Costa, entrega en el día)
             "cerca" (alrededores, entrega en 24/48 h)
   Solo zonas de este lado del peaje.
   --------------------------------------------------------- */
const ZONAS = [
  { zona: "Carrasco",              dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Barra de Carrasco",     dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Parque de Carrasco",    dias: "Lunes a sábado", tipo: "costa" },
  { zona: "San José de Carrasco",  dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Shangrilá",             dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Lagomar",               dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Solymar",               dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Lomas de Solymar",      dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Médanos de Solymar",    dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Colinas de Solymar",    dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Montes de Solymar",     dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Lomas de Carrasco",     dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Carmel",                dias: "Lunes a sábado", tipo: "costa" },
  { zona: "El Pinar",              dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Pinar Norte",           dias: "Lunes a sábado", tipo: "costa" },
  { zona: "Paso Carrasco",         dias: "Martes, jueves y sábado", tipo: "cerca" },
  { zona: "Colonia Nicolich",      dias: "Martes, jueves y sábado", tipo: "cerca" }
  // No llegamos a localidades después del peaje (Neptunia, Pinamar, Salinas, etc.)
];

/* ---------------------------------------------------------
   PRODUCTOS  (snacks, antipulgas, arena y accesorios: precios DE EJEMPLO)

   id      : identificador corto, sin espacios (también es el
             nombre de la foto: images/<id>.jpg)
   nombre  : nombre del producto
   marca   : marca (se usa para el filtro y el color del placeholder)
   cat     : perros | gatos | snacks | antipulgas | arena | accesorios
   desc    : una línea corta
   opciones: presentaciones disponibles. Cada una con
             etiqueta (ej. "15 kg"), precio y, si es ración,
             kg (número) para calcular el precio por kilo.
   tag     : "Más vendido" | "Oferta" | "Nuevo" | "Sin stock" | null
   --------------------------------------------------------- */
// Los alimentos (perros y gatos) vienen de alimentos.js, generado
// desde distribuidoralopez.com.uy con herramientas/importar_lopez.py.
// Acá abajo van los demás productos (snacks, antipulgas, arena, accesorios).
// "img" es opcional: si no está, se busca images/<id>.jpg.
const PRODUCTOS = (typeof ALIMENTOS !== "undefined" ? ALIMENTOS : []).concat([
  // ── Snacks ─────────────────────────────────────────────
  { id: "dentastix",          nombre: "Dentastix Razas Medianas x7",     marca: "Pedigree", cat: "snacks",
    desc: "Limpieza dental diaria",
    opciones: [ { etiqueta: "1 pack", precio: 260 }, { etiqueta: "3 packs", precio: 720 } ],
    tag: null },
  { id: "galletas-milo",      nombre: "Galletitas de premio",            marca: "Toky", cat: "snacks",
    desc: "Para entrenamiento, bolsa de 500 g",
    opciones: [ { etiqueta: "500 g", precio: 240 } ],
    tag: null },
  { id: "churu",              nombre: "Snack cremoso para gatos x4",     marca: "Excellent", cat: "snacks",
    desc: "Atún y pollo, en sobrecitos",
    opciones: [ { etiqueta: "x4", precio: 210 } ],
    tag: "Nuevo" },

  // ── Antipulgas ─────────────────────────────────────────
  { id: "pipeta-perro",       nombre: "Pipeta antipulgas perros",        marca: "Power Ultra", cat: "antipulgas",
    desc: "Pulgas, garrapatas y piojos. Elegí el peso",
    opciones: [ { etiqueta: "hasta 10 kg", precio: 390 }, { etiqueta: "10 a 20 kg", precio: 450 }, { etiqueta: "20 a 40 kg", precio: 520 } ],
    tag: null },
  { id: "pipeta-gato",        nombre: "Pipeta antipulgas gatos",         marca: "Power Ultra", cat: "antipulgas",
    desc: "Protección mensual para gatos",
    opciones: [ { etiqueta: "hasta 4 kg", precio: 350 }, { etiqueta: "más de 4 kg", precio: 390 } ],
    tag: null },
  { id: "collar-antipulgas",  nombre: "Collar antipulgas",               marca: "Power Ultra", cat: "antipulgas",
    desc: "Hasta 6 meses de protección",
    opciones: [ { etiqueta: "Perro", precio: 590 }, { etiqueta: "Gato", precio: 490 } ],
    tag: null },

  // ── Arena ──────────────────────────────────────────────
  { id: "arena-aglomerante",  nombre: "Arena aglomerante",               marca: "Jazz", cat: "arena",
    desc: "Bentonita, controla olores",
    opciones: [ { etiqueta: "4 kg", kg: 4, precio: 390 }, { etiqueta: "10 kg", kg: 10, precio: 850 } ],
    tag: "Más vendido" },
  { id: "arena-silica",       nombre: "Arena de sílica",                 marca: "Jazz", cat: "arena",
    desc: "Rinde hasta un mes por gato",
    opciones: [ { etiqueta: "3,8 L", precio: 590 } ],
    tag: null },

  // ── Accesorios ─────────────────────────────────────────
  { id: "plaquit",            nombre: "Plaquit · Chapita QR de identificación", marca: "Plaquit", cat: "accesorios",
    desc: "Perfil de tu mascota con un escaneo. Sin batería, sin apps",
    // TODO: poner el precio real. Mientras sea null, la tarjeta dice "Consultar".
    opciones: [ { etiqueta: "Chapita QR", precio: null } ],
    tag: "Nuevo", img: "images/plaquit-chapa.jpg" },
  { id: "comedero-acero",     nombre: "Comedero de acero inoxidable",    marca: "Milo", cat: "accesorios",
    desc: "Base antideslizante, fácil de lavar",
    opciones: [ { etiqueta: "Chico", precio: 290 }, { etiqueta: "Mediano", precio: 390 }, { etiqueta: "Grande", precio: 490 } ],
    tag: null },
  { id: "correa",             nombre: "Correa reforzada 1,5 m",          marca: "Milo", cat: "accesorios",
    desc: "Nylon con mosquetón de metal",
    opciones: [ { etiqueta: "Chica", precio: 350 }, { etiqueta: "Grande", precio: 450 } ],
    tag: null },
  { id: "cama",               nombre: "Cama acolchada",                  marca: "Milo", cat: "accesorios",
    desc: "Funda lavable, base impermeable",
    opciones: [ { etiqueta: "S", precio: 1290 }, { etiqueta: "M", precio: 1690 }, { etiqueta: "L", precio: 2190 } ],
    tag: "Nuevo" },
  { id: "rascador",           nombre: "Rascador con plataforma",         marca: "Milo", cat: "accesorios",
    desc: "Sisal natural, 60 cm de alto",
    opciones: [ { etiqueta: "Único", precio: 1490 } ],
    tag: null },
  { id: "bandeja-sanitaria",  nombre: "Bandeja sanitaria con borde",     marca: "Milo", cat: "accesorios",
    desc: "Evita que la arena salga",
    opciones: [ { etiqueta: "Única", precio: 450 } ],
    tag: null },
  { id: "juguete-cuerda",     nombre: "Juguete de cuerda",               marca: "Milo", cat: "accesorios",
    desc: "Algodón trenzado, para morder y tironear",
    opciones: [ { etiqueta: "Único", precio: 220 } ],
    tag: null }
]);
