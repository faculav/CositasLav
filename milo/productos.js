/* =========================================================
   MILO RACIONES — datos editables
   Este es el ÚNICO archivo que hay que tocar para cambiar
   el contenido: teléfono, zonas de envío, productos y precios.
   ========================================================= */

const CONFIG = {
  // TODO: número real de WhatsApp (formato internacional, sin + ni espacios)
  whatsapp: "59899000000",
  instagram: "miloraciones",
  email: "hola@miloraciones.uy",
  // Compra mínima para envío sin costo (en pesos)
  envioGratisDesde: 1500,
  // Costo de envío cuando no se llega al mínimo
  costoEnvio: 120,
  // Hora límite para recibir el pedido en el día
  horaCorte: "14 h"
};

/* ---------------------------------------------------------
   ZONAS DE ENVÍO
   zona    : nombre del barrio / localidad
   dias    : días de reparto
   tipo    : "costa" (Ciudad de la Costa, entrega en el día)
             "cerca" (alrededores, entrega en 24/48 h)
   --------------------------------------------------------- */
const ZONAS = [
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
  { zona: "Colonia Nicolich",      dias: "Martes, jueves y sábado", tipo: "cerca" },
  { zona: "Carrasco (Montevideo)", dias: "Martes, jueves y sábado", tipo: "cerca" },
  { zona: "Neptunia",              dias: "Miércoles y sábado",      tipo: "cerca" },
  { zona: "Pinamar",               dias: "Miércoles y sábado",      tipo: "cerca" },
  { zona: "Salinas",               dias: "Miércoles y sábado",      tipo: "cerca" }
];

/* ---------------------------------------------------------
   PRODUCTOS  (precios DE EJEMPLO — reemplazar por los reales)

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
const PRODUCTOS = [
  // ── Perros ─────────────────────────────────────────────
  { id: "equilibrio-adulto",  nombre: "Equilibrio Adulto Razas Medianas", marca: "Equilibrio", cat: "perros",
    desc: "Alta digestibilidad, con omega 3 y 6",
    opciones: [ { etiqueta: "2 kg", kg: 2, precio: 890 }, { etiqueta: "7,5 kg", kg: 7.5, precio: 2690 }, { etiqueta: "15 kg", kg: 15, precio: 4790 } ],
    tag: "Más vendido" },
  { id: "proplan-adulto",     nombre: "Pro Plan Adulto Razas Medianas",  marca: "Pro Plan", cat: "perros",
    desc: "Con OptiHealth, pollo y arroz",
    opciones: [ { etiqueta: "3 kg", kg: 3, precio: 1590 }, { etiqueta: "15 kg", kg: 15, precio: 6490 } ],
    tag: null },
  { id: "dogchow-adulto",     nombre: "Dog Chow Adulto",                 marca: "Dog Chow", cat: "perros",
    desc: "Carne y pollo, todas las razas",
    opciones: [ { etiqueta: "3 kg", kg: 3, precio: 790 }, { etiqueta: "21 kg", kg: 21, precio: 3990 } ],
    tag: "Oferta" },
  { id: "frost-cachorro",     nombre: "Frost Cachorro",                  marca: "Frost", cat: "perros",
    desc: "Para cachorros de todas las razas",
    opciones: [ { etiqueta: "3 kg", kg: 3, precio: 990 }, { etiqueta: "15 kg", kg: 15, precio: 3990 } ],
    tag: null },
  { id: "biofresh-adulto",    nombre: "BioFresh Adulto Razas Pequeñas",  marca: "BioFresh", cat: "perros",
    desc: "Carnes frescas, sin conservantes artificiales",
    opciones: [ { etiqueta: "1 kg", kg: 1, precio: 690 }, { etiqueta: "3 kg", kg: 3, precio: 1790 }, { etiqueta: "10,1 kg", kg: 10.1, precio: 4990 } ],
    tag: "Nuevo" },
  { id: "pedigree-adulto",    nombre: "Pedigree Adulto",                 marca: "Pedigree", cat: "perros",
    desc: "Carne, pollo y vegetales",
    opciones: [ { etiqueta: "3 kg", kg: 3, precio: 690 }, { etiqueta: "21 kg", kg: 21, precio: 3490 } ],
    tag: null },
  { id: "lager-adulto",       nombre: "Lager Adulto",                    marca: "Lager", cat: "perros",
    desc: "Rendidora, ideal para perros activos",
    opciones: [ { etiqueta: "22 kg", kg: 22, precio: 2690 } ],
    tag: null },

  // ── Gatos ──────────────────────────────────────────────
  { id: "catchow-adulto",     nombre: "Cat Chow Adulto",                 marca: "Cat Chow", cat: "gatos",
    desc: "Pescado y carne, defensas fortalecidas",
    opciones: [ { etiqueta: "1 kg", kg: 1, precio: 490 }, { etiqueta: "8 kg", kg: 8, precio: 2990 } ],
    tag: "Más vendido" },
  { id: "equilibrio-gato",    nombre: "Equilibrio Gatos Castrados",      marca: "Equilibrio", cat: "gatos",
    desc: "Control de peso y salud urinaria",
    opciones: [ { etiqueta: "1,5 kg", kg: 1.5, precio: 890 }, { etiqueta: "7,5 kg", kg: 7.5, precio: 3490 } ],
    tag: null },
  { id: "excellent-gato",     nombre: "Excellent Gato Adulto",           marca: "Excellent", cat: "gatos",
    desc: "Pollo y arroz, pelaje brillante",
    opciones: [ { etiqueta: "1 kg", kg: 1, precio: 590 }, { etiqueta: "7,5 kg", kg: 7.5, precio: 3190 } ],
    tag: null },
  { id: "whiskas-adulto",     nombre: "Whiskas Adulto Carne",            marca: "Whiskas", cat: "gatos",
    desc: "Sabor carne, croquetas crocantes",
    opciones: [ { etiqueta: "1 kg", kg: 1, precio: 420 }, { etiqueta: "10 kg", kg: 10, precio: 3290 } ],
    tag: "Oferta" },
  { id: "proplan-gato",       nombre: "Pro Plan Gato Adulto",            marca: "Pro Plan", cat: "gatos",
    desc: "Pollo y arroz, con prebióticos",
    opciones: [ { etiqueta: "1,5 kg", kg: 1.5, precio: 1190 }, { etiqueta: "7,5 kg", kg: 7.5, precio: 4790 } ],
    tag: null },

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
];
