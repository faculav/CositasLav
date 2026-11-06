// Graba la guía en cámara lenta (el tiempo de la página corre a SLOW) y después ffmpeg la acelera:
// así el video final sale fluido aunque el render 3D por software sea lento.
const { chromium, devices } = require('playwright');
const path = require('path');
const [name, mode, extra] = process.argv.slice(2);
const SLOW = 0.15;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const tag = `${name}_${mode}${extra ? '_' + extra : ''}`;
  const size = mode === 'mob' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const base = mode === 'mob' ? { ...devices['iPhone 13'] } : { viewport: size };
  const ctx = await b.newContext({ ...base, recordVideo: { dir: path.join(__dirname, 'rec', tag), size } });
  await ctx.addInitScript((SLOW) => {
    const pn = performance.now.bind(performance), t0 = pn();
    performance.now = () => t0 + (pn() - t0) * SLOW;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf(() => cb(performance.now()));
  }, SLOW);
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: SLOW });
  const t = Date.now();
  await p.goto('file://' + path.join(__dirname, name + '.html'), { waitUntil: 'load' });
  await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await p.waitForTimeout(4000);
  if (extra === 'algarrobo') await p.evaluate(() => [...document.querySelectorAll('.mate-pick button')].find(x => /algarrobo/i.test(x.textContent))?.click());
  const start = (Date.now() - t) / 1000;
  const hold = (ms) => p.waitForTimeout(ms / SLOW);
  await hold(1800);
  const n = await p.evaluate(() => document.querySelectorAll('.steps section').length);
  for (let i = 1; i < n; i++) {
    await p.evaluate(i => { const s = document.querySelectorAll('.steps section'); window.scrollTo(0, s[i].offsetTop); }, i);
    await hold(i === n - 1 ? 3500 : 2800);
  }
  const end = (Date.now() - t) / 1000;
  await ctx.close(); await b.close();
  console.log(JSON.stringify({ tag, start, end, slow: SLOW }));
})();
