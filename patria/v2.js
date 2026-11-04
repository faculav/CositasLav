/* =========================================================
   TIRRA v2 — comportamiento
   Usa los mismos datos que la versión 1 (productos.js):
   productos, WhatsApp, Instagram y email salen de ahí.
   ========================================================= */
(function () {
  "use strict";

  var REDUCIR = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- links de contacto ---------- */
  function linkWhatsapp(mensaje) {
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(mensaje);
  }
  document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
    a.href = linkWhatsapp("¡Hola TIRRA! Quería hacerles una consulta.");
  });
  document.querySelectorAll("[data-ig]").forEach(function (a) {
    a.href = "https://instagram.com/" + CONFIG.instagram;
    if (a.hasAttribute("data-ig-texto")) a.textContent = "@" + CONFIG.instagram;
  });
  document.querySelectorAll("[data-email]").forEach(function (a) {
    a.href = "mailto:" + CONFIG.email;
    if (a.hasAttribute("data-email-texto")) a.textContent = CONFIG.email;
  });
  var anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();

  function precio(n) { return n == null ? "Consultar precio" : "$ " + n.toLocaleString("es-UY"); }
  var NOMBRE_CAT = { chalecos: "Chalecos", collares: "Collares", brazaletes: "Brazaletes", pulseras: "Pulseras" };

  /* ---------- portada: fotos que pasan solas ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var puntos = document.getElementById("slidePuntos");
  var actualSlide = 0, timer = null;
  function irA(i) {
    actualSlide = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle("is-activa", k === actualSlide); });
    puntos.querySelectorAll("button").forEach(function (b, k) { b.classList.toggle("is-activo", k === actualSlide); });
    clearInterval(timer);
    if (!REDUCIR) timer = setInterval(function () { irA(actualSlide + 1); }, 6000);
  }
  if (slides.length) {
    slides.forEach(function (s, k) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Foto " + (k + 1));
      b.addEventListener("click", function () { irA(k); });
      puntos.appendChild(b);
    });
    document.getElementById("slidePrev").addEventListener("click", function () { irA(actualSlide - 1); });
    document.getElementById("slideNext").addEventListener("click", function () { irA(actualSlide + 1); });
    var tx = null, slider = document.getElementById("slider");
    slider.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", function (e) {
      if (tx == null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 40) irA(actualSlide + (dx < 0 ? 1 : -1));
    });
    irA(0);
  }

  /* ---------- tarjetas de producto ---------- */
  function tarjeta(p) {
    var d = document.createElement("article");
    d.className = "producto aparece";
    d.dataset.cat = p.cat;
    d.innerHTML =
      '<div class="producto__media">' +
        (p.tag ? '<span class="producto__tag">' + p.tag + "</span>" : "") +
        '<img class="a" src="' + p.img + '" alt="' + p.nombre + '" loading="lazy">' +
        (p.img2 ? '<img class="b" src="' + p.img2 + '" alt="" loading="lazy">' : "") +
        '<button class="producto__agregar" type="button">Agregar al carrito</button>' +
      "</div>" +
      "<h3>" + p.nombre + "</h3>" +
      '<p class="producto__precio">' + precio(p.precio) + "</p>" +
      '<p class="producto__nota">' + (p.precio == null ? "Te lo confirmamos por WhatsApp" : "Pedido por WhatsApp") + "</p>";
    var a = d.querySelector("img.a"), b = d.querySelector("img.b");
    a.addEventListener("error", function () {          // sin foto en fondo blanco: usa la de ambiente
      if (p.img2 && a.src.indexOf(p.img2) < 0) { a.src = p.img2; a.classList.remove("a"); if (b) b.remove(); }
    });
    d.querySelector(".producto__agregar").addEventListener("click", function (e) {
      e.stopPropagation(); agregar(p.id, 1); avisar(p.nombre + " se agregó al carrito");
    });
    d.addEventListener("click", function () { abrirFicha(p); });
    return d;
  }

  var destacados = document.getElementById("destacadosGrilla");
  if (destacados) {
    PRODUCTOS.filter(function (p) { return p.tag === "Nuevo"; }).concat(PRODUCTOS.filter(function (p) { return p.tag !== "Nuevo"; }))
      .slice(0, 4).forEach(function (p) { destacados.appendChild(tarjeta(p)); });
  }
  var cont = document.getElementById("productos");
  function pintar(filtro) {
    cont.innerHTML = "";
    PRODUCTOS.filter(function (p) { return filtro === "todos" || p.cat === filtro; })
      .forEach(function (p) { cont.appendChild(tarjeta(p)); });
    observar();
  }
  var filtros = document.getElementById("filtros");
  filtros.addEventListener("click", function (e) {
    var b = e.target.closest(".filtro"); if (!b) return;
    filtros.querySelectorAll(".filtro").forEach(function (x) { x.classList.remove("is-activo"); });
    b.classList.add("is-activo"); pintar(b.dataset.filtro);
  });
  document.querySelectorAll("[data-ir]").forEach(function (c) {
    c.addEventListener("click", function () {
      var b = filtros.querySelector('[data-filtro="' + c.dataset.ir + '"]'); if (b) b.click();
    });
  });

  /* ---------- ficha de producto ---------- */
  var ficha = document.getElementById("ficha"), fichaImg = document.getElementById("fichaImg");
  var fichaMinis = document.getElementById("fichaMinis"), fichaCant = document.getElementById("fichaCant");
  var actual = null, fotos = [], fotoIdx = 0, cantidad = 1;
  function mostrarFoto(i) {
    fotoIdx = (i + fotos.length) % fotos.length; fichaImg.src = fotos[fotoIdx]; fichaImg.alt = actual.nombre;
    fichaMinis.querySelectorAll("button").forEach(function (b, k) { b.classList.toggle("is-activa", k === fotoIdx); });
  }
  function abrirFicha(p) {
    actual = p; cantidad = 1; fichaCant.textContent = "1";
    fotos = [p.img, p.img2].concat(p.fotos || []).filter(Boolean).filter(function (f, i, arr) { return arr.indexOf(f) === i; });
    document.getElementById("fichaNombre").textContent = p.nombre;
    document.getElementById("fichaCat").textContent = NOMBRE_CAT[p.cat] || "";
    document.getElementById("fichaPrecio").textContent = precio(p.precio);
    document.getElementById("fichaDesc").textContent = p.desc;
    document.getElementById("fichaConsulta").href = linkWhatsapp(CONFIG.mensajeBase + p.nombre +
      (p.precio == null ? "" : " (" + precio(p.precio) + ")") + ". ¿Está disponible?");
    fichaMinis.innerHTML = "";
    fotos.forEach(function (f, k) {
      var b = document.createElement("button"); b.innerHTML = '<img src="' + f + '" alt="">';
      b.setAttribute("aria-label", "Foto " + (k + 1)); b.addEventListener("click", function () { mostrarFoto(k); });
      fichaMinis.appendChild(b);
    });
    fichaMinis.hidden = fotos.length < 2;
    fichaImg.onerror = function () {
      if (fotos.length > 1) { fotos.splice(fotoIdx, 1); if (fichaMinis.children[fotoIdx]) fichaMinis.children[fotoIdx].remove(); mostrarFoto(0); }
    };
    mostrarFoto(0);
    ficha.hidden = false; requestAnimationFrame(function () { ficha.classList.add("is-abierta"); });
    document.body.classList.add("con-modal");
  }
  function cerrarFicha() {
    ficha.classList.remove("is-abierta"); document.body.classList.remove("con-modal");
    setTimeout(function () { ficha.hidden = true; }, 400);
  }
  ficha.addEventListener("click", function (e) { if (e.target.closest("[data-cerrar]")) cerrarFicha(); });
  document.getElementById("fichaMenos").addEventListener("click", function () { cantidad = Math.max(1, cantidad - 1); fichaCant.textContent = cantidad; });
  document.getElementById("fichaMas").addEventListener("click", function () { cantidad = Math.min(20, cantidad + 1); fichaCant.textContent = cantidad; });
  document.getElementById("fichaAgregar").addEventListener("click", function () {
    agregar(actual.id, cantidad); cerrarFicha(); avisar(actual.nombre + " se agregó al carrito");
  });
  document.getElementById("fichaFoto").addEventListener("click", function () { abrirVisor(); });

  /* ---------- visor de fotos ---------- */
  var visor = document.getElementById("visor"), visorImg = document.getElementById("visorImg");
  function abrirVisor() { visorImg.src = fotos[fotoIdx]; visor.hidden = false; requestAnimationFrame(function () { visor.classList.add("is-abierto"); }); }
  function moverVisor(d) { mostrarFoto(fotoIdx + d); visorImg.src = fotos[fotoIdx]; }
  function cerrarVisor() { visor.classList.remove("is-abierto"); setTimeout(function () { visor.hidden = true; }, 300); }
  document.getElementById("visorCerrar").addEventListener("click", cerrarVisor);
  document.getElementById("visorPrev").addEventListener("click", function () { moverVisor(-1); });
  document.getElementById("visorNext").addEventListener("click", function () { moverVisor(1); });
  visor.addEventListener("click", function (e) { if (e.target === visor) cerrarVisor(); });
  var vx = null;
  visor.addEventListener("touchstart", function (e) { vx = e.touches[0].clientX; }, { passive: true });
  visor.addEventListener("touchend", function (e) {
    if (vx == null) return; var dx = e.changedTouches[0].clientX - vx; vx = null;
    if (Math.abs(dx) > 40) moverVisor(dx < 0 ? 1 : -1);
  });

  /* ---------- carrito (compartido con la versión 1: misma clave) ---------- */
  var CLAVE = "tirra-carrito", carrito = [];
  try { carrito = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { carrito = []; }
  carrito = carrito.filter(function (it) { return PRODUCTOS.some(function (p) { return p.id === it.id; }); });
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch (e) {} }
  function producto(id) { return PRODUCTOS.filter(function (p) { return p.id === id; })[0]; }
  function agregar(id, n) {
    var it = carrito.filter(function (x) { return x.id === id; })[0];
    if (it) it.cant = Math.min(20, it.cant + n); else carrito.push({ id: id, cant: n });
    guardar(); pintarCarrito();
  }
  function cambiar(id, d) {
    carrito = carrito.map(function (x) { if (x.id === id) x.cant += d; return x; }).filter(function (x) { return x.cant > 0; });
    guardar(); pintarCarrito();
  }
  function pintarCarrito() {
    var lista = document.getElementById("carritoLista"), unidades = 0, total = 0, sinPrecio = 0, lineas = [];
    lista.innerHTML = carrito.length ? "" : '<p class="carrito__vacio">Tu carrito está vacío.</p>';
    carrito.forEach(function (it) {
      var p = producto(it.id); if (!p) return;
      unidades += it.cant;
      if (p.precio == null) sinPrecio++; else total += p.precio * it.cant;
      lineas.push("• " + it.cant + " x " + p.nombre + (p.precio == null ? " (precio a consultar)" : " (" + precio(p.precio * it.cant) + ")"));
      var fila = document.createElement("div"); fila.className = "carrito__item";
      fila.innerHTML = '<img src="' + p.img + '" alt="">' +
        '<div class="carrito__datos"><strong>' + p.nombre + "</strong><span>" + precio(p.precio) + "</span>" +
        '<div class="carrito__cant"><button data-d="-1" aria-label="Menos">−</button><span>' + it.cant + '</span><button data-d="1" aria-label="Más">+</button></div></div>' +
        '<button class="carrito__quitar" aria-label="Quitar">✕</button>';
      fila.querySelector("img").addEventListener("error", function () { if (p.img2) this.src = p.img2; });
      fila.querySelectorAll("[data-d]").forEach(function (b) { b.addEventListener("click", function () { cambiar(it.id, +b.dataset.d); }); });
      fila.querySelector(".carrito__quitar").addEventListener("click", function () { cambiar(it.id, -it.cant); });
      lista.appendChild(fila);
    });
    document.getElementById("carritoNum").textContent = unidades;
    document.getElementById("carritoTotal").textContent = "$ " + total.toLocaleString("es-UY") + (sinPrecio ? " + a consultar" : "");
    document.getElementById("carritoNota").textContent = sinPrecio ? "Algunas piezas no tienen precio cargado: te lo confirmamos por WhatsApp." : "";
    var fin = document.getElementById("carritoFinalizar");
    fin.classList.toggle("is-deshabilitado", !carrito.length);
    fin.href = linkWhatsapp("¡Hola TIRRA! Quiero hacer este pedido:\n" + lineas.join("\n") +
      "\nTotal: $ " + total.toLocaleString("es-UY") + (sinPrecio ? " + piezas a consultar" : "") + "\n¿Está disponible?");
  }
  var carritoEl = document.getElementById("carrito"), carritoFondo = document.getElementById("carritoFondo");
  var aviso = document.getElementById("aviso"), avisoT = null;
  function abrirCarrito(si) {
    carritoEl.classList.toggle("is-abierto", si); carritoFondo.classList.toggle("is-abierto", si);
    document.body.classList.toggle("con-modal", si); if (si) aviso.classList.remove("is-visible");
  }
  document.getElementById("carritoBtn").addEventListener("click", function () { abrirCarrito(true); });
  document.getElementById("carritoCerrar").addEventListener("click", function () { abrirCarrito(false); });
  carritoFondo.addEventListener("click", function () { abrirCarrito(false); });
  document.getElementById("carritoVaciar").addEventListener("click", function () { carrito = []; guardar(); pintarCarrito(); });
  document.getElementById("carritoFinalizar").addEventListener("click", function (e) { if (!carrito.length) e.preventDefault(); });
  function avisar(txt) {
    aviso.innerHTML = "<span>" + txt + '</span><button type="button">Ver carrito</button>';
    aviso.querySelector("button").onclick = function () { abrirCarrito(true); };
    aviso.classList.add("is-visible");
    clearTimeout(avisoT); avisoT = setTimeout(function () { aviso.classList.remove("is-visible"); }, 3500);
  }
  pintarCarrito();

  /* ---------- menú celular ---------- */
  var burger = document.getElementById("burger"), menu = document.getElementById("menuMovil");
  function abrirMenu(si) {
    menu.classList.toggle("is-abierto", si); burger.classList.toggle("is-abierto", si);
    burger.setAttribute("aria-expanded", String(si)); document.body.classList.toggle("con-modal", si);
  }
  burger.addEventListener("click", function () { abrirMenu(!menu.classList.contains("is-abierto")); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) abrirMenu(false); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!visor.hidden) cerrarVisor(); else if (!ficha.hidden) cerrarFicha();
      else if (carritoEl.classList.contains("is-abierto")) abrirCarrito(false); else abrirMenu(false);
    }
    if (!visor.hidden && e.key === "ArrowRight") moverVisor(1);
    if (!visor.hidden && e.key === "ArrowLeft") moverVisor(-1);
  });

  /* ---------- header con sombra al bajar ---------- */
  var header = document.getElementById("header");
  window.addEventListener("scroll", function () { header.classList.toggle("is-scroll", window.scrollY > 40); }, { passive: true });

  /* ---------- aparición suave al bajar ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (ents) {
    ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
  }, { threshold: 0.1 }) : null;
  function observar() {
    document.querySelectorAll(".aparece:not(.is-visible)").forEach(function (el) { if (io && !REDUCIR) io.observe(el); else el.classList.add("is-visible"); });
  }
  document.querySelectorAll(".bloque__titulo, .camel h2, .camel p, .look, .beneficio, .cuidados > *").forEach(function (el) { el.classList.add("aparece"); });
  pintar("todos");
})();
