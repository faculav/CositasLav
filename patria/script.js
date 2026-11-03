/* =========================================================
   TIRRA — comportamiento y animaciones
   Usa GSAP + ScrollTrigger si cargaron; si no, la página
   funciona igual, solo que sin animaciones de scroll.
   ========================================================= */
(function () {
  "use strict";

  var REDUCIR = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TACTIL = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var G = window.gsap, ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);

  /* ---------- placeholders de imagen ----------
     Si falta una foto, se muestra un bloque neutro con su
     nombre. Si falta la foto en fondo blanco de un producto,
     se usa la de ambiente (data-respaldo).                 */
  var TONOS = [["#f3efe8", "#ddd5c9"], ["#ece6dc", "#cfc4b5"], ["#e6dfd4", "#c4b6a4"]];
  function placeholder(texto, i) {
    var t = TONOS[i % TONOS.length];
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + t[0] + '"/><stop offset="1" stop-color="' + t[1] + '"/>' +
      '</linearGradient></defs><rect width="800" height="1000" fill="url(#g)"/>' +
      '<text x="400" y="490" font-family="Georgia,serif" font-size="46" fill="#7a4a2a" text-anchor="middle">Tirra</text>' +
      '<text x="400" y="535" font-family="Helvetica,Arial,sans-serif" font-size="18" fill="#8b847b" text-anchor="middle" letter-spacing="2">' + texto + '</text></svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
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
      if (img.dataset.respaldo) {
        var otra = img.parentElement.querySelector("img.b");
        img.src = img.dataset.respaldo;
        delete img.dataset.respaldo;
        img.classList.remove("a");
        if (otra) otra.remove();
        return;
      }
      img.src = placeholder((img.dataset.ph || img.alt || "Foto").toUpperCase(), i);
    });
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
    if (a.hasAttribute("data-ig-texto")) a.textContent = "@" + CONFIG.instagram;
  });
  document.querySelectorAll("[data-email]").forEach(function (a) {
    a.href = "mailto:" + CONFIG.email;
    if (a.hasAttribute("data-email-texto")) a.textContent = CONFIG.email;
  });

  /* ---------- video de portada: que arranque y no se quede trabado ---------- */
  var video = document.getElementById("heroVideo");
  if (video) {
    video.muted = true; video.defaultMuted = true; video.setAttribute("muted", "");
    // mp4 (H.264) primero: lo decodifica el hardware en casi todos lados.
    // Si el navegador no lo soporta, usa la versión webm.
    var mp4 = video.canPlayType('video/mp4; codecs="avc1.4D401F"');
    video.src = !mp4 ? "images/hero-720.webm" : (window.innerWidth < 900 ? video.dataset.chico : video.dataset.grande);
    video.addEventListener("error", function () {
      if (video.src.indexOf(".webm") < 0) { video.src = "images/hero-720.webm"; darPlay(); }
    });
    var enPantalla = true, intentos = 0;
    var darPlay = function () {
      if (!enPantalla || document.hidden) return;
      var pr = video.play();
      if (pr && pr.catch) pr.catch(function () {});
    };
    video.addEventListener("loadeddata", darPlay);
    video.addEventListener("canplay", darPlay);
    // si se pausa solo (ahorro de batería, pestaña de fondo), lo retomamos
    video.addEventListener("pause", function () { setTimeout(darPlay, 300); });
    // si se queda esperando datos mucho rato, recargamos desde donde estaba
    var trabado = null;
    video.addEventListener("waiting", function () {
      clearTimeout(trabado);
      trabado = setTimeout(function () {
        if (video.readyState < 3 && intentos < 3) {
          intentos++; var t = video.currentTime; video.load(); video.currentTime = t; darPlay();
        }
      }, 4000);
    });
    video.addEventListener("playing", function () { clearTimeout(trabado); });
    document.addEventListener("visibilitychange", darPlay);
    // algunos celulares solo dejan reproducir después de un toque o scroll
    ["touchstart", "click", "scroll"].forEach(function (ev) {
      window.addEventListener(ev, function () { if (video.paused) darPlay(); }, { passive: true });
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        enPantalla = e[0].isIntersecting;
        if (enPantalla) darPlay(); else video.pause();
      }).observe(video);
    }
    darPlay();
  }

  /* ---------- año del footer ---------- */
  var anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();

  /* ---------- pieza 3D: botón de consulta según la textura elegida ---------- */
  var piezaBtn = document.getElementById("piezaBtn");
  function consultaPieza(nombre) {
    if (!piezaBtn) return;
    piezaBtn.href = linkWhatsapp(CONFIG.mensajeBase + nombre + ". ¿Está disponible?");
    piezaBtn.querySelector("span").textContent = "Consultar " + nombre;
  }
  consultaPieza("Brazalete Origen");
  var opciones = document.getElementById("piezaOpciones");
  if (opciones) {
    opciones.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      opciones.querySelectorAll("button").forEach(function (x) { x.classList.remove("is-activo"); });
      b.classList.add("is-activo");
      consultaPieza(b.dataset.nombre);
      var resp = document.querySelector(".pieza__respaldo");
      if (resp) resp.src = "images/prod-bra-" + b.dataset.tex + ".jpg";
      window.dispatchEvent(new CustomEvent("tirra:textura", { detail: b.dataset.tex }));
    });
  }

  /* ---------- productos ---------- */
  var cont = document.getElementById("productos");
  var verMas = document.getElementById("verMas");
  var VISIBLES = 8;      // cuántos se ven antes de tocar "Ver más"
  var todosVisibles = false;

  function precio(n) {
    return n == null ? "Consultar precio" : "$ " + n.toLocaleString("es-UY");
  }

  function tarjeta(p) {
    var agotado = p.tag === "Agotado";
    var a = document.createElement("a");
    a.className = "producto";
    a.dataset.cat = p.cat;
    a.dataset.cursor = "Ver";
    a.href = "#coleccion";
    a.setAttribute("aria-label", "Ver " + p.nombre);
    a.addEventListener("click", function (e) { e.preventDefault(); abrirFicha(p); });
    a.innerHTML =
      '<div class="producto__media">' +
        (p.tag ? '<span class="producto__tag' + (agotado ? " producto__tag--agotado" : "") + '">' + p.tag + "</span>" : "") +
        '<img class="a" src="' + p.img + '" alt="' + p.nombre + '" data-ph="' + p.nombre + '"' +
          (p.img2 ? ' data-respaldo="' + p.img2 + '"' : "") + ' loading="lazy">' +
        (p.img2 ? '<img class="b" src="' + p.img2 + '" alt="" data-ph="' + p.nombre + ' 2" loading="lazy">' : "") +
        '<span class="producto__consulta">' + (agotado ? "Consultar reposición" : "Ver pieza") + "</span>" +
      "</div>" +
      '<div class="producto__info">' +
        '<h3 class="producto__nombre">' + p.nombre + "</h3>" +
        '<p class="producto__desc">' + p.desc + "</p>" +
        '<p class="producto__precio">' + (p.antes ? "<s>" + precio(p.antes) + "</s>" : "") + precio(p.precio) + "</p>" +
      "</div>";
    a.querySelectorAll("img").forEach(cuidarImagen);
    inclinar(a);
    return a;
  }

  // inclinación 3D de la tarjeta según el mouse
  function inclinar(card) {
    if (TACTIL || REDUCIR) return;
    var media = card.querySelector(".producto__media");
    card.addEventListener("mousemove", function (e) {
      var r = media.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      media.style.transform = "rotateY(" + (x * 10) + "deg) rotateX(" + (-y * 10) + "deg) translateZ(0)";
    });
    card.addEventListener("mouseleave", function () { media.style.transform = ""; });
  }

  function pintar(filtro) {
    cont.innerHTML = "";
    var lista = PRODUCTOS.filter(function (p) { return filtro === "todos" || p.cat === filtro; });
    var nuevas = [];
    lista.forEach(function (p, i) {
      var t = tarjeta(p);
      if (!todosVisibles && i >= VISIBLES) t.classList.add("is-oculto");
      cont.appendChild(t);
      if (!t.classList.contains("is-oculto")) nuevas.push(t);
    });
    if (verMas) verMas.style.display = (!todosVisibles && lista.length > VISIBLES) ? "" : "none";
    aparecer(nuevas);
    if (ST) ST.refresh();
  }
  function aparecer(items) {
    if (!G || REDUCIR || !items.length) return;
    G.fromTo(items, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.06, overwrite: true });
  }
  if (verMas) {
    verMas.addEventListener("click", function () {
      todosVisibles = true;
      var ocultas = Array.prototype.slice.call(cont.querySelectorAll(".is-oculto"));
      ocultas.forEach(function (t) { t.classList.remove("is-oculto"); });
      verMas.style.display = "none";
      aparecer(ocultas);
      if (ST) ST.refresh();
    });
  }
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
  document.querySelectorAll("[data-ir]").forEach(function (c) {
    c.addEventListener("click", function () {
      var b = filtros && filtros.querySelector('[data-filtro="' + c.dataset.ir + '"]');
      if (b) b.click();
    });
  });
  if (cont) pintar("todos");

  /* ---------- ficha de producto: fotos en grande + añadir al carrito ---------- */
  var ficha = document.getElementById("ficha");
  var fichaImg = document.getElementById("fichaImg");
  var fichaMinis = document.getElementById("fichaMinis");
  var fichaCant = document.getElementById("fichaCant");
  var actual = null, fotosActuales = [], fotoIdx = 0, cantidad = 1;
  var NOMBRE_CAT = { chalecos: "Chalecos", collares: "Collares", brazaletes: "Brazaletes", pulseras: "Pulseras" };

  function fotosDe(p) {
    return [p.img, p.img2].concat(p.fotos || []).filter(Boolean)
      .filter(function (f, i, arr) { return arr.indexOf(f) === i; });
  }
  function mostrarFoto(i) {
    fotoIdx = (i + fotosActuales.length) % fotosActuales.length;
    fichaImg.src = fotosActuales[fotoIdx];
    fichaImg.alt = actual.nombre;
    fichaMinis.querySelectorAll("button").forEach(function (b, k) { b.classList.toggle("is-activa", k === fotoIdx); });
  }
  function abrirFicha(p) {
    actual = p; cantidad = 1; fichaCant.textContent = "1";
    fotosActuales = fotosDe(p);
    document.getElementById("fichaNombre").textContent = p.nombre;
    document.getElementById("fichaCat").textContent = NOMBRE_CAT[p.cat] || "";
    document.getElementById("fichaPrecio").textContent = precio(p.precio);
    document.getElementById("fichaDesc").textContent = p.desc;
    document.getElementById("fichaConsulta").href = linkWhatsapp(CONFIG.mensajeBase + p.nombre +
      (p.precio == null ? "" : " (" + precio(p.precio) + ")") + ". ¿Está disponible?");
    fichaMinis.innerHTML = "";
    fotosActuales.forEach(function (f, k) {
      var b = document.createElement("button");
      b.innerHTML = '<img src="' + f + '" alt="">';
      b.setAttribute("aria-label", "Foto " + (k + 1));
      b.addEventListener("click", function () { mostrarFoto(k); });
      fichaMinis.appendChild(b);
    });
    fichaMinis.hidden = fotosActuales.length < 2;
    fichaImg.onerror = function () { if (fotosActuales.length > 1) { fotosActuales.splice(fotoIdx, 1); fichaMinis.children[fotoIdx] && fichaMinis.children[fotoIdx].remove(); mostrarFoto(0); } };
    mostrarFoto(0);
    ficha.hidden = false;
    requestAnimationFrame(function () { ficha.classList.add("is-abierta"); });
    document.body.classList.add("con-modal");
  }
  function cerrarFicha() {
    ficha.classList.remove("is-abierta");
    document.body.classList.remove("con-modal");
    setTimeout(function () { ficha.hidden = true; }, 450);
  }
  if (ficha) {
    ficha.addEventListener("click", function (e) { if (e.target.closest("[data-cerrar]")) cerrarFicha(); });
    document.getElementById("fichaMenos").addEventListener("click", function () { cantidad = Math.max(1, cantidad - 1); fichaCant.textContent = cantidad; });
    document.getElementById("fichaMas").addEventListener("click", function () { cantidad = Math.min(20, cantidad + 1); fichaCant.textContent = cantidad; });
    document.getElementById("fichaAgregar").addEventListener("click", function () {
      agregar(actual.id, cantidad);
      cerrarFicha();
      avisar(actual.nombre + " se sumó al carrito");
    });
    document.getElementById("fichaFoto").addEventListener("click", function () { abrirVisor(fotoIdx); });
  }

  /* ---------- visor de fotos a pantalla completa ---------- */
  var visor = document.getElementById("visor"), visorImg = document.getElementById("visorImg");
  function abrirVisor(i) {
    mostrarFoto(i); visorImg.src = fotosActuales[fotoIdx]; visorImg.alt = actual.nombre;
    visor.hidden = false; requestAnimationFrame(function () { visor.classList.add("is-abierto"); });
  }
  function moverVisor(d) { mostrarFoto(fotoIdx + d); visorImg.src = fotosActuales[fotoIdx]; }
  function cerrarVisor() { visor.classList.remove("is-abierto"); setTimeout(function () { visor.hidden = true; }, 300); }
  if (visor) {
    document.getElementById("visorCerrar").addEventListener("click", cerrarVisor);
    document.getElementById("visorPrev").addEventListener("click", function () { moverVisor(-1); });
    document.getElementById("visorNext").addEventListener("click", function () { moverVisor(1); });
    visor.addEventListener("click", function (e) { if (e.target === visor) cerrarVisor(); });
    var toqueX = null;   // deslizar con el dedo
    visor.addEventListener("touchstart", function (e) { toqueX = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener("touchend", function (e) {
      if (toqueX == null) return; var dx = e.changedTouches[0].clientX - toqueX; toqueX = null;
      if (Math.abs(dx) > 40) moverVisor(dx < 0 ? 1 : -1);
    });
  }

  /* ---------- carrito (se guarda en este navegador) ---------- */
  var CLAVE = "tirra-carrito";
  var carrito = [];
  try { carrito = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { carrito = []; }
  carrito = carrito.filter(function (it) { return PRODUCTOS.some(function (p) { return p.id === it.id; }); });
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch (e) {} }
  function producto(id) { return PRODUCTOS.filter(function (p) { return p.id === id; })[0]; }
  function agregar(id, n) {
    var it = carrito.filter(function (x) { return x.id === id; })[0];
    if (it) it.cant = Math.min(20, it.cant + n); else carrito.push({ id: id, cant: n });
    guardar(); pintarCarrito(true);
  }
  function cambiar(id, d) {
    carrito = carrito.map(function (x) { if (x.id === id) x.cant += d; return x; }).filter(function (x) { return x.cant > 0; });
    guardar(); pintarCarrito();
  }
  function pintarCarrito(salto) {
    var lista = document.getElementById("carritoLista");
    var unidades = 0, total = 0, sinPrecio = 0, lineas = [];
    lista.innerHTML = "";
    if (!carrito.length) lista.innerHTML = '<p class="carrito__vacio">Todavía no sumaste piezas.<br>Tocá una pieza de la colección para agregarla.</p>';
    carrito.forEach(function (it) {
      var p = producto(it.id); if (!p) return;
      unidades += it.cant;
      if (p.precio == null) sinPrecio++; else total += p.precio * it.cant;
      lineas.push("• " + it.cant + " x " + p.nombre + (p.precio == null ? " (precio a consultar)" : " (" + precio(p.precio * it.cant) + ")"));
      var fila = document.createElement("div");
      fila.className = "carrito__item";
      fila.innerHTML =
        '<img src="' + p.img + '" alt="">' +
        '<div class="carrito__datos"><strong>' + p.nombre + '</strong><span>' + precio(p.precio) + '</span>' +
          '<div class="carrito__cant"><button data-d="-1" aria-label="Menos">−</button><span>' + it.cant + '</span><button data-d="1" aria-label="Más">+</button></div></div>' +
        '<button class="carrito__quitar" aria-label="Quitar">✕</button>';
      fila.querySelector("img").addEventListener("error", function () { if (p.img2) this.src = p.img2; });
      fila.querySelectorAll("[data-d]").forEach(function (b) { b.addEventListener("click", function () { cambiar(it.id, +b.dataset.d); }); });
      fila.querySelector(".carrito__quitar").addEventListener("click", function () { cambiar(it.id, -it.cant); });
      lista.appendChild(fila);
    });
    var num = document.getElementById("carritoNum");
    num.textContent = unidades; num.classList.toggle("is-vacio", !unidades);
    document.body.classList.toggle("con-carrito", unidades > 0);
    if (unidades > 0 && header) header.classList.remove("is-oculto");
    if (salto && G && !REDUCIR) G.fromTo(num, { scale: 1.8 }, { scale: 1, duration: 0.6, ease: "back.out(3)" });
    document.getElementById("carritoTotal").textContent = "$ " + total.toLocaleString("es-UY") + (sinPrecio ? " + a consultar" : "");
    document.getElementById("carritoNota").textContent = sinPrecio ? "Algunas piezas no tienen precio cargado: te lo confirmamos por WhatsApp." : "";
    var fin = document.getElementById("carritoFinalizar");
    fin.classList.toggle("is-deshabilitado", !carrito.length);
    fin.href = linkWhatsapp("¡Hola TIRRA! Quiero hacer este pedido:\n" + lineas.join("\n") +
      "\nTotal: $ " + total.toLocaleString("es-UY") + (sinPrecio ? " + piezas a consultar" : "") + "\n¿Está disponible?");
  }
  var carritoEl = document.getElementById("carrito"), carritoFondo = document.getElementById("carritoFondo");
  function abrirCarrito(si) {
    carritoEl.classList.toggle("is-abierto", si); carritoFondo.classList.toggle("is-abierto", si);
    if (si && aviso) aviso.classList.remove("is-visible");
    document.body.classList.toggle("con-modal", si);
  }
  if (carritoEl) {
    document.getElementById("carritoBtn").addEventListener("click", function () { abrirCarrito(true); });
    document.getElementById("carritoCerrar").addEventListener("click", function () { abrirCarrito(false); });
    carritoFondo.addEventListener("click", function () { abrirCarrito(false); });
    document.getElementById("carritoVaciar").addEventListener("click", function () { carrito = []; guardar(); pintarCarrito(); });
    document.getElementById("carritoFinalizar").addEventListener("click", function (e) { if (!carrito.length) e.preventDefault(); });
    pintarCarrito();
  }

  /* ---------- aviso flotante ---------- */
  var aviso = document.getElementById("aviso"), avisoT = null;
  function avisar(txt) {
    aviso.innerHTML = '<span>' + txt + '</span><button type="button">Ver carrito</button>';
    aviso.querySelector("button").onclick = function () { aviso.classList.remove("is-visible"); abrirCarrito(true); };
    aviso.classList.add("is-visible");
    clearTimeout(avisoT); avisoT = setTimeout(function () { aviso.classList.remove("is-visible"); }, 3600);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (visor && !visor.hidden) cerrarVisor();
    else if (ficha && !ficha.hidden) cerrarFicha();
    else if (carritoEl && carritoEl.classList.contains("is-abierto")) abrirCarrito(false);
  });
  document.addEventListener("keydown", function (e) {
    if (!visor || visor.hidden) return;
    if (e.key === "ArrowRight") moverVisor(1); if (e.key === "ArrowLeft") moverVisor(-1);
  });

  /* ---------- menú a pantalla completa ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menuMovil");
  function abrirMenu(abierto) {
    menu.classList.toggle("is-abierto", abierto);
    burger.classList.toggle("is-abierto", abierto);
    document.body.classList.toggle("menu-abierto", abierto);
    burger.setAttribute("aria-expanded", String(abierto));
    burger.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    burger.querySelector(".burger__txt").textContent = abierto ? "Cerrar" : "Menú";
  }
  if (burger && menu) {
    burger.addEventListener("click", function () { abrirMenu(!menu.classList.contains("is-abierto")); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) abrirMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") abrirMenu(false); });
  }

  /* ---------- header: se esconde al bajar, vuelve al subir ---------- */
  var header = document.getElementById("header");
  var ultimoY = 0;
  function revisarHeader() {
    var y = window.scrollY;
    header.classList.toggle("is-scroll", y > window.innerHeight * 0.85);
    // con piezas en el carrito el header no se esconde, así el carrito queda siempre a mano
    header.classList.toggle("is-oculto", y > ultimoY && y > window.innerHeight &&
      !document.body.classList.contains("menu-abierto") && !document.body.classList.contains("con-carrito"));
    ultimoY = y;
  }
  window.addEventListener("scroll", revisarHeader, { passive: true });
  revisarHeader();

  /* ---------- cursor propio ---------- */
  var cursor = document.getElementById("cursor");
  if (cursor && !TACTIL) {
    var cx = innerWidth / 2, cy = innerHeight / 2, px = cx, py = cy;
    window.addEventListener("mousemove", function (e) { cx = e.clientX; cy = e.clientY; });
    (function loop() {
      px += (cx - px) * 0.2; py += (cy - py) * 0.2;
      cursor.style.transform = "translate(" + px + "px," + py + "px)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest("[data-cursor]");
      cursor.classList.toggle("is-grande", !!t);
      cursor.querySelector("span").textContent = t ? t.dataset.cursor : "";
    });
  }

  /* ---------- botones imán ---------- */
  if (!TACTIL && !REDUCIR) {
    document.querySelectorAll(".iman, .btn").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = "translate(" + x * 0.25 + "px," + y * 0.3 + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- dividir títulos en letras y el manifiesto en palabras ---------- */
  function dividirLetras(el) {
    var partes = [];
    el.childNodes.forEach(function (n) { partes.push(n); });
    el.innerHTML = "";
    partes.forEach(function (n) {
      var texto = n.textContent, envoltorio = n.nodeType === 1 ? n.cloneNode(false) : null;
      texto.split(/(\s+)/).forEach(function (pal) {
        if (!pal) return;
        if (/^\s+$/.test(pal)) { (envoltorio || el).appendChild(document.createTextNode(" ")); return; }
        var m = document.createElement("span"); m.className = "linea-mask";
        pal.split("").forEach(function (ch) {
          var s = document.createElement("span"); s.className = "letra"; s.textContent = ch; m.appendChild(s);
        });
        (envoltorio || el).appendChild(m);
      });
      if (envoltorio) el.appendChild(envoltorio);
    });
    return el.querySelectorAll(".letra");
  }
  function dividirPalabras(el) {
    var pals = el.textContent.trim().split(/\s+/);
    el.innerHTML = pals.map(function (p) { return '<span class="palabra">' + p + "</span>"; }).join(" ");
    return el.querySelectorAll(".palabra");
  }

  /* ---------- contador de cifras ---------- */
  function contar(el) {
    var fin = +el.dataset.contar;
    if (!G || REDUCIR) { el.textContent = fin; return; }
    var o = { v: fin > 1000 ? fin - 40 : 0 };
    G.to(o, { v: fin, duration: 1.8, ease: "power3.out", onUpdate: function () { el.textContent = Math.round(o.v); } });
  }

  /* ---------- pantalla de carga + entrada ---------- */
  var carga = document.getElementById("carga"), num = document.getElementById("cargaNum");
  var titulo = document.querySelector(".hero__titulo");
  var letrasHero = titulo ? dividirLetras(titulo) : [];
  document.body.classList.add("cargando");
  function entrar() {
    document.body.classList.remove("cargando");
    if (carga) carga.classList.add("is-fuera");
    if (G && !REDUCIR) {
      G.from(letrasHero, { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.025, delay: 0.35 });
      G.from(".hero__kicker, .hero__pie", { opacity: 0, y: 20, duration: 1, delay: 0.9, stagger: 0.1 });
      G.from(".header .logo, .header__der", { opacity: 0, y: -20, duration: 1, ease: "expo.out", delay: 0.6 });
    }
    setTimeout(function () { if (carga) carga.remove(); }, 1300);
  }
  if (carga && !REDUCIR) {
    var n = 0, listo = false;
    window.addEventListener("load", function () { listo = true; });
    setTimeout(function () { listo = true; }, TACTIL ? 1800 : 3000);   // por si algo tarda demasiado
    (function sube() {
      n = Math.min(100, n + (listo ? 5 : Math.random() * (TACTIL ? 4 : 2.2)));
      if (num) num.textContent = Math.floor(n);
      if (n < 100) requestAnimationFrame(sube); else setTimeout(entrar, 150);
    })();
  } else {
    entrar();
  }

  /* ---------- animaciones de scroll (GSAP) ---------- */
  var manif = document.querySelector("[data-palabras]");
  var palabras = manif ? dividirPalabras(manif) : [];

  if (!G || !ST || REDUCIR) {
    palabras.forEach(function (p) { p.style.opacity = 1; });
    document.querySelectorAll("[data-contar]").forEach(contar);
    return;
  }

  // el video se achica y redondea al bajar (solo compu: en celu queda quieto, más simple)
  G.matchMedia().add("(min-width: 861px)", function () {
    G.to("#heroMarco", {
      scale: 0.9, borderRadius: 28, ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
    });
  });
  G.to(".hero__contenido", {
    yPercent: -18, opacity: 0, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
  });

  // manifiesto: se ilumina palabra por palabra
  if (palabras.length) {
    G.to(palabras, {
      opacity: 1, stagger: 0.08, ease: "none",
      scrollTrigger: { trigger: manif, start: "top 80%", end: "bottom 45%", scrub: true }
    });
  }

  // cinta infinita que acelera con la velocidad del scroll
  var cinta = document.getElementById("cinta");
  if (cinta) {
    var xCinta = 0, vel = 1;
    ST.create({ onUpdate: function (s) { vel = 1 + Math.min(Math.abs(s.getVelocity()) / 300, 8) * (s.direction || 1); } });
    G.ticker.add(function () {
      var mitad = cinta.scrollWidth / 3;
      xCinta -= vel; vel += (1 - vel) * 0.05;
      if (xCinta <= -mitad) xCinta += mitad;
      if (xCinta > 0) xCinta -= mitad;
      cinta.style.transform = "translateX(" + xCinta + "px)";
    });
  }

  // títulos de sección: entran desde abajo
  document.querySelectorAll(".titulo").forEach(function (t) {
    G.from(t, { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: t, start: "top 88%" } });
  });

  // categorías: scroll horizontal fijado (solo pantallas grandes)
  var mm = G.matchMedia();
  mm.add("(min-width: 861px)", function () {
    var pista = document.getElementById("catsPista");
    if (!pista) return;
    var distancia = function () { return Math.max(0, pista.scrollWidth - window.innerWidth); };
    G.to(pista, {
      x: function () { return -distancia(); }, ease: "none",
      scrollTrigger: { trigger: ".cats", start: "top top", end: function () { return "+=" + distancia(); }, pin: ".cats__fijo", scrub: 1, invalidateOnRefresh: true }
    });
  });

  // parallax en las fotos de "Nuestro cuero"
  mm.add("(min-width: 861px)", function () {
    document.querySelectorAll("[data-parallax]").forEach(function (img) {
      var v = +img.dataset.parallax;
      G.fromTo(img, { yPercent: -v }, { yPercent: v, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  // pieza 3D, cifras, acordeón, contacto: aparición
  G.from(".pieza__escena", { scale: 0.9, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".pieza", start: "top 75%" } });
  document.querySelectorAll("[data-contar]").forEach(function (el) {
    ST.create({ trigger: el, start: "top 90%", once: true, onEnter: function () { contar(el); } });
  });
  G.from(".acordeon details", { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".acordeon", start: "top 85%" } });
  var hablemos = document.querySelector(".contacto__titulo");
  if (hablemos) {
    var letrasH = dividirLetras(hablemos);
    G.from(letrasH, { yPercent: 110, stagger: 0.04, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: hablemos, start: "top 85%" } });
  }
  G.from(".footer__gigante", { yPercent: 40, opacity: 0, ease: "none", scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true } });

})();
