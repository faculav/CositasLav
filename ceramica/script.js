// Menú mobile
const nav = document.querySelector('.nav');
const burger = document.querySelector('.nav__burger');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav__links a').forEach(a =>
  a.addEventListener('click', () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

// Contacto
const waLink = (txt) => `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(txt)}`;
document.getElementById('c-wa').href = waLink('¡Hola Lucía! Te escribo desde la web.');
document.getElementById('f-wa').href = waLink('¡Hola Lucía! Te escribo desde la web.');
if (CONTACTO.instagram) {
  document.getElementById('c-ig').innerHTML =
    `<a href="https://instagram.com/${CONTACTO.instagram}" target="_blank" rel="noopener">@${CONTACTO.instagram}</a>`;
}

// Galería
const ESTADOS = { disponible: 'Disponible', vendida: 'Vendida', encargo: 'Por encargo' };
const grid = document.getElementById('galeria-grid');
grid.style.setProperty('--cols', PIEZAS.length === 4 ? 4 : 3);
PIEZAS.forEach((p, i) => {
  const b = document.createElement('button');
  b.className = `pieza reveal${p.estado === 'vendida' ? ' pieza--vendida' : ''}`;
  b.innerHTML = `
    <div class="pieza__img"><img src="${p.foto}" alt="${p.nombre}" loading="lazy"></div>
    <div class="pieza__meta"><span>${p.nombre}</span><span class="pieza__estado">${p.nota ? 'Destacada' : (ESTADOS[p.estado] || '')}</span></div>`;
  b.addEventListener('click', () => abrirFicha(p));
  grid.appendChild(b);
});

// Ficha de pieza
const ficha = document.getElementById('ficha');
function abrirFicha(p) {
  ficha.querySelector('#f-img').src = p.foto;
  ficha.querySelector('#f-img').alt = p.nombre;
  ficha.querySelector('#f-nombre').textContent = p.nombre;
  ficha.querySelector('#f-estado').textContent = ESTADOS[p.estado] || '';
  ficha.querySelector('#f-material').textContent = p.material;
  ficha.querySelector('#f-medidas').textContent = p.medidas;
  ficha.querySelector('#f-precio').textContent = p.precio;
  ficha.querySelector('#f-nota').textContent = p.nota || '';
  const cta = ficha.querySelector('#f-cta');
  cta.href = waLink(`¡Hola! Me interesa la pieza "${p.nombre}".`);
  cta.textContent = p.estado === 'vendida' ? 'PEDIR UNA SIMILAR ↗' : 'CONSULTAR POR ESTA PIEZA ↗';
  ficha.showModal();
}
ficha.querySelector('.ficha__close').addEventListener('click', () => ficha.close());
ficha.addEventListener('click', e => { if (e.target === ficha) ficha.close(); });

// Botón flotante de pedido: aparece después de la portada
const fab = document.getElementById('fab');
fab.href = waLink('¡Hola Lucía! Quiero hacer un pedido.');

// Transiciones al hacer scroll
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ANIMADOS = [
  '.section .label', '.section .title', '.split__img', '.split__text',
  '.artista__img', '.big-name', '.artista__text > p, .artista__text > a',
  '.valores__list > div', '.valores__fig', '.galeria__head', '.pieza',
  '.bloque__img', '.bloque__top > div', '.bloque__quote', '.bloque__claim',
  '.contacto__title', '.contacto__cols > div', '.footer__top > *', '.footer__logo'
].join(',');

if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.remove('pending');
    io.unobserve(e.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  const grupos = new Map();
  document.querySelectorAll(ANIMADOS).forEach(el => {
    el.dataset.anim = /^(IMG|FIGURE)$/.test(el.tagName) ? 'img' : 'up';
    // escalonado entre hermanos animados
    const n = grupos.get(el.parentElement) || 0;
    grupos.set(el.parentElement, n + 1);
    el.style.setProperty('--d', Math.min(n * 0.09, 0.45) + 's');
    // solo se ocultan los que están más abajo de la primera pantalla
    if (el.getBoundingClientRect().top > innerHeight * 0.92) {
      el.classList.add('pending');
      io.observe(el);
    }
  });
}

// Parallax suave, barra con borde al bajar y botón flotante
const parallax = reduceMotion ? [] : [...document.querySelectorAll('.hero__img, .valores__fig, .bloque__img')];
let ticking = false;
function onScroll() {
  const y = scrollY;
  nav.classList.toggle('nav--scrolled', y > 8);
  fab.classList.toggle('fab--on', y > innerHeight * 0.6);
  parallax.forEach(el => {
    const r = el.getBoundingClientRect();
    const centro = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    el.style.translate = `0 ${(centro * -28).toFixed(1)}px`;
  });
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();
