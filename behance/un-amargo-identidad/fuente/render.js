const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'slides.html'), { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  fs.mkdirSync(path.join(__dirname, 'laminas'), { recursive: true });
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['cover','s01','s02','s03','s05','s06','s07','s08','s09','s10','s11','s12','s13','s14','s15','s16','s17'];
  for (const id of ids) { const el = await p.$('#' + id); await el.screenshot({ path: path.join(__dirname, 'laminas', id + '.png') }); }
  await b.close();
})();
