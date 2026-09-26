import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(() => ({
  tiles: document.querySelectorAll('.wall__tile').length,
  imgs: document.querySelectorAll('.wall__tile img').length,
  planeRect: (({width,height})=>({w:Math.round(width),h:Math.round(height)}))(document.querySelector('.wall__plane').getBoundingClientRect()),
  natural: [...document.querySelectorAll('.wall__tile img')].slice(0,3).map(i=>`${i.naturalWidth}x${i.naturalHeight} -> ${Math.round(i.getBoundingClientRect().width)}x${Math.round(i.getBoundingClientRect().height)}`),
})), null, 1));
await b.close();
