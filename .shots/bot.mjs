import { chromium } from 'playwright';
import { PNG } from 'pngjs';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5188/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2200);
const buf = await p.screenshot({ clip: { x: 0, y: 860, width: 1440, height: 40 } });
const png = PNG.sync.read(buf);
for (let y = 0; y < png.height; y += 4) {
  let max = 0, at = 0;
  for (let x = 0; x < png.width; x++) {
    const i = (png.width*y+x)<<2;
    const l = 0.2126*png.data[i]+0.7152*png.data[i+1]+0.0722*png.data[i+2];
    if (l > max) { max = l; at = x; }
  }
  console.log(`y=${860+y}  max lum ${max.toFixed(0).padStart(3)} at x=${at}`);
}
console.log('--- hero bottom / next section ---');
console.log(await p.evaluate(() => {
  const h=document.querySelector('.hero').getBoundingClientRect();
  const n=document.querySelector('.hero').nextElementSibling;
  return JSON.stringify({heroBottom:Math.round(h.bottom), next:n?.className, nextTop:n?Math.round(n.getBoundingClientRect().top):null});
}));
await b.close();
