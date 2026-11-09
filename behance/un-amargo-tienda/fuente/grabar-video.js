const { chromium, devices } = require('playwright');
const path = require('path');
const kill = () => { const css = () => { if (!document.getElementById('nohide')) { const st = document.createElement('style'); st.id = 'nohide'; st.textContent = 'dialog.aviso{display:none!important}'; (document.head || document.documentElement).appendChild(st); } }; document.addEventListener('DOMContentLoaded', css); setInterval(() => { css(); document.querySelectorAll('dialog.aviso[open]').forEach(x => { try { x.close(); } catch (e) {} }); }, 300); };
const which = process.argv[2];
async function smooth(p, to, ms) {
  await p.evaluate(async ([to, ms]) => {
    const from = scrollY, t0 = performance.now();
    await new Promise(r => { const f = (t) => { const k = Math.min(1, (t - t0) / ms); const e = k < .5 ? 2*k*k : 1 - Math.pow(-2*k+2, 2)/2; scrollTo(0, from + (to - from) * e); k < 1 ? requestAnimationFrame(f) : r(); }; requestAnimationFrame(f); });
  }, [to, ms]);
}
(async () => {
  const b = await chromium.launch();
  const mob = which.startsWith('mob');
  const size = mob ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ ...(mob ? devices['iPhone 13'] : {}), viewport: size, recordVideo: { dir: path.join(__dirname, 'rec', which), size } });
  const p = await ctx.newPage();
  await p.addInitScript(kill);
  const t = Date.now();
  await p.goto('https://test.unamargo.com', { waitUntil: 'networkidle', timeout: 60000 });
  // precargar imágenes y volver arriba
  for (let y = 0; y < 15000; y += 700) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(60); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1500);
  const top = id => p.evaluate(id => document.getElementById(id).getBoundingClientRect().top + scrollY, id);
  const start = (Date.now() - t) / 1000;
  if (which === 'envios' || which === 'mob_envios') {
    const y0 = await top('envios'), h = await p.evaluate(() => document.getElementById('envios').offsetHeight);
    await p.evaluate(y => scrollTo(0, y), y0 - 300); await p.waitForTimeout(800);
    await smooth(p, y0, 1200); await p.waitForTimeout(1200);
    const steps = 4;
    for (let i = 1; i <= steps; i++) { await smooth(p, y0 + (h - size.height) * i / steps, 1800); await p.waitForTimeout(1300); }
  } else if (which === 'compra' || which === 'mob_compra') {
    await p.waitForTimeout(1000);
    await smooth(p, await top('tienda'), 1600); await p.waitForTimeout(1200);
    await smooth(p, (await top('tienda')) + (mob ? 700 : 380), 1200); await p.waitForTimeout(800);
    await p.evaluate(() => { const el = [...document.querySelectorAll('#tienda *')].find(e => !e.children.length && e.textContent.trim() === 'Mate Camionero (Pulido)'); (el.closest('button,a,[role=button],article') || el).click(); });
    await p.waitForTimeout(2500);
    const add = p.locator('dialog.ficha').getByRole('button', { name: /agregar|pedido/i }).first();
    if (await add.count()) { await add.click(); } await p.waitForTimeout(1500);
    await p.keyboard.press('Escape'); await p.waitForTimeout(800);
    for (const n of ['Bombillón Pico Loro Dorado', 'Yerbero Un Amargo']) { await p.evaluate(n => document.querySelector(`button[aria-label="Agregar ${n} al pedido"]`)?.click(), n); await p.waitForTimeout(900); await p.keyboard.press('Escape'); await p.waitForTimeout(400); }
    await p.evaluate(() => { const b = [...document.querySelectorAll('header button, header a')].find(e => /Pedido/.test(e.textContent) || /pedido/i.test(e.getAttribute('aria-label') || '')); b && b.click(); });
    await p.waitForTimeout(2200);
    await p.evaluate(() => [...document.querySelectorAll('button')].find(e => /Continuar/.test(e.textContent))?.click()); await p.waitForTimeout(1600);
    await p.evaluate(() => { const sel = document.querySelector('dialog select, aside select, select'); if (sel) { sel.selectedIndex = 3; sel.dispatchEvent(new Event('change', { bubbles: true })); } }); await p.waitForTimeout(1300);
    await p.evaluate(() => [...document.querySelectorAll('button')].find(e => e.textContent.trim() === 'Transferencia bancaria')?.click()); await p.waitForTimeout(2200);
  } else if (which === 'recorrido' || which === 'mob_recorrido') {
    await p.waitForTimeout(1500);
    const H = await p.evaluate(() => document.body.scrollHeight - innerHeight);
    for (const id of ['tienda', 'nosotros', 'personalizados', 'empresas', 'envios', 'guias', 'contacto']) { await smooth(p, await top(id), 1400); await p.waitForTimeout(1100); }
    await smooth(p, H, 1400); await p.waitForTimeout(1200);
  }
  const end = (Date.now() - t) / 1000;
  await ctx.close(); await b.close();
  console.log(JSON.stringify({ which, start, end }));
})();
