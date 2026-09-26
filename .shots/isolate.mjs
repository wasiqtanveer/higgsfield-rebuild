import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });

async function run(label, setup) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  if (setup) await p.evaluate(setup);
  await p.waitForTimeout(400);
  const t = await p.evaluate(() => new Promise((res) => {
    const a = []; let last = performance.now(); let y = 0;
    const tick = (now) => { a.push(now-last); last=now; y+=9; window.scrollTo(0,y);
      if (a.length < 180) requestAnimationFrame(tick); else res(a); };
    requestAnimationFrame(tick);
  }));
  const s = t.slice(5).sort((x,y)=>x-y);
  console.log(`${label.padEnd(26)} p95 ${s[Math.floor(s.length*0.95)].toFixed(1)}ms  >20ms: ${s.filter(v=>v>20).length}/${s.length}`);
  await p.close();
}

await run('baseline (all on)', null);
await run('wall hidden', () => { document.querySelector('.wall').style.display='none'; });
await run('wall anim paused', () => { document.querySelectorAll('.wall__track').forEach(n=>n.style.animationPlayState='paused'); });
await run('grade+scrims off', () => { ['.wall__grade','.wall__veil','.wall__vignette'].forEach(s=>{const n=document.querySelector(s); if(n)n.style.display='none';}); });
await run('stamp/orbit spin off', () => { document.querySelectorAll('.hero-orbit__ring,.hero-stamp__svg').forEach(n=>n.style.animation='none'); });
await b.close();
