import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);

// Real wheel input through the browser's own input pipeline, with gaps
// between gestures the way a person scrolls.
await p.evaluate(() => { window.__f=[]; let last=performance.now();
  const tick=(n)=>{window.__f.push(n-last);last=n;requestAnimationFrame(tick);};
  requestAnimationFrame(tick); });

await p.mouse.move(700, 450);
for (let i = 0; i < 6; i++) {
  await p.mouse.wheel(0, 260);
  await p.waitForTimeout(220);
}
const t = await p.evaluate(() => window.__f);
const s = t.slice(5).sort((a,b)=>a-b);
const pct = q => s[Math.floor(s.length*q)].toFixed(1);
console.log(`real wheel   median ${pct(0.5)}ms  p95 ${pct(0.95)}ms  worst ${s[s.length-1].toFixed(1)}ms  >20ms: ${s.filter(v=>v>20).length}/${s.length}`);
console.log('held attr toggled:', await p.evaluate(()=>document.querySelector('.wall').hasAttribute('data-held')));
await b.close();
