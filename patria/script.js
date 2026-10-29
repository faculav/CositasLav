/* =========================================================
   TIRRA — comportamiento
   ========================================================= */
(function () {
  "use strict";

  /* ---------- placeholders de imagen ----------
     Mientras no existan las fotos reales en /images,
     cada <img> que falle se reemplaza por un bloque en
     tonos neutros con su etiqueta. Al subir el archivo real
     con ese nombre, el placeholder desaparece solo.        */
  var TONOS = [
    ["#f3f1ee", "#ddd7cf"], ["#ece8e2", "#cfc6ba"],
    ["#e6e1da", "#c4b8a9"], ["#f0ece6", "#d6cdc1"]
  ];

  function placeholder(texto, i) {
    var t = TONOS[i % TONOS.length];
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + t[0] + '"/><stop offset="1" stop-color="' + t[1] + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="800" height="800" fill="url(#g)"/>' +
      '<text x="400" y="392" font-family="Raleway,Helvetica,Arial,sans-serif" font-weight="600" ' +
      'font-size="34" fill="#4b3729" text-anchor="middle" letter-spacing="4">TIRRA</text>' +
      '<text x="400" y="434" font-family="Raleway,Helvetica,Arial,sans-serif" font-size="18" ' +
      'fill="#8a8a8a" text-anchor="middle" letter-spacing="2">' + texto + '</text>' +
      '</svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* ---------- logo ----------
     Si no existe images/logo.png, se muestra el texto TIRRA. */
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
      // si falta la foto en fondo blanco, se usa la de ambiente como principal
      if (img.dataset.respaldo) {
        var otra = img.parentElement.querySelector("img.b");
        img.src = img.dataset.respaldo;
        delete img.dataset.respaldo;
        if (otra) otra.remove();
        return;
      }
      var etiqueta = img.dataset.ph || img.alt || "Foto";
      img.src = placeholder(etiqueta.toUpperCase(), i);
    });
    // si ya falló antes de que enganchemos el listener
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event("error"));
  }
  document.querySelectorAll("img").forEach(cuidarImagen);

  /* ---------- links de contacto (salen de CONFIG en productos.js) ---------- */
  function linkWhatsapp(mensaje) {
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(mensaje);
  }
  document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
    a.href = linkWhatsapp("¡Hola TIRRA! Quería hacerles una consulta.");
  });
  document.querySelectorAll("[data-ig]").forEach(function (a) {
    a.href = "https://instagram.com/" + CONFIG.instagram;
  });
  document.querySelectorAll("[data-email]").forEach(function (a) {
    a.href = "mailto:" + CONFIG.email;
  });

  /* ---------- render de productos ---------- */
  var cont = document.getElementById("productos");
  var verMas = document.getElementById("verMas");
  var VISIBLES = 8;      // cuántos se ven antes de tocar "Ver más"
  var todosVisibles = false;

  function precio(n) {
    return n == null ? "Consultar precio" : "$ " + n.toLocaleString("es-UY");
  }

  function tarjeta(p, i) {
    var agotado = p.tag === "Agotado";
    var a = document.createElement("a");
    a.className = "producto reveal";
    a.dataset.cat = p.cat;
    a.href = linkWhatsapp(CONFIG.mensajeBase + p.nombre +
      (p.precio == null ? "" : " (" + precio(p.precio) + ")") + ". ¿Está disponible?");
    a.target = "_blank";
    a.rel = "noopener";

    a.innerHTML =
      '<div class="producto__media">' +
        (p.tag ? '<span class="producto__tag' + (agotado ? " producto__tag--agotado" : "") + '">' + p.tag + "</span>" : "") +
        '<img class="a" src="' + p.img + '" alt="' + p.nombre + '" data-ph="' + p.nombre + '"' +
          (p.img2 ? ' data-respaldo="' + p.img2 + '"' : "") + ' loading="lazy">' +
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
    var lista = PRODUCTOS.filter(function (p) { return filtro === "todos" || p.cat === filtro; });
    lista.forEach(function (p, i) {
      var t = tarjeta(p, i);
      if (!todosVisibles && i >= VISIBLES) t.classList.add("is-oculto");
      cont.appendChild(t);
    });
    if (verMas) verMas.style.display = (!todosVisibles && lista.length > VISIBLES) ? "" : "none";
    observarReveals();
  }

  if (verMas) {
    verMas.addEventListener("click", function () {
      todosVisibles = true;
      cont.querySelectorAll(".is-oculto").forEach(function (t) { t.classList.remove("is-oculto"); });
      verMas.style.display = "none";
      observarReveals();
    });
  }

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

  /* ---------- categorías -> filtran los productos ---------- */
  document.querySelectorAll("[data-ir]").forEach(function (c) {
    c.addEventListener("click", function () {
      var b = filtros && filtros.querySelector('[data-filtro="' + c.dataset.ir + '"]');
      if (b) b.click();
    });
  });

  /* ---------- menú hamburguesa (panel desde la derecha) ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menuMovil");
  var fondo = document.getElementById("menuFondo");
  function abrirMenu(abierto) {
    menu.classList.toggle("is-abierto", abierto);
    if (fondo) fondo.classList.toggle("is-abierto", abierto);
    burger.classList.toggle("is-abierto", abierto);
    document.body.classList.toggle("menu-abierto", abierto);
    burger.setAttribute("aria-expanded", String(abierto));
    burger.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      abrirMenu(!menu.classList.contains("is-abierto"));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") abrirMenu(false);
    });
    if (fondo) fondo.addEventListener("click", function () { abrirMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") abrirMenu(false);
    });
  }

  /* ---------- botón "volver arriba" ---------- */
  var arriba = document.getElementById("arriba");
  if (arriba) {
    arriba.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    window.addEventListener("scroll", function () {
      arriba.classList.toggle("is-visible", window.scrollY > 600);
    }, { passive: true });
  }

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
  [".titulo", ".espiritu p", ".linea-link", ".estilo", ".banner__contenido",
   ".duo__texto", ".duo__img", ".sello", ".calidad > p"].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { el.classList.add("reveal"); });
  });

  if (cont) pintar("todos");
  observarReveals();

  /* ---------- año del footer ---------- */
  var anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();
})();
