import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2200);
// hide candidates one at a time, re-measure right edge brightness
const probe = async (label, sel) => {
  if (sel) await p.evaluate(s => { document.querySelectorAll(s).forEach(n=>n.style.visibility='hidden'); }, sel);
  const buf = await p.screenshot({ clip: { x: 1420, y: 0, width: 20, height: 900 } });
  const { PNG } = await import('pngjs');
  const png = PNG.sync.read(buf);
  let max = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    const l = 0.2126*png.data[i]+0.7152*png.data[i+1]+0.0722*png.data[i+2];
    if (l > max) max = l;
  }
  console.log(`${label.padEnd(26)} right-strip max lum ${max.toFixed(0)}`);
};
await probe('baseline', null);
await probe('after hiding .wall', '.wall');
await probe('after hiding hero::before?', '.hero-content');
await probe('after hiding .hero-mark', '.hero-mark');
await b.close();
