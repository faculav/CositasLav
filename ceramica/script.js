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
document.getElementById('c-wa').href = waLink('¡Hola! Te escribo desde la web.');
document.getElementById('c-ig').href = `https://instagram.com/${CONTACTO.instagram}`;
document.getElementById('c-ig').textContent = `@${CONTACTO.instagram}`;
document.getElementById('c-mail').href = `mailto:${CONTACTO.email}`;
document.getElementById('c-mail').textContent = CONTACTO.email;

// Galería
const ESTADOS = { disponible: 'Disponible', vendida: 'Vendida', encargo: 'Por encargo' };
const grid = document.getElementById('galeria-grid');
grid.style.setProperty('--cols', PIEZAS.length === 4 ? 4 : 3);
PIEZAS.forEach((p, i) => {
  const b = document.createElement('button');
  b.className = `pieza reveal${p.estado === 'vendida' ? ' pieza--vendida' : ''}`;
  b.innerHTML = `
    <div class="pieza__img"><img src="${p.foto}" alt="${p.nombre}" loading="lazy"></div>
    <div class="pieza__meta"><span>${p.nombre}</span><span class="pieza__estado">${ESTADOS[p.estado] || ''}</span></div>`;
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
  const cta = ficha.querySelector('#f-cta');
  cta.href = waLink(`¡Hola! Me interesa la pieza "${p.nombre}".`);
  cta.textContent = p.estado === 'vendida' ? 'PEDIR UNA SIMILAR ↗' : 'CONSULTAR POR ESTA PIEZA ↗';
  ficha.showModal();
}
ficha.querySelector('.ficha__close').addEventListener('click', () => ficha.close());
ficha.addEventListener('click', e => { if (e.target === ficha) ficha.close(); });

// Aparición al hacer scroll
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Ajusta el logotipo gigante al ancho disponible (sirve para cualquier nombre)
function fitWordmarks() {
  document.querySelectorAll('.wordmark').forEach(el => {
    el.style.fontSize = '100px';
    const r = document.createRange(); r.selectNodeContents(el);
    const ratio = el.clientWidth / r.getBoundingClientRect().width;
    el.style.fontSize = Math.floor(100 * ratio * 0.98) + 'px';
  });
}
document.fonts.ready.then(fitWordmarks);
addEventListener('resize', fitWordmarks);
