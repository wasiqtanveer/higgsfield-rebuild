import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

mkdirSync('.impeccable/review', { recursive: true });
const URL = 'http://localhost:5191/about';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });

const measure = () => {
  const r = n => n ? (({top,left,width,height}) => ({t:Math.round(top),l:Math.round(left),w:Math.round(width),h:Math.round(height)}))(n.getBoundingClientRect()) : null;
  const cs = (sel, props) => {
    const n = document.querySelector(sel); if (!n) return null;
    const c = getComputedStyle(n); const o = {};
    for (const p of props) o[p] = c[p];
    return o;
  };
  const out = {
    vw: innerWidth, vh: innerHeight,
    docW: document.documentElement.scrollWidth,
    docH: document.documentElement.scrollHeight,
    title: r(document.querySelector('.abt__title')),
    lede: r(document.querySelector('.abt__lede')),
    node: r(document.querySelector('.abt__node')),
    line: r(document.querySelector('.abt__node-line')),
    body: r(document.querySelector('.abt__node-body')),
    cost: r(document.querySelector('.abt__cost')),
    childCount: document.querySelectorAll('.abt__child').length,
    children: [...document.querySelectorAll('.abt__child')].map(r),
    spineRows: document.querySelectorAll('.abt__spine-row').length,
    depth: document.querySelector('.abt__depth-num')?.textContent,
    insTokens: document.querySelectorAll('.abt__tok--ins').length,
    delTokens: document.querySelectorAll('.abt__tok--del').length,
    insResolved: document.querySelectorAll('.abt__tok--ins.is-resolved').length,
    type: {
      title: cs('.abt__title', ['fontSize','fontFamily','letterSpacing','lineHeight']),
      line: cs('.abt__node-line', ['fontSize','fontFamily','color']),
      body: cs('.abt__node-body', ['fontSize','color']),
      cost: cs('.abt__cost', ['color']),
      childLine: cs('.abt__child-line', ['fontSize','color']),
      spineLine: cs('.abt__spine-line', ['color','display']),
    },
  };
  out.overflow = [...document.querySelectorAll('.abt *')].filter(n => {
    const x = n.getBoundingClientRect();
    return x.width > 0 && (x.left < -2 || x.right > innerWidth + 2);
  }).map(n => n.className?.toString?.().slice(0,44)).slice(0,10);
  return out;
};

async function run(name, viewport, opts = {}) {
  const p = await b.newPage({ viewport, deviceScaleFactor: 2, ...opts });
  await p.goto(URL, { waitUntil: 'networkidle' });
  // Settle entrance motion: the auto-resolve fires at 900ms, children at ~1.1s.
  await p.waitForTimeout(3000);
  await p.screenshot({ path: `.impeccable/review/${name}.png`, fullPage: true });
  console.log(name.toUpperCase(), JSON.stringify(await p.evaluate(measure), null, 1));
  return p;
}

const d = await run('desktop', { width: 1440, height: 900 });

// Deep state: walk to a terminus so the action and the spine are captured too.
await d.click('.abt__child');
await d.waitForTimeout(1400);
await d.click('.abt__child');
await d.waitForTimeout(1600);
await d.screenshot({ path: '.impeccable/review/desktop-deep.png', fullPage: true });
console.log('DEEP', JSON.stringify(await d.evaluate(measure), null, 1));

await run('mobile', { width: 390, height: 844 }, { isMobile: true, hasTouch: true });
await run('user-1280', { width: 1280, height: 800 });

await b.close();
