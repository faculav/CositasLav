/* =========================================================
   TIRRA — perchero en 3D (three.js r128)
   Cada pieza se arma con su foto de frente y de espalda:
   - una malla curvada adelante (frente) y otra atrás (espalda),
   - "rebanadas" intermedias que le dan el espesor del cuero,
   - luces reales: al girar, un lado se ilumina y el otro se apaga.
   El gancho queda en el origen, así la pieza gira y se balancea
   desde donde cuelga. Si no hay WebGL, tirra.js usa las fotos planas.
   ========================================================= */
(function () {
  "use strict";
  var T = window.THREE;
  if (!T) return;

  var cacheTex = {};
  function textura(src, alCargar) {
    if (cacheTex[src]) {
      var c = cacheTex[src];
      if (c.listo) alCargar(c.tex); else c.espera.push(alCargar);
      return;
    }
    var entrada = { tex: null, listo: false, espera: [alCargar] };
    cacheTex[src] = entrada;
    new T.TextureLoader().load(src, function (tex) {
      tex.encoding = T.sRGBEncoding;
      tex.anisotropy = 4;
      entrada.tex = tex; entrada.listo = true;
      entrada.espera.forEach(function (f) { f(tex); }); entrada.espera = [];
    });
  }

  // plano curvado: el gancho (hookX, arriba) queda en el origen; ancho 1
  function plano(aspecto, hookX, z, curva) {
    var alto = 1 / aspecto, g = new T.PlaneGeometry(1, alto, 36, 54), p = g.attributes.position;
    for (var k = 0; k < p.count; k++) {
      var x = p.getX(k), y = p.getY(k);
      var curv = -curva * x * x * 4;                 // los costados se van hacia atrás
      p.setXYZ(k, x + 0.5 - hookX, y - alto / 2, z + curv * (z >= 0 ? 1 : 0.85));
    }
    g.computeVertexNormals();
    return g;
  }

  function armarPieza(pz, alListo) {
    var grupo = new T.Group();          // se balancea (rotación z)
    var giro = new T.Group();           // gira (rotación y)
    grupo.add(giro);
    textura(pz.img, function (tf) {
      var asp = tf.image.width / tf.image.height;
      var prof = pz.collar ? 0.025 : 0.06, curva = pz.collar ? 0.02 : 0.11;
      var matF = new T.MeshStandardMaterial({ map: tf, alphaTest: 0.5, roughness: 0.86, metalness: 0, side: T.FrontSide });
      giro.add(new T.Mesh(plano(asp, pz.hookX, prof / 2, curva), matF));
      // canto: rebanadas con la silueta, más oscuras (el corte del cuero)
      var matC = new T.MeshStandardMaterial({ map: tf, alphaTest: 0.5, roughness: 0.95, color: 0x6a5546, side: T.DoubleSide });
      var N = pz.collar ? 4 : 9;
      for (var s = 1; s < N; s++) {
        var z = prof / 2 - (prof * s) / N;
        giro.add(new T.Mesh(plano(asp, pz.hookX, z, curva), matC));
      }
      textura(pz.espalda || pz.img, function (tb) {
        var tbm = tb.clone(); tbm.needsUpdate = true;
        tbm.wrapS = T.ClampToEdgeWrapping;
        tbm.repeat.x = -1;
        // espejado y alineado para que los ganchos de las dos fotos coincidan
        var hb = pz.espalda ? pz.hookXb : pz.hookX;
        tbm.offset.x = 1 + (hb - (1 - pz.hookX));
        var matB = new T.MeshStandardMaterial({ map: tbm, alphaTest: 0.5, roughness: 0.86, side: T.BackSide });
        giro.add(new T.Mesh(plano(asp, pz.hookX, -prof / 2, curva), matB));
        if (alListo) alListo(asp);
      });
    });
    return { grupo: grupo, giro: giro };
  }

  function escena() {
    var sc = new T.Scene();
    sc.add(new T.HemisphereLight(0xfff4e6, 0x3a2c22, 0.75));
    var sol = new T.DirectionalLight(0xffffff, 0.95); sol.position.set(-0.6, 0.8, 1); sc.add(sol);
    var rel = new T.DirectionalLight(0xffe2c4, 0.35); rel.position.set(1, 0.2, -0.8); sc.add(rel);
    return sc;
  }
  function renderer(canvas) {
    var r = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.outputEncoding = T.sRGBEncoding;
    r.setClearColor(0x000000, 0);
    return r;
  }
  // cámara en perspectiva donde 1 unidad = 1 px en el plano z = 0
  function camara(fov) { return new T.PerspectiveCamera(fov, 1, 1, 20000); }
  function encuadrar(cam, w, h) {
    cam.aspect = w / h;
    cam.position.set(0, 0, (h / 2) / Math.tan((cam.fov * Math.PI) / 360));
    cam.near = cam.position.z / 20; cam.far = cam.position.z * 4;
    cam.updateProjectionMatrix();
  }

  /* ---------- riel ---------- */
  function riel(canvas, piezas) {
    var r;
    try { r = renderer(canvas); } catch (e) { return null; }
    var sc = escena(), cam = camara(26), w = 1, h = 1, pedido = false, cargadas = 0, alTodo = null;
    var items = piezas.map(function (pz) {
      var it = armarPieza(pz, function () { cargadas++; pedir(); if (cargadas === piezas.length && alTodo) alTodo(); });
      sc.add(it.grupo); return it;
    });
    function pedir() { if (pedido) return; pedido = true; requestAnimationFrame(function () { pedido = false; try { r.render(sc, cam); } catch (e) {} }); }
    return {
      listo: function (f) { alTodo = f; if (cargadas === piezas.length) f(); },
      tam: function (ancho, alto) { w = ancho; h = alto; r.setSize(ancho, alto, false); encuadrar(cam, ancho, alto); pedir(); },
      poner: function (i, xpx, ypx, anchoPx, giroDeg, meceDeg) {
        var it = items[i];
        it.grupo.position.set(xpx - w / 2, h / 2 - ypx, 0);
        it.grupo.scale.setScalar(anchoPx);
        it.grupo.rotation.z = (-meceDeg * Math.PI) / 180;
        it.giro.rotation.y = (giroDeg * Math.PI) / 180;
        pedir();
      },
      ocultar: function (i, si) { items[i].grupo.visible = !si; pedir(); },
      render: pedir
    };
  }

  /* ---------- pieza descolgada ---------- */
  function detalle(canvas) {
    var r;
    try { r = renderer(canvas); } catch (e) { return null; }
    var sc = escena(), cam = camara(30), actual = null, w = 1, h = 1, pedido = false, cache = {};
    function pedir() { if (pedido) return; pedido = true; requestAnimationFrame(function () { pedido = false; try { r.render(sc, cam); } catch (e) {} }); }
    function ubicar() {
      if (!actual) return;
      var fig = w / 1.5;                       // el lienzo es 1,5 veces el ancho de la figura
      var ancho = actual.collar ? fig * 0.76 : fig;
      actual.it.grupo.scale.setScalar(ancho);
      actual.it.grupo.position.set(0, h / 2 - h * 0.012, 0);
    }
    return {
      mostrar: function (pz) {
        if (actual) sc.remove(actual.it.grupo);
        var c = cache[pz.img] || (cache[pz.img] = { it: armarPieza(pz, pedir), collar: pz.collar });
        actual = c; sc.add(c.it.grupo); ubicar(); pedir();
      },
      tam: function (ancho, alto) { w = ancho; h = alto; r.setSize(ancho, alto, false); encuadrar(cam, ancho, alto); ubicar(); pedir(); },
      girar: function (deg, mece) {
        if (!actual) return;
        actual.it.giro.rotation.y = (deg * Math.PI) / 180;
        actual.it.grupo.rotation.z = ((mece || 0) * Math.PI) / 180;
        pedir();
      }
    };
  }

  window.Perchero3D = { riel: riel, detalle: detalle };
})();
