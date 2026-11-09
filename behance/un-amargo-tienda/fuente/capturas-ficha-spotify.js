const { chromium } = require('playwright');
const kill = () => { setInterval(() => document.querySelectorAll('dialog.aviso[open]').forEach(x => { try { x.close(); } catch (e) {} }), 200); const st = document.createElement('style'); st.textContent = 'dialog.aviso{display:none!important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st)); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
  await p.addInitScript(kill);
  await p.goto('https://test.unamargo.com', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  for (let y = 0; y < 5000; y += 500) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(80); }
  await p.evaluate(() => { const el = [...document.querySelectorAll('#tienda *')].find(e => !e.children.length && e.textContent.trim() === 'Mate Camionero (Pulido)'); (el.closest('button,a,[role=button],article') || el).click(); });
  await p.waitForTimeout(2000);
  const box = await p.evaluate(() => { const f = document.querySelector('dialog.ficha'); const r = (f.firstElementChild || f).getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
  console.log('ficha box', box);
  const el = await p.$('dialog.ficha'); await el.screenshot({ path: 'shots/ficha_pulido.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  await p.evaluate(() => scrollTo(0, 0));
  await p.evaluate(() => [...document.querySelectorAll('button')].find(e => /playlist/i.test(e.getAttribute('aria-label') || ''))?.click());
  await p.waitForTimeout(6000);
  const fr = await p.$('iframe[src*="spotify"]'); await fr.screenshot({ path: 'shots/spotify_player.png' });
  await p.screenshot({ path: 'shots/d_spotify.png' });
  await b.close();
})();
