import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2200);
console.log(JSON.stringify(await p.evaluate(() => {
  const r = s => { const n=document.querySelector(s); if(!n) return null;
    const x=n.getBoundingClientRect(); return {t:Math.round(x.top),b:Math.round(x.bottom),h:Math.round(x.height),w:Math.round(x.width)}; };
  return {
    hero: r('.hero'), wall: r('.wall'), plane: r('.wall__plane'), veil: r('.wall__veil'),
    mark: r('.hero-mark'),
    heroOverflow: getComputedStyle(document.querySelector('.hero')).overflow,
    wallPos: getComputedStyle(document.querySelector('.wall')).position,
    veilPos: getComputedStyle(document.querySelector('.wall__veil')).position,
    contain: getComputedStyle(document.querySelector('.wall')).contain,
  };
}), null, 1));
await b.close();
