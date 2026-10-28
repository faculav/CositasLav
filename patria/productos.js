/* =========================================================
   TIRRA — datos editables
   Este es el ÚNICO archivo que necesitás tocar para cambiar
   el contenido de la tienda: teléfono, productos y precios.
   ========================================================= */

const CONFIG = {
  // TODO: poné el número real de WhatsApp (formato internacional, sin + ni espacios)
  whatsapp: "59899000000",
  instagram: "somospatria.uy",
  email: "hola@patria.uy",
  // Mensaje que se autocompleta al tocar un producto
  mensajeBase: "¡Hola TIRRA! Me interesa "
};

/* ---------------------------------------------------------
   PRODUCTOS  (todos los datos de abajo son DE EJEMPLO)

   id        : identificador corto, sin espacios
   nombre    : cómo se llama la pieza
   cat       : llaveros | brazaletes | collares | cintos | monederos | sobres
   desc      : una línea corta (material, color, detalle)
   precio    : número en pesos uruguayos (sin puntos)
   antes     : precio tachado, o null si no está en oferta
   tag       : "Nuevo" | "Oferta" | "Agotado" | null
   img       : foto principal   -> images/<archivo>
   img2      : foto secundaria (aparece al pasar el mouse), o null
   --------------------------------------------------------- */

const PRODUCTOS = [
  { id:"lla-01", nombre:"Llavero Campo",       cat:"llaveros",   desc:"Cuero natural, herraje bronce",        precio:390,  antes:null, tag:"Nuevo",   img:"images/prod-lla-01.jpg", img2:"images/prod-lla-01b.jpg" },
  { id:"lla-02", nombre:"Llavero Nudo",        cat:"llaveros",   desc:"Trenzado a mano, tabaco",              precio:450,  antes:null, tag:null,      img:"images/prod-lla-02.jpg", img2:null },
  { id:"lla-03", nombre:"Llavero Mosquetón",   cat:"llaveros",   desc:"Cuero negro, acero inoxidable",        precio:520,  antes:640,  tag:"Oferta",  img:"images/prod-lla-03.jpg", img2:null },

  { id:"bra-01", nombre:"Brazalete Trenza",    cat:"brazaletes", desc:"Trenzado triple, cierre imán",         precio:890,  antes:null, tag:"Nuevo",   img:"images/prod-bra-01.jpg", img2:"images/prod-bra-01b.jpg" },
  { id:"bra-02", nombre:"Brazalete Llanura",   cat:"brazaletes", desc:"Banda ancha, curtido natural",         precio:1150, antes:null, tag:null,      img:"images/prod-bra-02.jpg", img2:null },
  { id:"bra-03", nombre:"Brazalete Doble",     cat:"brazaletes", desc:"Dos vueltas, caramelo",                precio:980,  antes:null, tag:null,      img:"images/prod-bra-03.jpg", img2:null },

  { id:"col-01", nombre:"Collar Sur",          cat:"collares",   desc:"Cordón fino con dije de bronce",       precio:1290, antes:null, tag:null,      img:"images/prod-col-01.jpg", img2:"images/prod-col-01b.jpg" },
  { id:"col-02", nombre:"Collar Raíz",         cat:"collares",   desc:"Cuero negro con nudo central",         precio:1090, antes:null, tag:"Nuevo",   img:"images/prod-col-02.jpg", img2:null },

  { id:"cin-01", nombre:"Cinto Estancia",      cat:"cintos",     desc:"4 cm, hebilla de bronce macizo",       precio:2450, antes:null, tag:null,      img:"images/prod-cin-01.jpg", img2:"images/prod-cin-01b.jpg" },
  { id:"cin-02", nombre:"Cinto Clásico",       cat:"cintos",     desc:"3,5 cm, negro, costura a mano",        precio:2290, antes:2690, tag:"Oferta",  img:"images/prod-cin-02.jpg", img2:null },
  { id:"cin-03", nombre:"Cinto Tabaco",        cat:"cintos",     desc:"3 cm, hebilla níquel mate",            precio:2190, antes:null, tag:null,      img:"images/prod-cin-03.jpg", img2:null },

  { id:"mon-01", nombre:"Monedero Ronda",      cat:"monederos",  desc:"Cierre metálico, forro interior",      precio:1490, antes:null, tag:"Nuevo",   img:"images/prod-mon-01.jpg", img2:"images/prod-mon-01b.jpg" },
  { id:"mon-02", nombre:"Monedero Broche",     cat:"monederos",  desc:"Cuero crema, broche a presión",        precio:1350, antes:null, tag:null,      img:"images/prod-mon-02.jpg", img2:null },
  { id:"mon-03", nombre:"Monedero Tarjetero",  cat:"monederos",  desc:"Cuatro divisiones, negro",             precio:1590, antes:null, tag:"Agotado", img:"images/prod-mon-03.jpg", img2:null },

  { id:"sob-01", nombre:"Sobre Cordillera",    cat:"sobres",     desc:"Tamaño A5, solapa con tiento",         precio:3290, antes:null, tag:null,      img:"images/prod-sob-01.jpg", img2:"images/prod-sob-01b.jpg" },
  { id:"sob-02", nombre:"Sobre Noche",         cat:"sobres",     desc:"Negro mate, interior de gamuza",       precio:3690, antes:null, tag:"Nuevo",   img:"images/prod-sob-02.jpg", img2:null },
  { id:"sob-03", nombre:"Sobre Notebook 13\"", cat:"sobres",     desc:"Acolchado, cierre magnético",          precio:4490, antes:null, tag:null,      img:"images/prod-sob-03.jpg", img2:null }
];
