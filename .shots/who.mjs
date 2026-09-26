import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5188/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2200);
// what element is actually painted at the bright right edge?
for (const y of [200, 400, 600, 800]) {
  const info = await p.evaluate(([x,y]) => {
    const el = document.elementFromPoint(x,y);
    const chain=[]; let n=el;
    while(n && chain.length<5){ chain.push(n.className?.toString?.().slice(0,30)||n.tagName); n=n.parentElement; }
    return chain;
  }, [1437, y]);
  console.log(y, '->', info.join(' < '));
}
console.log('--- veil/wall computed ---');
console.log(await p.evaluate(() => {
  const w=document.querySelector('.wall'), v=document.querySelector('.wall__veil');
  return JSON.stringify({
    wallOverflow:getComputedStyle(w).overflow,
    wallRect:w.getBoundingClientRect().toJSON(),
    veilRect:v.getBoundingClientRect().toJSON(),
    veilZ:getComputedStyle(v).zIndex,
    planeRect:document.querySelector('.wall__plane').getBoundingClientRect().toJSON(),
  },null,1);
}));
await b.close();
