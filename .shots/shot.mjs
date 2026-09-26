import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });

const measure = () => {
  const r = n => n ? (({top,left,width,height}) => ({t:Math.round(top),l:Math.round(left),w:Math.round(width),h:Math.round(height)}))(n.getBoundingClientRect()) : null;
  const out = {};
  for (const [k, sel] of Object.entries({
    hero: '.hero', title: '.hero-title', stage: '.hero-stage', frame: '.hero-frame',
    mark: '.hero-mark', field: '.hero-field', right: '.hero-right', cta: '.hero-cta',
    term: '.hero-term', scroll: '.hero-scroll',
  })) out[k] = r(document.querySelector(sel));
  out.chips = [...document.querySelectorAll('.hero-chip')].map(c => r(c));
  out.vw = innerWidth; out.vh = innerHeight;
  out.docW = document.documentElement.scrollWidth;
  out.docH = document.documentElement.scrollHeight;
  // anything sticking out horizontally?
  out.overflow = [...document.querySelectorAll('.hero *')].filter(n => {
    const x = n.getBoundingClientRect();
    return x.width > 0 && (x.left < -2 || x.right > innerWidth + 2);
  }).map(n => n.className?.toString?.().slice(0,40)).slice(0,8);
  return out;
};

const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.goto('http://localhost:5188/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2600);
await p.screenshot({ path: '.shots/hero-desktop.png' });
console.log('DESKTOP', JSON.stringify(await p.evaluate(measure), null, 1));

const mp = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await mp.goto('http://localhost:5188/', { waitUntil: 'networkidle' });
await mp.waitForTimeout(2600);
await mp.screenshot({ path: '.shots/hero-mobile.png', fullPage: false });
console.log('MOBILE', JSON.stringify(await mp.evaluate(measure), null, 1));

await b.close();
