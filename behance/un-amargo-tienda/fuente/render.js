const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'slides_built.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  console.log('font ok:', await p.evaluate(() => document.fonts.check('700 40px Geist')));
  const out = path.join(__dirname, 'laminas'); fs.mkdirSync(out, { recursive: true });
  const ids = ['cover','s01','s02','s04','s06','s07','s08','s09','s10','s11'];
  for (const id of ids) { const el = await p.$('#' + id); await el.screenshot({ path: path.join(out, id + '.png') }); }
  await b.close();
})();
