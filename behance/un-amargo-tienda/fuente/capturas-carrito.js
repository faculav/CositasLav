const { chromium, devices } = require('playwright');
const kill = () => { const css = () => { if (!document.getElementById('nohide')) { const st = document.createElement('style'); st.id = 'nohide'; st.textContent = 'dialog.aviso{display:none!important}'; (document.head || document.documentElement).appendChild(st); } }; document.addEventListener('DOMContentLoaded', css); setInterval(() => { css(); document.querySelectorAll('dialog.aviso[open]').forEach(x => { try { x.close(); } catch (e) {} }); }, 300); };
async function run(p, tag) {
  await p.addInitScript(kill);
  await p.goto('https://test.unamargo.com', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(1500);
  for (let y = 0; y < 5000; y += 500) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(100); }
  const names = ['Mate Camionero (Pulido)', 'Bombillón Pico Loro Dorado', 'Yerbero Un Amargo'];
  for (const n of names) {
    const ok = await p.evaluate(n => { const b = document.querySelector(`button[aria-label="Agregar ${n} al pedido"]`); if (b) { b.click(); return true; } return false; }, n);
    console.log(tag, n, ok); await p.waitForTimeout(900);
    await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
  await p.evaluate(() => { const b = [...document.querySelectorAll('header button, header a')].find(e => /Pedido/.test(e.textContent) || /pedido/i.test(e.getAttribute('aria-label') || '')); b && b.click(); });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `shots/${tag}_cart.png` });
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(e => /Continuar/.test(e.textContent)); b && b.click(); });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `shots/${tag}_checkout.png` });
  // elegir el primer barrio/opción si hay selects o radios
  await p.evaluate(() => { const sel = document.querySelector('[role=dialog] select, aside select, dialog select'); if (sel && sel.options.length > 1) { sel.selectedIndex = 1; sel.dispatchEvent(new Event('change', { bubbles: true })); } const r = [...document.querySelectorAll('input[type=radio]')]; r[0] && r[0].click(); });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `shots/${tag}_checkout2.png` });
  console.log(tag, await p.evaluate(() => [...document.querySelectorAll('aside, dialog[open], [role=dialog]')].map(e => e.innerText.slice(0, 400)).join(' ### ')));
}
(async () => {
  const b = await chromium.launch();
  await run(await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }), 'd');
  const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 } });
  await run(await ctx.newPage(), 'm');
  await b.close();
})();
