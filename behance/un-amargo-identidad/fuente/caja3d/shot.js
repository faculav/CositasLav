const { chromium } = require('playwright');
const fs = require('fs');
const views = JSON.parse(process.argv[2]);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 400, height: 400 } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('console', m.text()); });
  for (const v of views) {
    await p.goto(`http://127.0.0.1:8765/caja.html?w=${v.w||1600}&h=${v.h||1600}&bg=${encodeURIComponent(v.bg||'#efe8d8')}`);
    await p.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
    await p.waitForTimeout(300);
    const url = await p.evaluate(o => window.setView(o), v);
    fs.writeFileSync(v.out, Buffer.from(url.split(',')[1], 'base64'));
    console.log('ok', v.out);
  }
  await b.close();
})();
