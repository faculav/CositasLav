/* =========================================================
   MILO RACIONES — comportamiento
   (catálogo, filtros, pedido, zonas y calculadora)
   ========================================================= */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- utilidades ---------- */
  function pesos(n) {
    return "$ " + Math.round(n).toLocaleString("es-UY");
  }
  function porKilo(n) {
    return "$ " + n.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + " / kg";
  }
  function linkWhatsapp(mensaje) {
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(mensaje);
  }
  function slug(t) {
    return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function escapar(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var avisoEl = $("[data-aviso]");
  var avisoTimer;
  function avisar(texto) {
    avisoEl.textContent = texto;
    avisoEl.classList.add("visible");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function () { avisoEl.classList.remove("visible"); }, 2200);
  }

  /* ---------- placeholders de imagen ----------
     Mientras no exista images/<id>.jpg se muestra un recuadro
     liso con el nombre de la marca. Al subir la foto real con
     ese nombre, el recuadro desaparece solo.                   */

  function placeholder(p) {
    var marca = escapar(p ? p.marca : "Milo");
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
      '<rect width="400" height="400" fill="#F5FAFA"/>' +
      '<text x="200" y="208" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="700" font-size="22" fill="#9AA7A9">' + marca + '</text>' +
      '</svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function cuidarImagen(img, p) {
    img.addEventListener("error", function onErr() {
      img.removeEventListener("error", onErr);
      img.src = placeholder(p);
    });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) img.src = placeholder(p);
  }
  // Imágenes fijas del HTML (ej. foto de Milo)
  $$("img[data-ph]").forEach(function (img) { cuidarImagen(img, null); });

  /* ---------- datos generales en el HTML ---------- */
  $$("[data-whatsapp]").forEach(function (a) {
    a.href = linkWhatsapp("¡Hola Milo! Quería hacer una consulta.");
  });
  $$("[data-whatsapp-texto]").forEach(function (a) {
    var n = CONFIG.whatsapp.replace(/^598/, "0");
    a.textContent = n.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  });
  $$("[data-instagram-link]").forEach(function (a) { a.href = "https://instagram.com/" + CONFIG.instagram; });
  $$("[data-instagram]").forEach(function (a) {
    a.href = "https://instagram.com/" + CONFIG.instagram;
    a.textContent = "@" + CONFIG.instagram;
  });
  $$("[data-email]").forEach(function (a) {
    a.href = "mailto:" + CONFIG.email;
    a.textContent = CONFIG.email;
  });
  $$("[data-envio-gratis]").forEach(function (el) { el.textContent = pesos(CONFIG.envioGratisDesde); });
  $$("[data-costo-envio]").forEach(function (el) { el.textContent = pesos(CONFIG.costoEnvio); });
  $$("[data-hora-corte]").forEach(function (el) { el.textContent = CONFIG.horaCorte; });
  $$("[data-anio]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- menú móvil ---------- */
  var btnMenu = $("[data-menu]");
  var nav = $("#nav");
  function cerrarMenu() {
    nav.classList.remove("abierto");
    btnMenu.setAttribute("aria-expanded", "false");
  }
  btnMenu.addEventListener("click", function () {
    var abierto = nav.classList.toggle("abierto");
    btnMenu.setAttribute("aria-expanded", String(abierto));
  });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", cerrarMenu); });

  /* ---------- zonas ---------- */
  ["costa", "cerca"].forEach(function (tipo) {
    var ul = $('[data-zonas="' + tipo + '"]');
    if (!ul) return;
    ZONAS.filter(function (z) { return z.tipo === tipo; }).forEach(function (z) {
      var li = document.createElement("li");
      li.innerHTML = escapar(z.zona) + (tipo === "cerca" ? " <small>· " + escapar(z.dias) + "</small>" : "");
      ul.appendChild(li);
    });
  });

  $$("[data-select-zona]").forEach(function (sel) {
    var grupos = { costa: "Ciudad de la Costa", cerca: "Alrededores" };
    Object.keys(grupos).forEach(function (tipo) {
      var og = document.createElement("optgroup");
      og.label = grupos[tipo];
      ZONAS.filter(function (z) { return z.tipo === tipo; }).forEach(function (z) {
        var o = document.createElement("option");
        o.value = z.zona; o.textContent = z.zona;
        og.appendChild(o);
      });
      sel.appendChild(og);
    });
    var otra = document.createElement("option");
    otra.value = "otra"; otra.textContent = "Otra zona";
    sel.appendChild(otra);
  });

  function infoZona(nombre) {
    return ZONAS.filter(function (z) { return z.zona === nombre; })[0] || null;
  }

  var selHero = $("#zona-hero");
  var resZona = $("[data-resultado-zona]");
  selHero.addEventListener("change", function () {
    var z = infoZona(selHero.value);
    resZona.className = "zona-resultado";
    if (!selHero.value) { resZona.textContent = ""; return; }
    if (z && z.tipo === "costa") {
      resZona.classList.add("ok");
      resZona.textContent = "✓ ¡Sí! Llegamos de lunes a sábado. Pedí antes de las " + CONFIG.horaCorte + " y lo recibís hoy.";
    } else if (z) {
      resZona.classList.add("ok");
      resZona.textContent = "✓ ¡Sí! Repartimos en " + z.zona + ": " + z.dias.toLowerCase() + ".";
    } else {
      resZona.classList.add("otra");
      resZona.textContent = "Escribinos por WhatsApp y vemos cómo hacértelo llegar.";
    }
    var selCarrito = $("[data-carrito-form] [data-select-zona]");
    if (selCarrito && !selCarrito.value) selCarrito.value = selHero.value;
    guardarDatos();
  });
  $("[data-form-zona]").addEventListener("submit", function (e) { e.preventDefault(); });

  /* ---------- catálogo ---------- */
  var contProductos = $("#productos");
  var sinResultados = $("[data-sin-resultados]");
  var estado = { cat: "todos", texto: "", marca: "" };

  // Marcas para filtro y grilla
  var marcas = [];
  PRODUCTOS.forEach(function (p) { if (p.marca !== "Milo" && marcas.indexOf(p.marca) < 0) marcas.push(p.marca); });
  marcas.sort(function (a, b) { return a.localeCompare(b, "es"); });

  var selMarca = $("[data-marca]");
  marcas.forEach(function (m) {
    var o = document.createElement("option");
    o.value = m; o.textContent = m;
    selMarca.appendChild(o);
  });

  var listaMarcas = $("[data-lista-marcas]");
  marcas.forEach(function (m) {
    var li = document.createElement("li");
    var img = document.createElement("img");
    img.alt = m;
    img.src = "images/marca-" + slug(m) + ".png";
    img.addEventListener("error", function () { li.textContent = m; });
    li.appendChild(img);
    listaMarcas.appendChild(li);
  });

  function claseTag(tag) { return "tag-" + slug(tag); }

  function tarjeta(p) {
    var art = document.createElement("article");
    art.className = "producto reveal";
    art.dataset.id = p.id;
    var sinStock = p.tag === "Sin stock";

    var opciones = p.opciones.length > 1
      ? '<div class="opciones" role="group" aria-label="Presentación">' + p.opciones.map(function (o, i) {
          return '<button type="button" class="opcion" data-op="' + i + '" aria-pressed="' + (i === 0) + '">' + escapar(o.etiqueta) + "</button>";
        }).join("") + "</div>"
      : '<div class="opciones"><span class="opcion" aria-pressed="true">' + escapar(p.opciones[0].etiqueta) + "</span></div>";

    art.innerHTML =
      '<div class="producto-foto">' +
        '<img alt="' + escapar(p.nombre) + '" loading="lazy" width="400" height="400" />' +
        (p.tag ? '<span class="producto-tag ' + claseTag(p.tag) + '">' + escapar(p.tag) + "</span>" : "") +
      "</div>" +
      '<div class="producto-info">' +
        '<span class="producto-marca">' + escapar(p.marca) + "</span>" +
        "<h3>" + escapar(p.nombre) + "</h3>" +
        '<p class="producto-desc">' + escapar(p.desc) + "</p>" +
        opciones +
        '<div class="producto-pie">' +
          '<p class="precio" data-precio></p>' +
          '<button type="button" class="btn-agregar" data-agregar' + (sinStock ? " disabled" : "") + ">" +
            (sinStock ? "Sin stock" : '<span aria-hidden="true">+</span> Agregar') +
          "</button>" +
        "</div>" +
      "</div>";

    var img = $("img", art);
    cuidarImagen(img, p);
    img.src = "images/" + p.id + ".jpg";

    var elegido = 0;
    function pintarPrecio() {
      var o = p.opciones[elegido];
      $("[data-precio]", art).innerHTML = pesos(o.precio) +
        (o.kg ? '<span class="precio-kg">' + porKilo(o.precio / o.kg) + "</span>" : "");
    }
    pintarPrecio();

    $$("[data-op]", art).forEach(function (b) {
      b.addEventListener("click", function () {
        elegido = Number(b.dataset.op);
        $$("[data-op]", art).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        pintarPrecio();
      });
    });

    var btn = $("[data-agregar]", art);
    btn.addEventListener("click", function () {
      agregar(p.id, elegido);
      btn.classList.add("listo");
      btn.innerHTML = "✓ Agregado";
      setTimeout(function () {
        btn.classList.remove("listo");
        btn.innerHTML = '<span aria-hidden="true">+</span> Agregar';
      }, 1300);
    });
    return art;
  }

  var tarjetas = PRODUCTOS.map(function (p) {
    var el = tarjeta(p);
    contProductos.appendChild(el);
    return { p: p, el: el };
  });

  function filtrar() {
    var t = slug(estado.texto);
    var visibles = 0;
    tarjetas.forEach(function (x) {
      var p = x.p;
      var ok = (estado.cat === "todos" || p.cat === estado.cat) &&
               (!estado.marca || p.marca === estado.marca) &&
               (!t || slug(p.nombre + " " + p.marca + " " + p.desc + " " + p.cat).indexOf(t) >= 0);
      x.el.hidden = !ok;
      if (ok) { visibles++; x.el.classList.add("visible"); }
    });
    sinResultados.hidden = visibles > 0;
  }

  var tabs = $$("[data-tabs] [data-cat]");
  function elegirCat(cat) {
    estado.cat = cat;
    tabs.forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.cat === cat)); });
    filtrar();
  }
  tabs.forEach(function (b) { b.addEventListener("click", function () { elegirCat(b.dataset.cat); }); });

  $$("[data-ir-cat]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      estado.texto = ""; $("[data-buscar]").value = "";
      estado.marca = ""; selMarca.value = "";
      elegirCat(el.dataset.irCat);
      $("#tienda").scrollIntoView();
      cerrarMenu();
    });
  });

  var tBuscar;
  $("[data-buscar]").addEventListener("input", function (e) {
    clearTimeout(tBuscar);
    tBuscar = setTimeout(function () {
      estado.texto = e.target.value;
      // al buscar, se busca en todas las categorías
      if (estado.texto.trim() && estado.cat !== "todos") elegirCat("todos"); else filtrar();
    }, 120);
  });
  selMarca.addEventListener("change", function () { estado.marca = selMarca.value; filtrar(); });

  /* ---------- pedido (carrito) ---------- */
  var CLAVE = "milo-pedido";
  var CLAVE_DATOS = "milo-datos";
  var pedido = [];
  try { pedido = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { pedido = []; }
  // descartar items que ya no existen en el catálogo
  pedido = pedido.filter(function (it) { return producto(it.id) && producto(it.id).opciones[it.op]; });

  function producto(id) { return PRODUCTOS.filter(function (p) { return p.id === id; })[0]; }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(pedido)); } catch (e) { /* sin almacenamiento */ } }

  function agregar(id, op) {
    var it = pedido.filter(function (x) { return x.id === id && x.op === op; })[0];
    if (it) it.cant++; else pedido.push({ id: id, op: op, cant: 1 });
    guardar();
    pintarPedido();
    var p = producto(id);
    avisar("Agregaste " + p.nombre + " (" + p.opciones[op].etiqueta + ")");
  }

  function subtotal() {
    return pedido.reduce(function (s, it) { return s + producto(it.id).opciones[it.op].precio * it.cant; }, 0);
  }
  function costoEnvio(sub) { return sub >= CONFIG.envioGratisDesde ? 0 : CONFIG.costoEnvio; }

  var ulItems = $("[data-carrito-items]");
  function pintarPedido() {
    var cant = pedido.reduce(function (s, it) { return s + it.cant; }, 0);
    var cuenta = $("[data-cuenta]");
    cuenta.textContent = cant;
    cuenta.hidden = cant === 0;

    var vacio = pedido.length === 0;
    $("[data-carrito-vacio]").hidden = !vacio;
    $("[data-carrito-form]").hidden = vacio;
    $("[data-carrito-pie]").hidden = vacio;
    $("[data-envio-barra]").hidden = vacio;

    ulItems.innerHTML = "";
    pedido.forEach(function (it, i) {
      var p = producto(it.id);
      var o = p.opciones[it.op];
      var li = document.createElement("li");
      li.className = "carrito-item";
      li.innerHTML =
        '<img alt="" />' +
        '<div><p class="carrito-item-nombre">' + escapar(p.nombre) + '</p><p class="carrito-item-op">' + escapar(o.etiqueta) + " · " + pesos(o.precio) + "</p></div>" +
        '<div class="carrito-item-der"><span class="carrito-item-precio">' + pesos(o.precio * it.cant) + "</span>" +
          '<div class="cantidad"><button type="button" data-menos aria-label="Quitar uno">−</button><span>' + it.cant + '</span><button type="button" data-mas aria-label="Sumar uno">+</button></div>' +
        "</div>";
      var img = $("img", li);
      cuidarImagen(img, p);
      img.src = "images/" + p.id + ".jpg";
      $("[data-mas]", li).addEventListener("click", function () { it.cant++; guardar(); pintarPedido(); });
      $("[data-menos]", li).addEventListener("click", function () {
        it.cant--;
        if (it.cant <= 0) pedido.splice(i, 1);
        guardar(); pintarPedido();
      });
      ulItems.appendChild(li);
    });

    var sub = subtotal();
    var env = costoEnvio(sub);
    $("[data-subtotal]").textContent = pesos(sub);
    $("[data-envio]").textContent = env === 0 ? "Sin costo" : pesos(env);
    $("[data-total]").textContent = pesos(sub + env);

    var falta = CONFIG.envioGratisDesde - sub;
    $("[data-envio-texto]").textContent = falta > 0
      ? "Te faltan " + pesos(falta) + " para el envío sin costo"
      : "Tu envío es sin costo";
    $("[data-envio-progreso]").style.width = Math.min(100, (sub / CONFIG.envioGratisDesde) * 100) + "%";
  }

  // abrir / cerrar
  var carrito = $("#carrito");
  var fondo = $(".carrito-fondo");
  var ultimoFoco = null;
  function abrirCarrito() {
    ultimoFoco = document.activeElement;
    fondo.hidden = false;
    requestAnimationFrame(function () { fondo.classList.add("visible"); });
    carrito.classList.add("abierto");
    carrito.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(function () { $(".carrito-cerrar").focus(); }, 50);
  }
  function cerrarCarrito() {
    fondo.classList.remove("visible");
    carrito.classList.remove("abierto");
    carrito.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(function () { fondo.hidden = true; }, 250);
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  $$("[data-abrir-carrito]").forEach(function (b) { b.addEventListener("click", abrirCarrito); });
  $$("[data-cerrar-carrito]").forEach(function (b) { b.addEventListener("click", cerrarCarrito); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && carrito.classList.contains("abierto")) cerrarCarrito();
  });

  $("[data-vaciar]").addEventListener("click", function () {
    if (!confirm("¿Vaciar el pedido?")) return;
    pedido = []; guardar(); pintarPedido();
  });

  // datos del cliente (se recuerdan en este navegador)
  var form = $("[data-carrito-form]");
  try {
    var d = JSON.parse(localStorage.getItem(CLAVE_DATOS)) || {};
    ["nombre", "barrio", "direccion", "pago"].forEach(function (k) { if (d[k] && form[k]) form[k].value = d[k]; });
  } catch (e) { /* nada */ }
  function guardarDatos() {
    try {
      localStorage.setItem(CLAVE_DATOS, JSON.stringify({
        nombre: form.nombre.value, barrio: form.barrio.value, direccion: form.direccion.value, pago: form.pago.value
      }));
    } catch (e) { /* nada */ }
  }
  form.addEventListener("change", guardarDatos);
  form.addEventListener("submit", function (e) { e.preventDefault(); });

  $("[data-enviar-pedido]").addEventListener("click", function () {
    var faltan = ["nombre", "barrio", "direccion"].filter(function (k) {
      var vacio = !form[k].value.trim();
      form[k].classList.toggle("invalido", vacio);
      return vacio;
    });
    $("[data-form-error]").hidden = faltan.length === 0;
    if (faltan.length) { form[faltan[0]].focus(); return; }

    var sub = subtotal();
    var env = costoEnvio(sub);
    var barrio = form.barrio.value === "otra" ? "Otra zona (a coordinar)" : form.barrio.value;
    var lineas = ["¡Hola Milo! Quiero hacer este pedido:", ""];
    pedido.forEach(function (it) {
      var p = producto(it.id);
      var o = p.opciones[it.op];
      lineas.push("• " + it.cant + " × " + p.nombre + " (" + o.etiqueta + ") — " + pesos(o.precio * it.cant));
    });
    lineas.push("");
    lineas.push("Subtotal: " + pesos(sub));
    lineas.push("Envío: " + (env === 0 ? "sin costo" : pesos(env)));
    lineas.push("*Total: " + pesos(sub + env) + "*");
    lineas.push("");
    lineas.push("Nombre: " + form.nombre.value.trim());
    lineas.push("Barrio: " + barrio);
    lineas.push("Dirección: " + form.direccion.value.trim());
    lineas.push("Pago: " + form.pago.value);
    if (form.nota.value.trim()) lineas.push("Comentarios: " + form.nota.value.trim());

    guardarDatos();
    window.open(linkWhatsapp(lineas.join("\n")), "_blank", "noopener");
  });

  pintarPedido();

  /* ---------- calculadora de duración ----------
     Energía de mantenimiento ≈ 70 × peso^0,75 kcal,
     por un factor según especie y actividad.
     Ración seca promedio ≈ 3,6 kcal por gramo.           */
  var calc = $("[data-calc]");
  var aviso = $("[data-calc-aviso]");
  function calcular() {
    var especie = calc.especie.value;
    var peso = parseFloat(String(calc.peso.value).replace(",", "."));
    var bolsa = parseFloat(String(calc.bolsa.value).replace(",", "."));
    var act = parseFloat(calc.actividad.value);
    if (!(peso > 0) || !(bolsa > 0)) {
      $("[data-calc-dias]").textContent = "—";
      $("[data-calc-gramos]").textContent = "—";
      return;
    }
    var factor = (especie === "gato" ? 1.2 : 1.6) * act;
    var kcal = 70 * Math.pow(peso, 0.75) * factor;
    var gramos = kcal / 3.6;
    var dias = Math.floor((bolsa * 1000) / gramos);
    $("[data-calc-dias]").textContent = dias;
    $("[data-calc-gramos]").textContent = Math.round(gramos / 5) * 5;
    var quien = especie === "gato" ? "mi gato" : "mi perro";
    aviso.href = linkWhatsapp(
      "¡Hola Milo! Quiero que me avisen cuando se esté por terminar la ración. " +
      "Compro bolsas de " + bolsa + " kg para " + quien + " de " + peso + " kg (me dura unos " + dias + " días)."
    );
  }
  calc.addEventListener("input", calcular);
  calc.addEventListener("change", calcular);
  calc.addEventListener("submit", function (e) { e.preventDefault(); });
  calcular();

  /* ---------- aparición al hacer scroll ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("visible"); });
  }
})();
