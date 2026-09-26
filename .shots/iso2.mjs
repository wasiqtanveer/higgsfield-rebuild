import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
async function run(label, setup) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  if (setup) await p.evaluate(setup);
  await p.waitForTimeout(400);
  const t = await p.evaluate(() => new Promise((res) => {
    const a=[]; let last=performance.now(); let y=0;
    const tick=(n)=>{a.push(n-last);last=n;y+=9;window.scrollTo(0,y);
      if(a.length<180)requestAnimationFrame(tick);else res(a);};
    requestAnimationFrame(tick);
  }));
  const s=t.slice(5).sort((x,y)=>x-y);
  console.log(`${label.padEnd(30)} p95 ${s[Math.floor(s.length*0.95)].toFixed(1)}ms  >20ms: ${s.filter(v=>v>20).length}/${s.length}`);
  await p.close();
}
await run('baseline', null);
// kill framer scroll transforms by freezing inline styles
await run('hero parallax frozen', () => {
  ['.hero-content','.hero-stage','.hero-mark'].forEach(s=>{
    const n=document.querySelector(s); if(n){n.style.transform='none';n.style.opacity='1';}
  });
});
await run('wall display:none', () => { document.querySelector('.wall').style.display='none'; });
await run('both off', () => {
  document.querySelector('.wall').style.display='none';
  ['.hero-content','.hero-stage','.hero-mark'].forEach(s=>{
    const n=document.querySelector(s); if(n){n.style.transform='none';n.style.opacity='1';}});
});
await run('backdrop-filters off', () => {
  document.querySelectorAll('*').forEach(n=>{ if(getComputedStyle(n).backdropFilter!=='none') n.style.backdropFilter='none'; });
});
await b.close();
