import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
async function run(label, setup) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2200);
  if (setup) await p.evaluate(setup);
  await p.evaluate(() => { window.__f=[]; let last=performance.now();
    const tick=(n)=>{window.__f.push(n-last);last=n;requestAnimationFrame(tick);};
    requestAnimationFrame(tick); });
  await p.mouse.move(700, 450);
  for (let i=0;i<10;i++){ await p.mouse.wheel(0,200); await p.waitForTimeout(90); }
  const t = await p.evaluate(()=>window.__f);
  const s=t.slice(5).sort((a,b)=>a-b);
  console.log(`${label.padEnd(24)} median ${s[Math.floor(s.length*0.5)].toFixed(1)}ms  p95 ${s[Math.floor(s.length*0.95)].toFixed(1)}ms  >20ms: ${s.filter(v=>v>20).length}/${s.length}`);
  await p.close();
}
await run('with idle-pause', null);
await run('pause disabled', () => {
  const st=document.createElement('style');
  st.textContent='.wall[data-held] .wall__track{animation-play-state:running !important}';
  document.head.appendChild(st);
});
await run('wall removed', () => { document.querySelector('.wall').remove(); });
await b.close();
