/* =========================================================
   TIRRA — datos editables
   Este es el ÚNICO archivo que necesitás tocar para cambiar
   el contenido de la tienda: teléfono, productos y precios.
   ========================================================= */

const CONFIG = {
  // TODO: poné el número real de WhatsApp (formato internacional, sin + ni espacios)
  whatsapp: "59899000000",
  // Instagram y email de Tirra (se usan en toda la página)
  instagram: "tirra.uy",
  // TODO: email real de Tirra
  email: "hola@patria.uy",
  // Mensaje que se autocompleta al tocar un producto
  mensajeBase: "¡Hola TIRRA! Me interesa "
};

/* ---------------------------------------------------------
   PRODUCTOS  (nombres y fotos sacados del Figma de Tirra)

   id        : identificador corto, sin espacios
   nombre    : cómo se llama la pieza
   cat       : pecheras | collares | brazaletes | pulseras
   desc      : una línea corta (material, color, detalle)
   precio    : número en pesos uruguayos (sin puntos),
               o null para mostrar "Consultar precio"
   antes     : precio tachado, o null si no está en oferta
   tag       : "Nuevo" | "Oferta" | "Agotado" | null
   img       : foto del producto SOLO, en fondo blanco -> images/<archivo>
   img2      : foto de ambiente / puesto (aparece al pasar el mouse), o null
               Si todavía no existe la foto en fondo blanco, se muestra
               img2 directamente (sin efecto al pasar el mouse).
   --------------------------------------------------------- */

// TODO: faltan los precios reales (hoy todos dicen "Consultar precio")
const PRODUCTOS = [
  { id:"pec-cria",    nombre:"Pechera Cría",       cat:"pecheras",   desc:"Gamuza marrón, cordones y bolsillo cebra con tachas", precio:1990, antes:null, tag:"Nuevo", img:"images/prod-pec-cria.jpg", img2:"images/prod-pec-cria-b.jpg" },

  { id:"col-tierra",  nombre:"Collar Tierra",      cat:"collares",   desc:"Cuero vacuno + piedra natural",       precio:null, antes:null, tag:"Nuevo", img:"images/prod-col-tierra-blanco.jpg", img2:"images/prod-col-tierra.jpg" },
  { id:"col-pampa",   nombre:"Collar Pampa",       cat:"collares",   desc:"Cuero vacuno + dije de nácar",        precio:null, antes:null, tag:"Nuevo", img:"images/prod-col-pampa-blanco.jpg",  img2:"images/prod-col-pampa.jpg" },
  { id:"col-ocre",    nombre:"Collar Ocre",        cat:"collares",   desc:"Cuero vacuno + piedra natural",       precio:null, antes:null, tag:null,    img:"images/prod-col-ocre-blanco.jpg",   img2:"images/prod-col-ocre.jpg" },
  { id:"col-greda",   nombre:"Collar Greda",       cat:"collares",   desc:"Cuero vacuno + piedra natural",       precio:null, antes:null, tag:null,    img:"images/prod-col-greda-blanco.jpg",  img2:"images/prod-col-greda.jpg" },

  { id:"bra-origen",  nombre:"Brazalete Origen",   cat:"brazaletes", desc:"Cuero con pelo blanco y negro",       precio:null, antes:null, tag:null,    img:"images/prod-bra-origen.jpg",  img2:"images/amb-brazaletes.jpg" },
  { id:"bra-brava",   nombre:"Brazalete Brava",    cat:"brazaletes", desc:"Cuero con pelo estampado cebra",      precio:null, antes:null, tag:null,    img:"images/prod-bra-brava.jpg",   img2:"images/amb-brazaletes.jpg" },
  { id:"bra-sombra",  nombre:"Brazalete Sombra",   cat:"brazaletes", desc:"Cuero negro grabado croco, tachas",   precio:null, antes:null, tag:null,    img:"images/prod-bra-sombra.jpg",  img2:"images/amb-brazaletes.jpg" },

  { id:"pul-tierra",  nombre:"Pulsera Tierra",     cat:"pulseras",   desc:"Cuero marrón, tachas de bronce",      precio:null, antes:null, tag:null,    img:"images/prod-pul-tierra.jpg",  img2:"images/amb-pulseras.jpg" },
  { id:"pul-raices",  nombre:"Pulsera Raíces",     cat:"pulseras",   desc:"Cuero con pelo, cierre a presión",    precio:null, antes:null, tag:null,    img:"images/prod-pul-raices.jpg",  img2:"images/amb-pulseras.jpg" },
  // TODO: falta la foto de la Pulsera Savia (images/prod-pul-savia.jpg)
  { id:"pul-savia",   nombre:"Pulsera Savia",      cat:"pulseras",   desc:"Cuero genuino",                       precio:null, antes:null, tag:null,    img:"images/prod-pul-savia.jpg",   img2:"images/amb-pulseras.jpg" }
];
