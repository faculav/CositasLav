/* =========================================================
   TIRRA — "Pieles" · comportamiento
   Datos (productos, WhatsApp, Instagram, email): productos.js
   Animaciones con GSAP si cargó; si no, todo queda visible.
   ========================================================= */
(function () {
  "use strict";

  var REDUCIR = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TACTIL = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var G = window.gsap, ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);

  /* ---------- contacto ---------- */
  function linkWhatsapp(m) { return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(m); }
  document.querySelectorAll("[data-whatsapp]").forEach(function (a) { a.href = linkWhatsapp("¡Hola TIRRA! Quería hacerles una consulta."); });
  document.querySelectorAll("[data-ig]").forEach(function (a) {
    a.href = "https://instagram.com/" + CONFIG.instagram;
    if (a.hasAttribute("data-ig-texto")) a.textContent = "@" + CONFIG.instagram;
  });
  document.querySelectorAll("[data-email]").forEach(function (a) {
    a.href = "mailto:" + CONFIG.email;
    if (a.hasAttribute("data-email-texto")) a.textContent = CONFIG.email;
  });
  var anio = document.getElementById("anio"); if (anio) anio.textContent = new Date().getFullYear();

  function precio(n) { return n == null ? "Consultar precio" : "$ " + n.toLocaleString("es-UY"); }
  var NOMBRE_CAT = { chalecos: "Chalecos", collares: "Collares", brazaletes: "Brazaletes", pulseras: "Pulseras" };

  /* ---------- video de portada: que arranque y no se trabe ---------- */
  var video = document.getElementById("heroVideo");
  if (video) {
    video.muted = true; video.defaultMuted = true;
    var mp4 = video.canPlayType('video/mp4; codecs="avc1.4D401F"');
    video.src = !mp4 ? "images/hero-720.webm?v=2" : (window.innerWidth < 900 ? video.dataset.chico : video.dataset.grande);
    var enPantalla = true, intentos = 0, trabado = null;
    var darPlay = function () { if (!enPantalla || document.hidden) return; var pr = video.play(); if (pr && pr.catch) pr.catch(function () {}); };
    video.addEventListener("error", function () { if (video.src.indexOf(".webm") < 0) { video.src = "images/hero-720.webm?v=2"; darPlay(); } });
    ["loadeddata", "canplay"].forEach(function (ev) { video.addEventListener(ev, darPlay); });
    video.addEventListener("pause", function () { setTimeout(darPlay, 300); });
    video.addEventListener("waiting", function () {
      clearTimeout(trabado);
      trabado = setTimeout(function () { if (video.readyState < 3 && intentos < 3) { intentos++; video.load(); darPlay(); } }, 4000);
    });
    video.addEventListener("playing", function () { clearTimeout(trabado); });
    document.addEventListener("visibilitychange", darPlay);
    ["touchstart", "click", "scroll"].forEach(function (ev) { window.addEventListener(ev, function () { if (video.paused) darPlay(); }, { passive: true }); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { enPantalla = e[0].isIntersecting; if (enPantalla) darPlay(); else video.pause(); }).observe(video);
    darPlay();
  }

  /* ---------- pieles: franjas que se abren ---------- */
  var franjas = Array.prototype.slice.call(document.querySelectorAll(".franja"));
  function abrirFranja(f) { franjas.forEach(function (x) { x.classList.toggle("is-abierta", x === f); }); }
  franjas.forEach(function (f) {
    if (!TACTIL) f.addEventListener("mouseenter", function () { abrirFranja(f); });
    // en celular el primer toque abre la franja; el segundo lleva a la colección
    f.addEventListener("click", function (e) {
      if (!f.classList.contains("is-abierta")) { e.preventDefault(); abrirFranja(f); }
    });
  });

  /* ---------- productos ---------- */
  function tarjeta(p) {
    var d = document.createElement("article");
    d.className = "producto";
    d.dataset.cat = p.cat;
    d.innerHTML =
      '<div class="producto__media">' +
        (p.tag ? '<span class="producto__tag">' + p.tag + "</span>" : "") +
        '<img class="a" src="' + p.img + '" alt="' + p.nombre + '" loading="lazy">' +
        (p.img2 ? '<img class="b" src="' + p.img2 + '" alt="" loading="lazy">' : "") +
      "</div>" +
      '<div class="producto__info"><span class="producto__nombre">' + p.nombre + '</span><span class="producto__precio">' + precio(p.precio) + "</span></div>" +
      '<span class="producto__mas">Ver pieza →</span>';
    var a = d.querySelector("img.a"), b = d.querySelector("img.b");
    a.addEventListener("error", function () { if (p.img2 && a.src.indexOf(p.img2) < 0) { a.src = p.img2; a.classList.remove("a"); if (b) b.remove(); } });
    d.addEventListener("click", function () { abrirFicha(p); });
    return d;
  }
  var cont = document.getElementById("productos");
  function pintar(filtro) {
    cont.innerHTML = "";
    var items = PRODUCTOS.filter(function (p) { return filtro === "todos" || p.cat === filtro; }).map(tarjeta);
    items.forEach(function (t) { cont.appendChild(t); });
    if (G && !REDUCIR) G.fromTo(items, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.06 });
    if (ST) ST.refresh();
  }
  var filtros = document.getElementById("filtros");
  filtros.addEventListener("click", function (e) {
    var b = e.target.closest(".filtro"); if (!b) return;
    filtros.querySelectorAll(".filtro").forEach(function (x) { x.classList.remove("is-activo"); });
    b.classList.add("is-activo"); pintar(b.dataset.filtro);
  });
  document.querySelectorAll("[data-ir]").forEach(function (c) {
    c.addEventListener("click", function () {
      if (c.classList.contains("franja") && !c.classList.contains("is-abierta")) return;
      var b = filtros.querySelector('[data-filtro="' + c.dataset.ir + '"]'); if (b) b.click();
    });
  });

  /* ---------- ficha de producto ---------- */
  var ficha = document.getElementById("ficha"), fichaImg = document.getElementById("fichaImg");
  var fichaMinis = document.getElementById("fichaMinis"), fichaCant = document.getElementById("fichaCant");
  var actual = null, fotos = [], fotoIdx = 0, cantidad = 1;
  function mostrarFoto(i) {
    fotoIdx = (i + fotos.length) % fotos.length; fichaImg.src = fotos[fotoIdx]; fichaImg.alt = actual.nombre;
    // la foto en fondo blanco se funde con el fondo; las de ambiente se ven completas
    fichaImg.style.mixBlendMode = fotos[fotoIdx] === actual.img ? "multiply" : "normal";
    fichaImg.style.objectFit = fotos[fotoIdx] === actual.img ? "contain" : "cover";
    fichaImg.style.padding = fotos[fotoIdx] === actual.img ? "" : "0";
    fichaMinis.querySelectorAll("button").forEach(function (b, k) { b.classList.toggle("is-activa", k === fotoIdx); });
  }
  function abrirFicha(p) {
    actual = p; cantidad = 1; fichaCant.textContent = "1";
    fotos = [p.img, p.img2].concat(p.fotos || []).filter(Boolean).filter(function (f, i, arr) { return arr.indexOf(f) === i; });
    document.getElementById("fichaNombre").textContent = p.nombre;
    document.getElementById("fichaCat").textContent = NOMBRE_CAT[p.cat] || "";
    document.getElementById("fichaPrecio").textContent = precio(p.precio);
    document.getElementById("fichaDesc").textContent = p.desc;
    document.getElementById("fichaConsulta").href = linkWhatsapp(CONFIG.mensajeBase + p.nombre + (p.precio == null ? "" : " (" + precio(p.precio) + ")") + ". ¿Está disponible?");
    fichaMinis.innerHTML = "";
    fotos.forEach(function (f, k) {
      var b = document.createElement("button"); b.innerHTML = '<img src="' + f + '" alt="">';
      b.setAttribute("aria-label", "Foto " + (k + 1)); b.addEventListener("click", function () { mostrarFoto(k); });
      fichaMinis.appendChild(b);
    });
    fichaMinis.hidden = fotos.length < 2;
    fichaImg.onerror = function () { if (fotos.length > 1) { fotos.splice(fotoIdx, 1); if (fichaMinis.children[fotoIdx]) fichaMinis.children[fotoIdx].remove(); mostrarFoto(0); } };
    mostrarFoto(0);
    ficha.hidden = false; requestAnimationFrame(function () { ficha.classList.add("is-abierta"); });
    document.body.classList.add("con-modal");
  }
  function cerrarFicha() { ficha.classList.remove("is-abierta"); document.body.classList.remove("con-modal"); setTimeout(function () { ficha.hidden = true; }, 700); }
  ficha.addEventListener("click", function (e) { if (e.target.closest("[data-cerrar]")) cerrarFicha(); });
  document.getElementById("fichaMenos").addEventListener("click", function () { cantidad = Math.max(1, cantidad - 1); fichaCant.textContent = cantidad; });
  document.getElementById("fichaMas").addEventListener("click", function () { cantidad = Math.min(20, cantidad + 1); fichaCant.textContent = cantidad; });
  document.getElementById("fichaAgregar").addEventListener("click", function () { agregar(actual.id, cantidad); cerrarFicha(); avisar(actual.nombre + " — agregado"); });
  document.getElementById("fichaFoto").addEventListener("click", function () { abrirVisor(); });

  /* ---------- visor ---------- */
  var visor = document.getElementById("visor"), visorImg = document.getElementById("visorImg");
  function abrirVisor() { visorImg.src = fotos[fotoIdx]; visor.hidden = false; requestAnimationFrame(function () { visor.classList.add("is-abierto"); }); }
  function moverVisor(d) { mostrarFoto(fotoIdx + d); visorImg.src = fotos[fotoIdx]; }
  function cerrarVisor() { visor.classList.remove("is-abierto"); setTimeout(function () { visor.hidden = true; }, 350); }
  document.getElementById("visorCerrar").addEventListener("click", cerrarVisor);
  document.getElementById("visorPrev").addEventListener("click", function () { moverVisor(-1); });
  document.getElementById("visorNext").addEventListener("click", function () { moverVisor(1); });
  visor.addEventListener("click", function (e) { if (e.target === visor) cerrarVisor(); });
  var vx = null;
  visor.addEventListener("touchstart", function (e) { vx = e.touches[0].clientX; }, { passive: true });
  visor.addEventListener("touchend", function (e) { if (vx == null) return; var dx = e.changedTouches[0].clientX - vx; vx = null; if (Math.abs(dx) > 40) moverVisor(dx < 0 ? 1 : -1); });

  /* ---------- carrito (misma clave que las otras versiones) ---------- */
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
  function cambiar(id, d) { carrito = carrito.map(function (x) { if (x.id === id) x.cant += d; return x; }).filter(function (x) { return x.cant > 0; }); guardar(); pintarCarrito(); }
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
        '<button class="carrito__quitar">Quitar</button>';
      fila.querySelector("img").addEventListener("error", function () { if (p.img2) this.src = p.img2; });
      fila.querySelectorAll("[data-d]").forEach(function (b) { b.addEventListener("click", function () { cambiar(it.id, +b.dataset.d); }); });
      fila.querySelector(".carrito__quitar").addEventListener("click", function () { cambiar(it.id, -it.cant); });
      lista.appendChild(fila);
    });
    document.getElementById("carritoNum").textContent = "(" + unidades + ")";
    document.getElementById("carritoTotal").textContent = "$ " + total.toLocaleString("es-UY") + (sinPrecio ? " + a consultar" : "");
    document.getElementById("carritoNota").textContent = sinPrecio ? "Algunas piezas no tienen precio cargado: te lo confirmamos por WhatsApp." : "";
    var fin = document.getElementById("carritoFinalizar");
    fin.classList.toggle("is-deshabilitado", !carrito.length);
    fin.href = linkWhatsapp("¡Hola TIRRA! Quiero hacer este pedido:\n" + lineas.join("\n") + "\nTotal: $ " + total.toLocaleString("es-UY") + (sinPrecio ? " + piezas a consultar" : "") + "\n¿Está disponible?");
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

  /* ---------- el perchero ---------- */
  var PERCHA = [
    { id: "col-tierra", img: "images/perch-col-tierra.webp" },
    { id: "col-ocre",   img: "images/perch-col-ocre.webp" },
    { id: "pec-cria",   img: "images/perch-pec-cria.webp", espalda: "images/perch-pec-cria-b.webp" },
    { id: "cha-cruz",   img: "images/perch-cha-cruz.webp", espalda: "images/perch-cha-cruz-b.webp" },
    { id: "col-pampa",  img: "images/perch-col-pampa.webp" },
    { id: "col-greda",  img: "images/perch-col-greda.webp" }
  ].filter(function (x) { return producto(x.id); });
  var escena = document.getElementById("perchEscena"), fila = document.getElementById("perchFila");
  var GANCHO = '<svg class="percha__gancho" viewBox="0 0 100 46" aria-hidden="true"><path d="M50 22 V13 a7 7 0 1 1 7 -7" fill="none" stroke="#2a1d14" stroke-width="3" stroke-linecap="round"/><path d="M4 44 L50 21 L96 44 Z" fill="none" stroke="#6b4a32" stroke-width="4.5" stroke-linejoin="round"/></svg>';
  var elegida = -1, lado = "frente", soltarPercha = function () {};
  if (escena) {
    PERCHA.forEach(function (x, k) {
      var p = producto(x.id), b = document.createElement("button");
      b.type = "button"; b.className = "percha" + (p.cat === "chalecos" ? " percha--chaleco" : "");
      b.setAttribute("aria-label", p.nombre);
      b.innerHTML = '<div class="percha__mece">' + (p.cat === "chalecos" ? GANCHO : "") + '<img class="percha__img" src="' + x.img + '" alt="' + p.nombre + '"></div>';
      b.addEventListener("click", function (e) { e.stopPropagation(); if (elegida === k) return; enfocar(k); });
      fila.appendChild(b);
      if (x.espalda) { var pre = new Image(); pre.src = x.espalda; }
    });
    var perchas = Array.prototype.slice.call(fila.children);

    function enfocar(k) {
      elegida = (k + perchas.length) % perchas.length; lado = "frente";
      var x = PERCHA[elegida], p = producto(x.id);
      perchas.forEach(function (b, i) { b.style.transform = ""; b.classList.remove("is-elegida"); b.querySelector(".percha__img").src = PERCHA[i].img; });
      var b = perchas[elegida];
      if (!escena.classList.contains("is-foco")) {
        // la escena se estira: medimos la altura final y la animamos
        var h0 = escena.offsetHeight;
        escena.style.transition = "none"; escena.classList.add("is-foco");
        var h1 = escena.offsetHeight; escena.style.height = h0 + "px"; void escena.offsetHeight;
        escena.style.transition = ""; escena.style.height = h1 + "px";
        setTimeout(function () { escena.style.height = ""; }, 1100);
      }
      // medir sin transformación y llevar la pieza al centro, más grande
      var re = escena.getBoundingClientRect(), rb = b.getBoundingClientRect();
      var altoEscena = parseFloat(escena.style.height) || re.height;
      var panel = parseFloat(getComputedStyle(escena).getPropertyValue("--panel")) || 178;
      var alto = altoEscena - (rb.top - re.top) - panel - 28;
      var s = Math.min(alto / rb.height, (re.width * 0.62) / rb.width, 3.2);
      var dx = (re.left + re.width / 2) - (rb.left + rb.width / 2);
      void b.offsetWidth;
      b.style.transform = "translateX(" + dx + "px) scale(" + s + ")";
      b.classList.add("is-elegida");
      document.getElementById("perchNombre").textContent = p.nombre;
      document.getElementById("perchPrecio").textContent = precio(p.precio);
      var ld = document.getElementById("perchLado"); ld.hidden = !x.espalda;
      ld.querySelectorAll("button").forEach(function (c) { c.classList.toggle("is-activo", c.dataset.lado === "frente"); });
    }
    function soltar() {
      elegida = -1; escena.classList.remove("is-foco");
      perchas.forEach(function (b, i) { b.style.transform = ""; b.classList.remove("is-elegida"); b.querySelector(".percha__img").src = PERCHA[i].img; });
    }
    function girar(nuevo) {
      if (elegida < 0 || nuevo === lado) return;
      var x = PERCHA[elegida]; if (!x.espalda) return;
      lado = nuevo;
      var img = perchas[elegida].querySelector(".percha__img"), m = perchas[elegida].querySelector(".percha__mece");
      document.querySelectorAll("#perchLado button").forEach(function (c) { c.classList.toggle("is-activo", c.dataset.lado === lado); });
      img.classList.add("is-girando");
      setTimeout(function () {
        img.src = lado === "espalda" ? x.espalda : x.img; img.classList.remove("is-girando");
        m.style.animation = "none"; void m.offsetWidth; m.style.animation = "";
      }, 280);
    }
    document.getElementById("perchLado").addEventListener("click", function (e) { var c = e.target.closest("button"); if (c) girar(c.dataset.lado); });
    document.getElementById("perchPrev").addEventListener("click", function (e) { e.stopPropagation(); enfocar(elegida - 1); });
    document.getElementById("perchNext").addEventListener("click", function (e) { e.stopPropagation(); enfocar(elegida + 1); });
    document.getElementById("perchVolver").addEventListener("click", function (e) { e.stopPropagation(); soltar(); });
    document.getElementById("perchAgregar").addEventListener("click", function (e) { e.stopPropagation(); var p = producto(PERCHA[elegida].id); agregar(p.id, 1); avisar(p.nombre + " — agregado"); });
    document.getElementById("perchVer").addEventListener("click", function (e) { e.stopPropagation(); abrirFicha(producto(PERCHA[elegida].id)); });
    document.getElementById("perchPanel").addEventListener("click", function (e) { e.stopPropagation(); });
    escena.addEventListener("click", function () { if (elegida >= 0) soltar(); });
    soltarPercha = soltar;
    var px = null;
    escena.addEventListener("touchstart", function (e) { px = e.touches[0].clientX; }, { passive: true });
    escena.addEventListener("touchend", function (e) { if (px == null || elegida < 0) return; var dx = e.changedTouches[0].clientX - px; px = null; if (Math.abs(dx) > 50) enfocar(elegida + (dx < 0 ? 1 : -1)); });
    var anchoPrev = window.innerWidth;
    window.addEventListener("resize", function () { if (window.innerWidth !== anchoPrev) { anchoPrev = window.innerWidth; if (elegida >= 0) enfocar(elegida); } });
  }

  /* ---------- menú ---------- */
  var burger = document.getElementById("burger"), menu = document.getElementById("menuMovil");
  function abrirMenu(si) {
    menu.classList.toggle("is-abierto", si); document.body.classList.toggle("menu-abierto", si);
    burger.textContent = si ? "Cerrar" : "Menú"; burger.setAttribute("aria-expanded", String(si));
  }
  burger.addEventListener("click", function () { abrirMenu(!menu.classList.contains("is-abierto")); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) abrirMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (!visor.hidden) cerrarVisor(); else if (!ficha.hidden) cerrarFicha(); else if (carritoEl.classList.contains("is-abierto")) abrirCarrito(false); else if (escena && elegida >= 0) soltarPercha(); else abrirMenu(false); }
    if (escena && elegida >= 0 && ficha.hidden && !carritoEl.classList.contains("is-abierto")) {
      if (e.key === "ArrowRight") document.getElementById("perchNext").click();
      if (e.key === "ArrowLeft") document.getElementById("perchPrev").click();
    }
    if (!visor.hidden && e.key === "ArrowRight") moverVisor(1);
    if (!visor.hidden && e.key === "ArrowLeft") moverVisor(-1);
  });

  /* ---------- header: fondo al bajar y versión clara sobre el taller ---------- */
  var header = document.getElementById("header"), taller = document.getElementById("taller");
  function revisarHeader() {
    header.classList.toggle("is-scroll", window.scrollY > window.innerHeight * 0.6);
    if (taller) {
      var r = taller.getBoundingClientRect();
      header.classList.toggle("is-claro", r.top < 60 && r.bottom > 60);
    }
  }
  window.addEventListener("scroll", revisarHeader, { passive: true }); revisarHeader();

  pintar("todos");

  /* ---------- animaciones (GSAP) ---------- */
  if (!G || !ST || REDUCIR) return;

  // portada: el título sube despacio al cargar
  G.from(".hero__titulo > *", { yPercent: 100, opacity: 0, duration: 1.8, ease: "expo.out", stagger: 0.12, delay: 0.2 });
  G.from(".hero__pie", { opacity: 0, duration: 1.4, delay: 0.9 });
  G.from(".header", { opacity: 0, duration: 1.4, delay: 0.6 });
  G.to(".hero__txt", { opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // títulos y textos: aparecen suave
  document.querySelectorAll(".titulo, .intro__txt, .eti, .frase__pie, .taller__txt > p, .taller__lista li, .contacto__pie").forEach(function (el) {
    G.from(el, { y: 40, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  // perchero: las piezas bajan a la barra una tras otra
  G.from(".percha", { y: -40, opacity: 0, duration: 1.4, ease: "expo.out", stagger: 0.09, clearProps: "transform,opacity", scrollTrigger: { trigger: ".perchero__escena", start: "top 75%" } });

  // franjas: entran una tras otra
  G.from(".franja", { opacity: 0, duration: 1.4, ease: "power2.out", stagger: 0.1, scrollTrigger: { trigger: ".franjas", start: "top 80%" } });

  // frase: la textura de cuero se desplaza con el scroll
  G.fromTo("#frase", { backgroundPosition: "50% 0%" }, { backgroundPosition: "50% 100%", ease: "none", scrollTrigger: { trigger: ".frase", start: "top bottom", end: "bottom top", scrub: true } });
  G.from("#frase", { opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".frase", start: "top 75%" } });

  // galería: las fotos aparecen suave, una tras otra
  G.from(".g", { opacity: 0, y: 30, duration: 1.4, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".galeria", start: "top 80%" } });

  // contacto
  G.from(".contacto__link", { yPercent: 40, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".contacto", start: "top 80%" } });
})();
