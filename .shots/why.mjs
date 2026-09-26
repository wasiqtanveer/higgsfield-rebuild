import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5188/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
console.log(await p.evaluate(() => {
  const v = document.querySelector('.wall__veil');
  const cs = getComputedStyle(v);
  const w = document.querySelector('.wall');
  const wcs = getComputedStyle(w);
  return JSON.stringify({
    veil: { pos: cs.position, top: cs.top, right: cs.right, bottom: cs.bottom, left: cs.left, width: cs.width, boxSizing: cs.boxSizing },
    wall: { pos: wcs.position, overflow: wcs.overflow, contain: wcs.contain, transform: wcs.transform, width: wcs.width, filter: wcs.filter },
    // which rules matched?
    matched: [...document.styleSheets].flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
      .filter(r => r.selectorText && /wall__veil|\.wall\b/.test(r.selectorText))
      .map(r => r.selectorText + ' {' + r.style.cssText.slice(0,120) + '}'),
  }, null, 1);
}));
await b.close();
