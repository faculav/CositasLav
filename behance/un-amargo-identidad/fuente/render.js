const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'slides.html'), { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  fs.mkdirSync(path.join(__dirname, 'laminas'), { recursive: true });
  for (const id of ['cover','s01','s02','s04','s05','s13','s14']) { const el = await p.$('#' + id); await el.screenshot({ path: path.join(__dirname, 'laminas', id + '.png') }); }
  await b.close();
})();
