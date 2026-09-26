import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
console.log(JSON.stringify(await p.evaluate(() => {
  const w = document.querySelector('.wall');
  const v = document.querySelector('.wall__veil');
  const cs = getComputedStyle(v);
  // who is the containing block?
  return {
    wallH: w.getBoundingClientRect().height,
    wallClientH: w.clientHeight, wallOffsetH: w.offsetHeight,
    veilH: v.getBoundingClientRect().height,
    veilTop: cs.top, veilBottom: cs.bottom, veilHeight: cs.height,
    veilParent: v.parentElement.className,
    heroPadBottom: getComputedStyle(document.querySelector('.hero')).paddingBottom,
    wallInset: [cs.insetBlockStart, cs.insetBlockEnd],
  };
}), null, 1));
await b.close();
