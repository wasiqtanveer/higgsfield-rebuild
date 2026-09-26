import { chromium } from 'playwright';

const PORT = process.env.PORT || 5188;
const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});

const measure = () => {
  const r = (n) =>
    n
      ? (({ top, left, width, height }) => ({
          t: Math.round(top), l: Math.round(left),
          w: Math.round(width), h: Math.round(height),
        }))(n.getBoundingClientRect())
      : null;
  const out = {};
  for (const [k, sel] of Object.entries({
    head: '.cmp__head', grid: '.cmp__grid', compose: '.cmp__compose',
    result: '.cmp__result', input: '.cmp__input', run: '.cmp__run',
    lineage: '.cmp__lineage', controls: '.cmp__controls', empty: '.cmp__empty',
  })) out[k] = r(document.querySelector(sel));
  out.vw = innerWidth;
  out.docW = document.documentElement.scrollWidth;
  out.docH = document.documentElement.scrollHeight;
  out.hScroll = document.documentElement.scrollWidth > innerWidth + 1;
  // Anything poking outside the viewport horizontally.
  out.overflow = [...document.querySelectorAll('.cmp *')]
    .filter((n) => {
      const x = n.getBoundingClientRect();
      return x.width > 0 && (x.left < -2 || x.right > innerWidth + 2);
    })
    .map((n) => n.className?.toString?.().slice(0, 40))
    .slice(0, 8);
  // Contrast-relevant computed colours actually in use.
  const cs = (sel, prop) => {
    const n = document.querySelector(sel);
    return n ? getComputedStyle(n)[prop] : null;
  };
  out.runBg = cs('.cmp__run', 'backgroundColor');
  out.runFg = cs('.cmp__run', 'color');
  out.ledeFg = cs('.cmp__lede', 'color');
  out.hintFg = cs('.cmp__hint', 'color');
  return out;
};

for (const [name, vp] of Object.entries({
  desktop: { width: 1440, height: 1000, deviceScaleFactor: 2 },
  laptop: { width: 1180, height: 900, deviceScaleFactor: 2 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
})) {
  const p = await b.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  const errs = [];
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 200)));
  p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 200)));
  await p.goto(`http://localhost:${PORT}/create`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(900);
  await p.screenshot({ path: `.shots/create-${name}.png`, fullPage: true });
  console.log(name.toUpperCase(), JSON.stringify(await p.evaluate(measure), null, 1));
  if (errs.length) console.log(name.toUpperCase() + ' CONSOLE', errs);
  await p.close();
}

// The prefilled-prompt path the hero links with, plus a fork arrival.
const p2 = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
await p2.goto(
  `http://localhost:${PORT}/create?prompt=${encodeURIComponent('a wet tram stop at 6am, sodium light')}&parentPrompt=${encodeURIComponent('a tram stop at noon, hard sun, 35mm')}&from=remix`,
  { waitUntil: 'networkidle' }
);
await p2.waitForTimeout(700);
await p2.screenshot({ path: '.shots/create-fork.png', fullPage: true });
console.log('FORK', JSON.stringify(await p2.evaluate(measure), null, 1));

await b.close();
