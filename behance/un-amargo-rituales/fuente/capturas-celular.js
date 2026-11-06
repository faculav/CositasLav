const { chromium, devices } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  fs.mkdirSync(path.join(__dirname, 'stills'), { recursive: true });
  const jobs = [
    ['cebar','mob'],['curar','mob'],['curar','mob','algarrobo'],
  ];
  for (const [name, mode, extra] of jobs) {
    const ctx = await b.newContext(mode === 'mob' ? { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    await p.goto('file://' + path.join(__dirname, name + '.html'), { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    await p.waitForTimeout(3000);
    if (extra) { await p.evaluate(() => [...document.querySelectorAll('.mate-pick button')].find(x => /algarrobo/i.test(x.textContent))?.click()); await p.waitForTimeout(1500); }
    const n = await p.evaluate(() => document.querySelectorAll('.steps section').length);
    for (let i = 0; i < n; i++) {
      await p.evaluate(i => { const s = document.querySelectorAll('.steps section'); window.scrollTo(0, s[i].offsetTop); }, i);
      await p.waitForTimeout(3200);
      await p.screenshot({ path: path.join(__dirname, 'stills', `${name}_${mode}${extra ? '_' + extra : ''}_${i}.png`) });
    }
    await ctx.close();
    console.log(name, mode, extra || '', n);
  }
  await b.close();
})();
