/* =========================================================
   TIRRA — comportamiento
   ========================================================= */
(function () {
  "use strict";

  /* ---------- placeholders de imagen ----------
     Mientras no existan las fotos reales en /images,
     cada <img> que falle se reemplaza por un bloque en
     tonos cuero con su etiqueta. Al subir el archivo real
     con ese nombre, el placeholder desaparece solo.        */
  var TONOS = [
    ["#f4ede1", "#d8c9b4"], ["#e7dccb", "#b9a284"],
    ["#ded2c0", "#a68a6e"], ["#eee5d6", "#c2ad94"]
  ];

  function placeholder(texto, i) {
    var t = TONOS[i % TONOS.length];
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + t[0] + '"/><stop offset="1" stop-color="' + t[1] + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="800" height="1000" fill="url(#g)"/>' +
      '<text x="400" y="492" font-family="Inter,Helvetica,Arial,sans-serif" font-weight="700" ' +
      'font-size="36" fill="#4b3729" text-anchor="middle" letter-spacing="-1">TIRRA</text>' +
      '<text x="400" y="534" font-family="Inter,Helvetica,Arial,sans-serif" font-size="19" ' +
      'fill="#7d6f64" text-anchor="middle" letter-spacing="1">' + texto + '</text>' +
      '</svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* ---------- logo ----------
     Si no existe images/logo.png (o .png), se muestra el
     wordmark de texto en vez de un placeholder.            */
  document.querySelectorAll("[data-logo]").forEach(function (img) {
    img.addEventListener("error", function () {
      var cont = img.closest(".logo") || img.parentElement;
      if (cont) cont.classList.add("sin-logo");
    });
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event("error"));
  });

  var contador = 0;
  function cuidarImagen(img) {
    if (img.dataset.phListo || img.hasAttribute("data-logo")) return;
    img.dataset.phListo = "1";
    var i = contador++;
    img.addEventListener("error", function () {
      var etiqueta = img.dataset.ph || img.alt || "Foto";
      etiqueta = etiqueta.replace(/&middot;/g, "·").replace(/&bull;/g, "·");
      img.src = placeholder(etiqueta.toUpperCase(), i);
    });
    // si ya falló antes de que enganchemos el listener
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event("error"));
  }
  document.querySelectorAll("img").forEach(cuidarImagen);

  /* ---------- links de WhatsApp ---------- */
  function linkWhatsapp(mensaje) {
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(mensaje);
  }
  document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
    a.href = linkWhatsapp("¡Hola TIRRA! Quería hacerles una consulta.");
  });

  /* ---------- render de productos ---------- */
  var cont = document.getElementById("productos");

  function precio(n) {
    return "$ " + n.toLocaleString("es-UY");
  }

  function tarjeta(p, i) {
    var agotado = p.tag === "Agotado";
    var a = document.createElement("a");
    a.className = "producto reveal";
    a.dataset.cat = p.cat;
    a.href = linkWhatsapp(CONFIG.mensajeBase + p.nombre + " (" + precio(p.precio) + "). ¿Está disponible?");
    a.target = "_blank";
    a.rel = "noopener";

    a.innerHTML =
      '<div class="producto__media">' +
        (p.tag ? '<span class="producto__tag' + (agotado ? " producto__tag--agotado" : "") + '">' + p.tag + "</span>" : "") +
        '<img class="a" src="' + p.img + '" alt="' + p.nombre + '" data-ph="' + p.nombre + '" loading="lazy">' +
        (p.img2 ? '<img class="b" src="' + p.img2 + '" alt="" data-ph="' + p.nombre + ' 2" loading="lazy">' : "") +
        '<span class="producto__consulta">' + (agotado ? "Consultar reposición" : "Consultar por WhatsApp") + "</span>" +
      "</div>" +
      '<div class="producto__info">' +
        '<h3 class="producto__nombre">' + p.nombre + "</h3>" +
        '<p class="producto__desc">' + p.desc + "</p>" +
        '<p class="producto__precio">' +
          (p.antes ? "<s>" + precio(p.antes) + "</s>" : "") + precio(p.precio) +
        "</p>" +
      "</div>";

    a.querySelectorAll("img").forEach(cuidarImagen);
    a.style.transitionDelay = (i % 4) * 60 + "ms";
    return a;
  }

  function pintar(filtro) {
    cont.innerHTML = "";
    PRODUCTOS
      .filter(function (p) { return filtro === "todos" || p.cat === filtro; })
      .forEach(function (p, i) { cont.appendChild(tarjeta(p, i)); });
    observarReveals();
  }

  if (cont) pintar("todos");

  /* ---------- filtros ---------- */
  var filtros = document.getElementById("filtros");
  if (filtros) {
    filtros.addEventListener("click", function (e) {
      var b = e.target.closest(".filtro");
      if (!b) return;
      filtros.querySelectorAll(".filtro").forEach(function (x) { x.classList.remove("is-activo"); });
      b.classList.add("is-activo");
      pintar(b.dataset.filtro);
    });
  }

  /* ---------- categorías -> filtran la colección ---------- */
  document.querySelectorAll("[data-ir]").forEach(function (c) {
    c.addEventListener("click", function () {
      var b = filtros && filtros.querySelector('[data-filtro="' + c.dataset.ir + '"]');
      if (b) b.click();
    });
  });

  /* ---------- menú móvil ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menuMovil");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var abierto = menu.classList.toggle("is-abierto");
      burger.classList.toggle("is-abierto", abierto);
      burger.setAttribute("aria-expanded", String(abierto));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("is-abierto");
        burger.classList.remove("is-abierto");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- sombra del header ---------- */
  var header = document.getElementById("header");
  window.addEventListener("scroll", function () {
    header.classList.toggle("is-scroll", window.scrollY > 10);
  }, { passive: true });

  /* ---------- animación de entrada ---------- */
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  }
  function observarReveals() {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
      if (io) io.observe(el); else el.classList.add("is-visible");
    });
  }
  [".beneficio", ".cat", ".seccion__head", ".editorial__img", ".editorial__texto",
   ".cuidados article", ".ig__grid a", ".contacto__inner"].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { el.classList.add("reveal"); });
  });
  observarReveals();

  /* ---------- año del footer ---------- */
  var anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();
})();
