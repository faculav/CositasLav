const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 400, height: 400 } });
  await p.goto('http://127.0.0.1:8765/caja.html?w=1080&h=1080');
  await p.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
  const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
  const frames = [];
  const N = 180; // vuelta completa (6 s a 30 fps)
  for (let i = 0; i < N; i++) frames.push({ az: 35 + 360 * ease(i / N), el: 15, lidUp: 0, ty: 1.15, dist: 9.2 });
  for (let i = 0; i < 20; i++) frames.push({ az: 35, el: 15, lidUp: 0, ty: 1.15, dist: 9.2 });
  for (let i = 0; i < 45; i++) frames.push({ az: 35, el: 15, lidUp: 0.8 * ease(i / 44), ty: 1.15 + 0.25 * ease(i / 44), dist: 9.2 + 0.6 * ease(i / 44) });
  for (let i = 0; i < 30; i++) frames.push({ az: 35, el: 15, lidUp: 0.8, ty: 1.4, dist: 9.8 });
  for (let i = 0; i < 45; i++) { const k = ease(i / 44); frames.push({ az: 35, el: 15, lidUp: 0.8 * (1 - k), ty: 1.4 - 0.25 * k, dist: 9.8 - 0.6 * k }); }
  for (let i = 0; i < 20; i++) frames.push({ az: 35, el: 15, lidUp: 0, ty: 1.15, dist: 9.2 });
  for (let i = 0; i < frames.length; i++) {
    const url = await p.evaluate(o => window.setView(o), frames[i]);
    fs.writeFileSync(`frames/${String(i).padStart(4, '0')}.png`, Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log('frames', frames.length);
  await b.close();
})();
