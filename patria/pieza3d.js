/* =========================================================
   TIRRA — brazalete en 3D (three.js)
   Un brazalete abierto con la textura real de cada pieza
   (Origen, Brava, Sombra). Se gira arrastrando con el mouse
   o el dedo; si WebGL no anda, queda la foto de respaldo.
   three.js r128 (script clásico): funciona también abriendo
   el archivo directo desde la compu.
   ========================================================= */
(function () {
"use strict";
const escena = document.getElementById("piezaEscena");
const canvas = document.getElementById("piezaCanvas");

if (escena && canvas) {
  if (window.THREE && window.TIRRA_TEX) { try { iniciar(); } catch (e) { console.warn("Pieza 3D no disponible:", e); } }
}

// "cuarto" luminoso para los reflejos del metal (reemplaza RoomEnvironment)
function cuarto() {
  const s = new THREE.Scene();
  const caja = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x8a8178, side: THREE.BackSide }));
  s.add(caja);
  [[0, 4.9, 0, 6, 6, 3.2], [4.9, 1, 1, 3, 4, 2.2], [-4.9, 2, -1, 2, 3, 1.4], [0, 1, 4.9, 4, 2, 1.6]].forEach(([x, y, z, w, h, k]) => {
    const luz = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k * 0.96, k * 0.9), side: THREE.DoubleSide }));
    luz.position.set(x, y, z); luz.lookAt(0, 0, 0); s.add(luz);
  });
  return s;
}

function iniciar() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(cuarto(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 1.35, 5.2);
  camera.lookAt(0, -0.05, 0);

  // luces: principal cálida + contraluz
  const key = new THREE.DirectionalLight(0xfff1e0, 1.6); key.position.set(3, 4, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xd9b48c, 0.9); rim.position.set(-4, 2, -3); scene.add(rim);

  // sombra de contacto falsa (degradé radial en el piso)
  const sombraCanvas = document.createElement("canvas"); sombraCanvas.width = sombraCanvas.height = 256;
  const sc = sombraCanvas.getContext("2d");
  const grad = sc.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, "rgba(40,28,18,0.45)"); grad.addColorStop(1, "rgba(40,28,18,0)");
  sc.fillStyle = grad; sc.fillRect(0, 0, 256, 256);
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sombraCanvas), transparent: true, depthWrite: false }));
  piso.rotation.x = -Math.PI / 2; piso.position.y = -0.72; scene.add(piso);

  // ---- el brazalete ----
  const R = 1, ESP = 0.05, ALTO = 1.15, ABERTURA = 0.16;          // radio, espesor, alto, % abierto
  const ARCO = Math.PI * 2 * (1 - ABERTURA), INICIO = Math.PI / 2 + (Math.PI * 2 * ABERTURA) / 2;
  const grupo = new THREE.Group(); scene.add(grupo);

  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  function tex(url) {
    const t = loader.load(url);
    t.encoding = THREE.sRGBEncoding; t.wrapS = THREE.RepeatWrapping; t.anisotropy = maxAniso;
    t.repeat.set(1, 1);
    return t;
  }
  const T = window.TIRRA_TEX || {};
  const TEX = {
    origen: { map: tex(T.origen), rough: 0.92, borde: 0x1d1714, tachas: "origen" },
    brava:  { map: tex(T.brava),  rough: 0.9,  borde: 0x161211, tachas: "ninguna" },
    sombra: { map: tex(T.sombra), rough: 0.32, borde: 0x0e0c0b, tachas: "fila" }
  };

  const matExt = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0 });
  const matInt = new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 1, side: THREE.BackSide });
  const matBorde = new THREE.MeshStandardMaterial({ color: 0x1d1714, roughness: 0.7 });
  const matMetal = new THREE.MeshStandardMaterial({ color: 0xd8d4cc, metalness: 1, roughness: 0.22 });

  const ext = new THREE.Mesh(new THREE.CylinderGeometry(R, R, ALTO, 180, 1, true, INICIO, ARCO), matExt);
  const int = new THREE.Mesh(new THREE.CylinderGeometry(R - ESP, R - ESP, ALTO, 180, 1, true, INICIO, ARCO), matInt);
  grupo.add(ext, int);

  // bordes de arriba y abajo
  [ALTO / 2, -ALTO / 2].forEach((y) => {
    const anillo = new THREE.Mesh(new THREE.RingGeometry(R - ESP, R, 180, 1, INICIO - Math.PI / 2, ARCO), matBorde);
    anillo.rotation.x = y > 0 ? -Math.PI / 2 : Math.PI / 2;
    if (y < 0) anillo.rotation.z = Math.PI;               // mismo arco visto desde abajo
    anillo.position.y = y; grupo.add(anillo);
  });
  // tapas de la abertura
  [INICIO, INICIO + ARCO].forEach((ang) => {
    const tapa = new THREE.Mesh(new THREE.PlaneGeometry(ESP, ALTO), matBorde);
    tapa.material.side = THREE.DoubleSide;
    tapa.position.set(Math.sin(ang) * (R - ESP / 2), 0, Math.cos(ang) * (R - ESP / 2));
    tapa.rotation.y = ang + Math.PI / 2; grupo.add(tapa);
  });

  // tachas metálicas
  const tachas = new THREE.Group(); grupo.add(tachas);
  const geoTacha = new THREE.SphereGeometry(0.075, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  function ponerTachas(tipo) {
    tachas.clear();
    const lugares = [];
    if (tipo === "origen") {                                   // dos broches cerca de la abertura
      const ang = INICIO + 0.22;
      lugares.push([ang, 0.22, 1.25], [ang, -0.22, 1.25]);
    } else if (tipo === "fila") {                              // fila de tachas al medio
      for (let i = 0; i < 7; i++) lugares.push([INICIO + 0.35 + i * (ARCO - 0.7) / 6, 0, 1]);
    }
    lugares.forEach(([ang, y, esc]) => {
      const t = new THREE.Mesh(geoTacha, matMetal);
      t.scale.set(esc, esc * 0.55, esc);
      t.position.set(Math.sin(ang) * R, y, Math.cos(ang) * R);
      t.lookAt(Math.sin(ang) * 3, y, Math.cos(ang) * 3);
      t.rotateX(Math.PI / 2);
      tachas.add(t);
    });
  }

  function usar(nombre) {
    const t = TEX[nombre] || TEX.origen;
    matExt.map = t.map; matExt.roughness = t.rough; matExt.needsUpdate = true;
    matBorde.color.setHex(t.borde);
    ponerTachas(t.tachas);
  }
  usar("origen");

  // ---- interacción: arrastrar para girar, con inercia ----
  let rotY = -0.5, rotX = 0.12, velY = 0.004, arrastrando = false, ultX = 0, ultY = 0, giroExtra = 0;
  const empezar = (x, y) => { arrastrando = true; ultX = x; ultY = y; };
  const mover = (x, y) => {
    if (!arrastrando) return;
    const dx = x - ultX, dy = y - ultY; ultX = x; ultY = y;
    velY = dx * 0.008; rotX = Math.max(-0.35, Math.min(0.55, rotX + dy * 0.004));
  };
  const soltar = () => { arrastrando = false; };
  escena.addEventListener("pointerdown", (e) => { empezar(e.clientX, e.clientY); escena.setPointerCapture(e.pointerId); });
  escena.addEventListener("pointermove", (e) => mover(e.clientX, e.clientY));
  escena.addEventListener("pointerup", soltar);
  escena.addEventListener("pointercancel", soltar);

  window.addEventListener("tirra:textura", (e) => { usar(e.detail); giroExtra = Math.PI * 2; });

  // ---- tamaño y dibujo ----
  function ajustar() {
    const w = escena.clientWidth, h = escena.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(ajustar).observe(escena); ajustar();

  let visible = true;
  new IntersectionObserver((ents) => { visible = ents[0].isIntersecting; }, { threshold: 0 }).observe(escena);

  const reloj = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const t = reloj.getElapsedTime();
    if (!arrastrando) velY += (0.004 - velY) * 0.02;          // vuelve al giro lento
    const extra = giroExtra * 0.08; giroExtra -= extra;
    rotY += velY + extra;
    grupo.rotation.set(rotX, rotY, 0);
    grupo.position.y = Math.sin(t * 1.2) * 0.05;
    piso.material.opacity = 0.85 - Math.sin(t * 1.2) * 0.12;
    renderer.render(scene, camera);
  });

  escena.classList.add("is-3d");
}
})();
