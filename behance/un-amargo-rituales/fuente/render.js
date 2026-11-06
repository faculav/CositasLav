const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'slides_built.html'), { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  const out = path.join(__dirname, 'laminas'); fs.mkdirSync(out, { recursive: true });
  const ids = ['cover','s01','s02','s03','s04','s05','s06','s07','s08'];
  for (const [i, id] of ids.entries()) {
    const el = await p.$('#' + id);
    const name = id === 'cover' ? '00-portada-808x632.png' : `${String(i).padStart(2,'0')}-${id}.png`;
    await el.screenshot({ path: path.join(out, name) });
  }
  await b.close();
})();
