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
        (p.img2 ? '<img class="b' + (/\.webp/.test(p.img2) ? " plano" : "") + '" src="' + p.img2 + '" alt="" loading="lazy">' : "") +
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

  /* ---------- el perchero: riel con física (resortes, balanceo, giro) ----------
     Las piezas descansan de perfil (girada -70°). Al pasar el mouse una gira
     de frente y empuja a las vecinas; cada percha se balancea según cómo se
     mueve. Clic (o segundo toque) la descuelga y se puede girar arrastrando. */
  var PIEZAS = [
    // fotos con la percha, todas en el mismo lienzo (gancho centrado arriba)
    { id: "pec-cria",  img: "images/perch-pec-cria.webp?v=8",  espalda: "images/perch-pec-cria-b.webp?v=8" },
    { id: "cha-cruz",  img: "images/perch-cha-cruz.webp?v=8",  espalda: "images/perch-cha-cruz-b.webp?v=8" },
    { id: "cha-latte", img: "images/perch-cha-latte.webp?v=8", espalda: "images/perch-cha-latte-b.webp?v=8" }
  ].filter(function (x) { return producto(x.id); });
  var riel = document.getElementById("riel");
  var perchero = { abierto: false, cerrar: function () {}, girar: function () {} };
  if (riel && PIEZAS.length) (function () {
    var ASPECT = 200 / 310, ZOOM = 1.1, GAP = 0.06, MAX_H = 470, MIN_ANCHO = 200, CARRUSEL_H = 360;
    var n = PIEZAS.length, FAC_MEDIO = PIEZAS.reduce(function (a, x) { return a + (producto(x.id).cat === "collares" ? 0.74 : 0.92); }, 0) / PIEZAS.length, barra = riel.querySelector(".riel__barra");
    var nombreEl = document.getElementById("rielNombre"), infoEl = document.getElementById("rielInfo"), puntos = document.getElementById("rielPuntos");
    var tam = { ancho: 0, h: 300, carrusel: false }, activa = null, idxCarrusel = 0, abierta = null, oculta = null;
    var S = { x: [], vx: [], tx: [], esc: [], vesc: [], tesc: [], mece: [], vmece: [], arrastre: -1, agarre: 0, libre: 0, ult: 0, raf: 0 };
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    // lugar que ocupa una pieza en la barra (crece con el zoom)
    // los chalecos ocupan toda su caja; los collares, menos
    function huella(h, esc, i) { var f = i == null ? FAC_MEDIO : (PIEZAS[i]._collar ? 0.74 : 0.92); return h * ASPECT * f * (esc || 1); }

    var slots = PIEZAS.map(function (x, i) {
      var p = producto(x.id), b = document.createElement("button");
      x._collar = p.cat === "collares";
      b.type = "button"; b.className = "pieza" + (p.cat === "collares" ? " pieza--collar" : "");
      b.setAttribute("aria-label", p.nombre); b.tabIndex = i === 0 ? 0 : -1; b.dataset.i = i;
      b.innerHTML = '<span class="pieza__mece"><span class="pieza__giro"><img class="pieza__img" src="' + x.img + '" alt="" draggable="false"></span></span>';
      riel.appendChild(b);
      if (x.espalda) { var pre = new Image(); pre.src = x.espalda; }
      var orig = ((x._collar ? 0.5 : (x.hookX || 0.5)) * 100).toFixed(1) + "% 0";
      b.firstChild.style.transformOrigin = orig; b.firstChild.firstChild.style.transformOrigin = orig;
      var tapa = document.createElement("span"); tapa.className = "pieza__tapa"; tapa.setAttribute("aria-hidden", "true"); b.appendChild(tapa);
      return { el: b, mece: b.firstChild, giro: b.firstChild.firstChild, img: b.querySelector("img"), tapa: tapa };
    });
    if (puntos) PIEZAS.forEach(function (x, i) {
      var d = document.createElement("button"); d.type = "button"; d.setAttribute("aria-label", "Ver " + producto(x.id).nombre);
      d.addEventListener("click", function () { elegir(i); }); puntos.appendChild(d);
    });

    function medir() {
      var w = riel.clientWidth;
      var k0 = huella(1, 1) + GAP, k1 = huella(1, ZOOM) + GAP;
      var cabe = (w - 24) / (n * k0 + (k1 - k0));
      var carrusel = cabe < MIN_ANCHO;
      var h = Math.round(carrusel ? Math.min(CARRUSEL_H, Math.max(240, w * 0.9)) : Math.min(MAX_H, cabe));
      tam = { ancho: w, h: h, carrusel: carrusel };
      var y = Math.round(h * 0.06) + 14, bw = h * ASPECT;
      tam.y = y;
      barra.style.top = (y - 3) + "px";
      barra.style.left = carrusel ? "-20px" : ""; barra.style.right = carrusel ? "-20px" : "";
      riel.style.height = Math.round(y + h + h * 0.2) + "px";
      // la barra apoya en la parte interna de la curva del gancho (y = 18 px de 820 en las fotos)
      var apoyo = bw * 18 / 820;
      slots.forEach(function (s) {
        s.el.style.width = bw + "px"; s.el.style.height = h + "px"; s.el.style.top = (y - 3 - apoyo) + "px";
        // un pedacito de barra por delante de la punta del gancho: así la punta queda por detrás
        s.tapa.style.top = apoyo + "px"; s.tapa.style.left = (bw * 0.528) + "px"; s.tapa.style.width = (bw * 0.072) + "px";
      });
      if (puntos) puntos.hidden = !carrusel;
      objetivos(); 
    }
    function objetivos() {
      var h = tam.h, frente = tam.carrusel ? (activa == null ? idxCarrusel : activa) : activa;
      var pies = PIEZAS.map(function (_, i) { return huella(h, i === frente ? ZOOM : 1, i) + h * GAP; }), xs = [];
      if (tam.carrusel) {
        var c = frente || 0; xs[c] = tam.ancho / 2;
        for (var i = c + 1; i < n; i++) xs[i] = xs[i - 1] + (pies[i - 1] + pies[i]) / 2;
        for (i = c - 1; i >= 0; i--) xs[i] = xs[i + 1] - (pies[i + 1] + pies[i]) / 2;
      } else {
        var tot = pies.reduce(function (a, b) { return a + b; }, 0), cur = (tam.ancho - tot) / 2;
        pies.forEach(function (f, i) { xs[i] = cur + f / 2; cur += f; });
      }
      var nuevo = S.x.length !== n;
      for (var j = 0; j < n; j++) {
        S.tx[j] = xs[j] + (tam.carrusel ? desliz : 0); S.tesc[j] = j === frente ? ZOOM : 1;
        if (nuevo || REDUCIR) { S.x[j] = S.tx[j]; S.vx[j] = 0; S.esc[j] = S.tesc[j]; S.vesc[j] = 0; S.mece[j] = S.mece[j] || 0; S.vmece[j] = S.vmece[j] || 0; }
      }
      if (puntos) Array.prototype.forEach.call(puntos.children, function (d, k) { d.classList.toggle("is-activo", k === frente); });
      for (j = 0; j < n; j++) pintar(j);
      andar();
    }
    function pintar(i) {
      var h = tam.h, w = h * ASPECT, s = slots[i], esc = S.esc[i] || 1;
      s.el.style.transform = "translate3d(" + ((S.x[i] || 0) - w / 2).toFixed(2) + "px,0,0)";
      s.el.style.zIndex = i === activa ? 30 : 10 + i;
      s.mece.style.transform = "rotate(" + (S.mece[i] || 0).toFixed(3) + "deg)";
      s.giro.style.transform = "scale(" + esc.toFixed(4) + ")";
      s.tapa.style.transform = "translateX(" + ((esc - 1) * w * 0.06 + Math.sin((S.mece[i] || 0) * Math.PI / 180) * w * 0.03).toFixed(2) + "px)";
    }
    function paso(ahora) {
      var dt = S.ult ? Math.min(0.034, (ahora - S.ult) / 1000) : 1 / 60; S.ult = ahora;
      var h = tam.h, ocupado = false, sub = 2, sdt = dt / sub, i;
      for (var k = 0; k < sub; k++) {
        for (i = 0; i < n; i++) {
          var antes = S.vx[i] || 0;
          if (i !== S.arrastre) {
            var vuelve = ahora > S.libre, rig = vuelve ? 130 : 0, amort = vuelve ? 2 * Math.sqrt(130) * 0.86 : 3.2;
            S.vx[i] = antes + (-rig * (S.x[i] - S.tx[i]) - amort * antes) * sdt;
            S.x[i] += S.vx[i] * sdt;
          }
          var acel = (S.vx[i] - antes) / sdt;
          S.vesc[i] += (-170 * (S.esc[i] - S.tesc[i]) - 2 * Math.sqrt(170) * 0.8 * S.vesc[i]) * sdt;
          S.esc[i] += S.vesc[i] * sdt;
          S.vmece[i] += (-24 * S.mece[i] - 2.1 * S.vmece[i] - clamp(acel, -6000, 6000) * 0.0045) * sdt;
          S.mece[i] = clamp(S.mece[i] + S.vmece[i] * sdt, -12, 12);
        }
        for (var pasada = 0; pasada < 2; pasada++) for (i = 0; i < n - 1; i++) {
          var a = S.x[i], b = S.x[i + 1];
          var min = (huella(h, S.esc[i], i) + huella(h, S.esc[i + 1], i + 1)) / 2 + h * 0.012, sobra = min - (b - a);
          if (sobra <= 0) continue;
          if (i === S.arrastre) S.x[i + 1] = b + sobra; else if (i + 1 === S.arrastre) S.x[i] = a - sobra; else { S.x[i] = a - sobra / 2; S.x[i + 1] = b + sobra / 2; }
          if (S.vx[i] > S.vx[i + 1]) { var comp = (S.vx[i] + S.vx[i + 1]) / 2; if (i !== S.arrastre) S.vx[i] = comp; if (i + 1 !== S.arrastre) S.vx[i + 1] = comp; }
        }
        if (!tam.carrusel) {
          var borde = h * 0.06, pri = borde + huella(h, S.esc[0], 0) / 2, ulti = tam.ancho - borde - huella(h, S.esc[n - 1], n - 1) / 2;
          if (S.x[0] < pri) { S.x[0] = pri; S.vx[0] = Math.abs(S.vx[0]) * 0.3; }
          if (S.x[n - 1] > ulti) { S.x[n - 1] = ulti; S.vx[n - 1] = -Math.abs(S.vx[n - 1]) * 0.3; }
        }
      }
      for (i = 0; i < n; i++) {
        pintar(i);
        if (Math.abs(S.vx[i]) > 0.4 || (ahora > S.libre && Math.abs(S.x[i] - S.tx[i]) > 0.25) || Math.abs(S.esc[i] - S.tesc[i]) > 0.0005 || Math.abs(S.vesc[i]) > 0.001 || Math.abs(S.mece[i]) > 0.02 || Math.abs(S.vmece[i]) > 0.05) ocupado = true;
      }
      if (S.arrastre >= 0 || ahora < S.libre) ocupado = true;
      if (ocupado) S.raf = requestAnimationFrame(paso);
      else { S.raf = 0; S.ult = 0; for (i = 0; i < n; i++) { if (ahora > S.libre) S.x[i] = S.tx[i]; S.mece[i] = 0; S.vmece[i] = 0; pintar(i); } }
    }
    function andar() {
      if (REDUCIR) { for (var i = 0; i < n; i++) { S.x[i] = S.tx[i]; S.esc[i] = S.tesc[i]; S.mece[i] = 0; pintar(i); } return; }
      if (!S.raf) { S.ult = 0; S.raf = requestAnimationFrame(paso); }
    }
    function empujar(i, v) { if (REDUCIR || i < 0 || i >= n) return; S.vmece[i] += v; andar(); }
    function rotulo() {
      var i = tam.carrusel ? (activa == null ? idxCarrusel : activa) : activa;
      var p = i == null ? null : producto(PIEZAS[i].id);
      nombreEl.textContent = p ? p.nombre : "Chalecos de gamuza";
      infoEl.textContent = p ? precio(p.precio) + " · " + (TACTIL ? "Tocá de nuevo para descolgarla" : "Clic para descolgarla") : (TACTIL ? "Tocá uno para verlo de cerca" : "Pasá el mouse para acercarlos");
      [nombreEl, infoEl].forEach(function (e) { e.classList.remove("is-nuevo"); void e.offsetWidth; e.classList.add("is-nuevo"); });
    }
    function elegir(i) {
      if (activa === i) return;
      if (i != null) { empujar(i - 1, -30); empujar(i + 1, 30); idxCarrusel = i; }
      if (activa != null && activa !== i) { empujar(activa - 1, 14); empujar(activa + 1, -14); }
      activa = i;
      slots.forEach(function (s, k) { s.el.tabIndex = k === (i == null ? 0 : i) ? 0 : -1; s.el.setAttribute("aria-pressed", String(k === i)); });
      objetivos(); rotulo();
    }
    function cercana(cx, cy) {
      var r = riel.getBoundingClientRect(), x = cx - r.left, y = cy - r.top;
      if (y < 0 || y > tam.y + tam.h) return null;
      var mejor = null, d0 = Infinity;
      for (var i = 0; i < n; i++) { var m = huella(tam.h, S.esc[i], i) / 2 + 4, d = Math.abs(x - S.x[i]); if (d < m && d < d0) { mejor = i; d0 = d; } }
      return mejor;
    }

    /* puntero: pasar, arrastrar perchas, deslizar en celular, tocar */
    var P = { id: -1, i: -1, x: 0, y: 0, movio: false, tipo: "", ux: 0, ut: 0, v: 0 }, desliz = 0, abrirTras = -1;
    riel.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      var hit = cercana(e.clientX, e.clientY), t = performance.now(); abrirTras = -1;
      P = { id: e.pointerId, i: hit == null ? -1 : hit, x: e.clientX, y: e.clientY, movio: false, tipo: e.pointerType, ux: e.clientX, ut: t, v: 0 };
    });
    riel.addEventListener("pointermove", function (e) {
      if (P.id === e.pointerId) {
        var dx = e.clientX - P.x, t = performance.now();
        if (!P.movio && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(e.clientY - P.y)) {
          P.movio = true; try { riel.setPointerCapture(e.pointerId); } catch (er) {}
          if (!tam.carrusel && P.i >= 0) { S.arrastre = P.i; S.agarre = (e.clientX - riel.getBoundingClientRect().left) - S.x[P.i]; }
        }
        if (P.movio) {
          var v = (e.clientX - P.ux) / Math.max(1, t - P.ut); P.v = P.v * 0.6 + v * 0.4; P.ux = e.clientX; P.ut = t;
          if (S.arrastre >= 0) { S.vx[S.arrastre] = P.v * 1000; S.x[S.arrastre] = e.clientX - riel.getBoundingClientRect().left - S.agarre; S.libre = t + 900; andar(); }
          else if (tam.carrusel) { desliz = dx; objetivos(); }
        }
        return;
      }
      if (e.pointerType !== "mouse" || tam.carrusel || abierta != null) return;
      var hit = cercana(e.clientX, e.clientY);
      if (activa != null && hit !== activa) {
        var r = riel.getBoundingClientRect();
        if (Math.abs(e.clientX - r.left - S.x[activa]) < huella(tam.h, ZOOM, activa) / 2 + 14 && e.clientY - r.top < tam.y + tam.h + 40) return;
      }
      if (hit != null) elegir(hit);
    });
    function soltarPuntero(e, cancel) {
      if (P.id !== e.pointerId) return;
      try { if (riel.hasPointerCapture(e.pointerId)) riel.releasePointerCapture(e.pointerId); } catch (er) {}
      var p = P; P = { id: -1 };
      if (S.arrastre >= 0) { S.arrastre = -1; S.libre = performance.now() + 700; andar(); return; }
      if (p.movio && tam.carrusel) {
        var dx = e.clientX - p.x, cur = activa == null ? idxCarrusel : activa;
        var st = Math.abs(dx) > 40 || Math.abs(p.v) > 0.45 ? (dx < 0 ? 1 : -1) : 0;
        desliz = 0; activa = null; elegir(clamp(cur + st, 0, n - 1));
        for (var i = 0; i < n; i++) empujar(i, clamp(-p.v * 22, -30, 30));
        return;
      }
      if (cancel || p.movio || p.i < 0) return;
      if (p.tipo !== "mouse" && activa !== p.i) elegir(p.i); else abrirTras = p.i;
    }
    riel.addEventListener("pointerup", function (e) { soltarPuntero(e, false); });
    riel.addEventListener("pointercancel", function (e) { soltarPuntero(e, true); });
    riel.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && P.id < 0 && !tam.carrusel && abierta == null) elegir(null); });
    slots.forEach(function (s, i) {
      s.el.addEventListener("click", function (e) { var a = abrirTras; abrirTras = -1; if (e.detail === 0 || a === i) abrir(i); });
      s.el.addEventListener("focus", function () { if (P.id < 0 && abierta == null) elegir(i); });
    });
    riel.addEventListener("keydown", function (e) {
      if (["ArrowRight", "ArrowLeft", "Home", "End"].indexOf(e.key) < 0) return;
      e.preventDefault();
      var de = activa == null ? 0 : activa;
      var sig = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : clamp(de + (e.key === "ArrowRight" ? 1 : -1), 0, n - 1);
      elegir(sig); slots[sig].el.focus({ preventScroll: true });
    });

    /* pieza descolgada: vuela al frente y se gira arrastrando */
    var det = document.getElementById("detalle"), fig = document.getElementById("detFigura"), giroEl = document.getElementById("detGiro");
    var A = { v: 0, obj: 0, vel: 0, raf: 0, ult: 0, arr: false, x0: 0, a0: 0 }, ladoAct = "frente", cerrando = false, animIda = null;
    function aplicarGiro() { giroEl.style.transform = "rotateY(" + A.v.toFixed(2) + "deg)"; }
    function girarBucle(ahora) {
      var dt = A.ult ? Math.min(0.034, (ahora - A.ult) / 1000) : 1 / 60; A.ult = ahora;
      A.vel += (-90 * (A.v - A.obj) - 2 * Math.sqrt(90) * 0.82 * A.vel) * dt; A.v += A.vel * dt;
      aplicarGiro();
      if (Math.abs(A.v - A.obj) < 0.05 && Math.abs(A.vel) < 0.05) { A.v = A.obj; aplicarGiro(); A.raf = 0; A.ult = 0; return; }
      A.raf = requestAnimationFrame(girarBucle);
    }
    function girarA(lado) {
      if (abierta == null || (!PIEZAS[abierta].espalda)) lado = "frente";
      var base = Math.round(A.v / 360) * 360; A.obj = base + (lado === "espalda" ? 180 : 0);
      if (Math.abs(A.obj - A.v) > 180) A.obj -= 360 * Math.sign(A.obj - A.v);
      ladoAct = lado;
      verFoto(null);
      marcarMini(lado);
      if (REDUCIR) { A.v = A.obj; aplicarGiro(); return; }
      if (!A.raf) A.raf = requestAnimationFrame(girarBucle);
    }
    // miniaturas: frente, espalda, detalles y "próximamente"
    var minis = document.getElementById("detMinis"), fotoEl = document.getElementById("detFoto");
    function marcarMini(clave) { Array.prototype.forEach.call(minis.children, function (b) { b.setAttribute("aria-pressed", String(b.dataset.clave === clave)); }); }
    function verFoto(src) {
      if (!src) { fig.classList.remove("ver-foto"); return; }
      fotoEl.src = src; fig.classList.add("ver-foto");
    }
    function armarMinis(x, p) {
      minis.innerHTML = "";
      var lista = [{ clave: "frente", src: x.img, txt: "Frente" }];
      if (x.espalda) lista.push({ clave: "espalda", src: x.espalda, txt: "Espalda" });
      (p.fotos || []).forEach(function (f, k) { lista.push({ clave: "foto" + k, src: f, txt: "Detalle", foto: true }); });
      lista.push({ clave: "pronto", txt: "Más fotos próximamente" });
      lista.forEach(function (m) {
        var b = document.createElement("button"); b.type = "button"; b.dataset.clave = m.clave; b.setAttribute("aria-label", m.txt);
        if (m.clave === "pronto") { b.className = "detalle__mini detalle__mini--pronto"; b.setAttribute("aria-disabled", "true"); b.innerHTML = "<span>Más fotos</span><small>Próximamente</small>"; }
        else { b.className = "detalle__mini" + (m.foto ? " detalle__mini--foto" : ""); b.innerHTML = '<img src="' + m.src + '" alt="" loading="lazy">'; }
        b.addEventListener("click", function () {
          if (m.clave === "pronto") return;
          if (m.foto) { verFoto(m.src); marcarMini(m.clave); }
          else girarA(m.clave);
        });
        minis.appendChild(b);
      });
    }
    // flechas: recorren frente, espalda y detalles
    function moverFoto(d) {
      var bs = Array.prototype.filter.call(minis.children, function (b) { return b.dataset.clave !== "pronto"; });
      if (!bs.length) return;
      var k = bs.findIndex(function (b) { return b.getAttribute("aria-pressed") === "true"; });
      bs[(k + d + bs.length) % bs.length].click();
    }
    document.getElementById("detPrev").addEventListener("click", function (e) { e.stopPropagation(); moverFoto(-1); });
    document.getElementById("detNext").addEventListener("click", function (e) { e.stopPropagation(); moverFoto(1); });
    ["detPrev", "detNext"].forEach(function (id) { document.getElementById(id).addEventListener("pointerdown", function (e) { e.stopPropagation(); }); });
    function origen(i) { return slots[i].giro.getBoundingClientRect(); }
    function abrir(i) {
      var x = PIEZAS[i], p = producto(x.id);
      abierta = i; cerrando = false; perchero.abierto = true;
      det.classList.toggle("detalle--collar", p.cat === "collares");
      document.getElementById("detFrente").src = x.img; document.getElementById("detFrente").alt = p.nombre;
      document.getElementById("detEspalda").src = x.espalda || x.img;
      document.getElementById("detNum").textContent = String(i + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0");
      document.getElementById("detNombre").textContent = p.nombre;
      document.getElementById("detPrecio").textContent = precio(p.precio);
      document.getElementById("detDesc").textContent = p.desc;
      armarMinis(x, p); verFoto(null);
      document.getElementById("detConsulta").href = linkWhatsapp(CONFIG.mensajeBase + p.nombre + (p.precio == null ? "" : " (" + precio(p.precio) + ")") + ". ¿Está disponible?");
      det.hidden = false; document.body.classList.add("con-modal");
      A.v = 0; A.obj = 0; A.vel = 0; aplicarGiro(); ladoAct = "frente"; girarA("frente");
      var de = origen(i);
      requestAnimationFrame(function () { det.classList.add("is-visible"); });
      if (!REDUCIR && de.width > 0 && fig.animate) {
        var a = fig.getBoundingClientRect(), esc = de.height / a.height;
        var dx = de.left + de.width / 2 - (a.left + a.width / 2), dy = de.top - a.top, alza = Math.min(90, Math.abs(dy) * 0.25 + 30);
        oculta = i; slots[i].el.style.visibility = "hidden";
        animIda = fig.animate([
          { transform: "translate(" + dx + "px," + dy + "px) scale(" + esc + ")" },
          { transform: "translate(" + dx * 0.4 + "px," + (dy * 0.4 - alza) + "px) scale(" + ((esc + 1) / 2 * 1.03) + ") rotate(" + (dx > 0 ? -2.5 : 2.5) + "deg)", offset: 0.5 },
          { transform: "none" }
        ], { duration: 680, easing: "cubic-bezier(.22,.85,.3,1)" });
      }
      det.querySelector(".detalle__cerrar").focus({ preventScroll: true });
    }
    function cerrar() {
      if (abierta == null || cerrando) return;
      cerrando = true; det.classList.remove("is-visible");
      var i = abierta, hacia = origen(i);
      var fin = function () {
        det.hidden = true; document.body.classList.remove("con-modal");
        slots[i].el.style.visibility = ""; oculta = null; abierta = null; perchero.abierto = false; cerrando = false;
        empujar(i, (i % 2 ? 1 : -1) * 44); slots[i].el.focus({ preventScroll: true });
      };
      if (animIda) { animIda.cancel(); animIda = null; }
      if (REDUCIR || !fig.animate || hacia.width === 0) { fin(); return; }
      var de = fig.getBoundingClientRect(), esc = hacia.height / de.height;
      var dx = hacia.left + hacia.width / 2 - (de.left + de.width / 2), dy = hacia.top - de.top;
      var an = fig.animate([
        { transform: "none" },
        { transform: "translate(" + dx * 0.6 + "px," + (dy * 0.6 - 30) + "px) scale(" + ((esc + 1) / 2) + ")", offset: 0.55 },
        { transform: "translate(" + dx + "px," + dy + "px) scale(" + esc + ")" }
      ], { duration: 560, easing: "cubic-bezier(.45,0,.55,1)", fill: "forwards" });
      an.onfinish = function () { fin(); an.cancel(); };
    }
    perchero.cerrar = cerrar;
    perchero.girar = function (d) { moverFoto(d || 1); };
    det.addEventListener("click", function (e) { if (e.target.closest("[data-cerrar-det]")) cerrar(); });
    document.getElementById("detAgregar").addEventListener("click", function () { var p = producto(PIEZAS[abierta].id); agregar(p.id, 1); avisar(p.nombre + " — agregado"); });
    var arr = document.getElementById("detArrastre");
    arr.addEventListener("pointerdown", function (e) { if (!PIEZAS[abierta].espalda || fig.classList.contains("ver-foto")) return; A.arr = true; A.x0 = e.clientX; A.a0 = A.v; cancelAnimationFrame(A.raf); A.raf = 0; A.ult = 0; try { arr.setPointerCapture(e.pointerId); } catch (er) {} });
    arr.addEventListener("pointermove", function (e) { if (!A.arr) return; A.v = clamp(A.a0 + (e.clientX - A.x0) * 0.45, A.a0 - 220, A.a0 + 220); aplicarGiro(); });
    arr.addEventListener("pointerup", function () { if (!A.arr) return; A.arr = false; var f = ((A.v % 360) + 360) % 360; girarA(f > 90 && f < 270 ? "espalda" : "frente"); });
    arr.addEventListener("pointercancel", function () { A.arr = false; girarA(ladoAct); });

    medir(); rotulo();
    var anchoAnt = riel.clientWidth;
    if ("ResizeObserver" in window) new ResizeObserver(function () { if (Math.abs(riel.clientWidth - anchoAnt) > 0.5) { anchoAnt = riel.clientWidth; medir(); } }).observe(riel);
    // al entrar en pantalla, una mano "roza" la barra
    var rozado = false;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es, ob) {
      if (es[0].isIntersecting && !rozado) { rozado = true; ob.disconnect(); PIEZAS.forEach(function (_, i) { setTimeout(function () { empujar(i, 46 - i * 2.5); }, 120 + i * 55); }); }
    }, { threshold: 0.35 }).observe(riel);
  })();

  /* ---------- los collares: busto sobre tronco ----------
     Cada collar es el real (tira de cuero, argolla y piedra) recortado de su
     foto y apoyado sobre el busto: images/collar-*.webp, mismo tamaño que
     images/exhibidor.jpg (script: images/collar-en-busto.py). Sin animación. */
  var filaCol = document.getElementById("collaresFila");
  if (filaCol) {
    ["tierra", "ocre", "pampa", "greda"].forEach(function (nombre) {
      var p = producto("col-" + nombre); if (!p) return;
      var b = document.createElement("button");
      b.type = "button"; b.className = "exhib"; b.setAttribute("aria-label", "Ver " + p.nombre);
      b.innerHTML = '<span class="exhib__marco"><img class="exhib__base" src="images/exhibidor.jpg?v=2" alt="" loading="lazy">' +
        '<img class="exhib__collar" src="images/collar-' + nombre + '.webp?v=2" alt="' + p.nombre + '" loading="lazy"></span>' +
        '<span class="exhib__nombre">' + p.nombre + '</span><span class="exhib__precio">' + precio(p.precio) + '</span>';
      b.addEventListener("click", function () { abrirFicha(p); });
      filaCol.appendChild(b);
    });
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
    if (e.key === "Escape") { if (!visor.hidden) cerrarVisor(); else if (!ficha.hidden) cerrarFicha(); else if (carritoEl.classList.contains("is-abierto")) abrirCarrito(false); else if (perchero.abierto) perchero.cerrar(); else abrirMenu(false); }
    if (perchero.abierto && ficha.hidden && (e.key === "ArrowRight" || e.key === "ArrowLeft")) perchero.girar(e.key === "ArrowRight" ? 1 : -1);
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
