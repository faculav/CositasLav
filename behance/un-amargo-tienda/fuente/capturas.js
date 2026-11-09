const { chromium, devices } = require('playwright');
const fs = require('fs');
(async () => {
  fs.mkdirSync('shots', { recursive: true });
  const b = await chromium.launch();
  // DESKTOP
  const d = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await d.addInitScript((() => { const css = () => { if (!document.getElementById('nohide')) { const st = document.createElement('style'); st.id = 'nohide'; st.textContent = 'dialog.aviso{display:none!important}'; (document.head || document.documentElement).appendChild(st); } }; document.addEventListener('DOMContentLoaded', css); setInterval(() => { css(); document.querySelectorAll('dialog.aviso[open]').forEach(x => { try { x.close(); } catch (e) {} }); }, 300); }));
  await d.goto('https://test.unamargo.com', { waitUntil: 'networkidle', timeout: 60000 });
  await d.waitForTimeout(1500);
  await d.addStyleTag({ content: 'dialog.aviso{display:none!important}' }); await d.evaluate(() => document.querySelectorAll('dialog.aviso').forEach(x => { try { x.close(); } catch (e) {} }));
  // forzar carga de imágenes lazy
  for (let y = 0; y < 14000; y += 600) { await d.evaluate(y => scrollTo(0, y), y); await d.waitForTimeout(120); }
  await d.waitForTimeout(1500);
  const tops = await d.evaluate(() => { const o = {}; for (const id of ['top','tienda','nosotros','personalizados','empresas','envios','guias','preguntas','contacto']) { const e = document.getElementById(id); if (e) o[id] = e.getBoundingClientRect().top + scrollY; } o.strip = o.top + innerHeight; o.footer = document.body.scrollHeight - innerHeight; return o; });
  const extra = { tienda2: tops.tienda + 700, tienda3: tops.tienda + 1600, envios2: tops.envios + 900, envios3: tops.envios + 1800, envios4: tops.envios + 2400, strip: tops.top + 700 };
  const all = { ...tops, ...extra };
  for (const [k, y] of Object.entries(all)) { if (fs.existsSync(`shots/d_${k}.png`)) continue; await d.evaluate(y => scrollTo(0, y), y); await d.waitForTimeout(1300); await d.screenshot({ path: `shots/d_${k}.png` }); }
  // ficha de producto
  await d.evaluate(y => scrollTo(0, y), tops.tienda + 300); await d.waitForTimeout(800);
  await d.evaluate(() => { const el = [...document.querySelectorAll('#tienda *')].find(e => !e.children.length && e.textContent.replace(/\s+/g,' ').trim() === 'Imperial Zebra'); (el.closest('button,a,[role=button],article') || el).click(); }); await d.waitForTimeout(1500);
  await d.screenshot({ path: 'shots/d_modal.png' });
  await d.evaluate(() => { const f = document.querySelector('dialog.ficha'); if (f) f.scrollTop = 0; });
  const addBtn = d.locator('dialog.ficha').getByRole('button', { name: /agregar|sumar|añadir|pedido/i }).first();
  if (await addBtn.count()) { await addBtn.click(); await d.waitForTimeout(1500); }
  await d.screenshot({ path: 'shots/d_added.png' });
  await d.keyboard.press('Escape'); await d.waitForTimeout(800);
  await d.evaluate(() => { const b = [...document.querySelectorAll('header button, header a, nav button')].find(e => /Pedido/.test(e.textContent) || /pedido/i.test(e.getAttribute('aria-label')||'')); b && b.click(); });
  await d.waitForTimeout(1500);
  await d.screenshot({ path: 'shots/d_cart.png' });
  console.log('desk ok', JSON.stringify(Object.keys(all)));
  // MOBILE
  const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 } });
  const m = await ctx.newPage();
  await m.addInitScript((() => { const css = () => { if (!document.getElementById('nohide')) { const st = document.createElement('style'); st.id = 'nohide'; st.textContent = 'dialog.aviso{display:none!important}'; (document.head || document.documentElement).appendChild(st); } }; document.addEventListener('DOMContentLoaded', css); setInterval(() => { css(); document.querySelectorAll('dialog.aviso[open]').forEach(x => { try { x.close(); } catch (e) {} }); }, 300); }));
  await m.goto('https://test.unamargo.com', { waitUntil: 'networkidle', timeout: 60000 });
  await m.waitForTimeout(1500);
  await m.addStyleTag({ content: 'dialog.aviso{display:none!important}' }); await m.evaluate(() => document.querySelectorAll('dialog.aviso').forEach(x => { try { x.close(); } catch (e) {} }));
  for (let y = 0; y < 22000; y += 500) { await m.evaluate(y => scrollTo(0, y), y); await m.waitForTimeout(100); }
  await m.waitForTimeout(1500);
  const mt = await m.evaluate(() => { const o = {}; for (const id of ['top','tienda','personalizados','envios','guias']) { const e = document.getElementById(id); if (e) o[id] = e.getBoundingClientRect().top + scrollY; } return o; });
  mt.tienda2 = mt.tienda + 500;
  for (const [k, y] of Object.entries(mt)) { await m.evaluate(y => scrollTo(0, y), y); await m.waitForTimeout(1300); await m.screenshot({ path: `shots/m_${k}.png` }); }
  await m.evaluate(y => scrollTo(0, y), mt.tienda + 400); await m.waitForTimeout(800);
  await m.evaluate(() => { const el = [...document.querySelectorAll('#tienda *')].find(e => !e.children.length && e.textContent.replace(/\s+/g,' ').trim() === 'Imperial Zebra'); (el.closest('button,a,[role=button],article') || el).click(); }); await m.waitForTimeout(1500);
  await m.screenshot({ path: 'shots/m_modal.png' });
  await m.evaluate(() => { const f = document.querySelector('dialog.ficha'); if (f) f.scrollTop = 0; });
  const addM = m.locator('dialog.ficha').getByRole('button', { name: /agregar|sumar|añadir|pedido/i }).first();
  if (await addM.count()) { await addM.click(); await m.waitForTimeout(1500); }
  await m.screenshot({ path: 'shots/m_added.png' });
  await m.keyboard.press('Escape'); await m.waitForTimeout(800);
  await m.evaluate(() => { const b = [...document.querySelectorAll('header button, header a, nav button')].find(e => /Pedido/.test(e.textContent) || /pedido/i.test(e.getAttribute('aria-label')||'')); b && b.click(); });
  await m.waitForTimeout(1500);
  await m.screenshot({ path: 'shots/m_cart.png' });
  await b.close();
  console.log('mob ok');
})().catch(e => { console.error(e.message); process.exit(1); });
