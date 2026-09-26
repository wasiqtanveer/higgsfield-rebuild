/**
 * Drive /create end to end: type a prompt, press Generate, watch the states.
 * Captures the running state and the finished result, and reports whether the
 * motion actually ran (by sampling opacity mid-transition).
 */
import { chromium } from 'playwright';

const PORT = process.env.PORT || 5188;
const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });

const errs = [];
p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 200)));
p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 200)));

await p.goto(`http://localhost:${PORT}/create`, { waitUntil: 'networkidle' });

// Did the arrival animation actually run? Sample the composer's opacity on the
// very first frames — if motion is wired it starts below 1.
const early = await p.evaluate(() => {
  const n = document.querySelector('.cmp__lineage');
  return n ? getComputedStyle(n).opacity : null;
});
console.log('lineage opacity at load:', early);

await p.waitForTimeout(1200);
await p.fill('.cmp__input', 'an empty tram stop at 6am, sodium light, wet asphalt');
await p.waitForTimeout(300);
await p.screenshot({ path: '.shots/create-filled.png', fullPage: true });

await p.click('.cmp__run');

// Running state — grab it while the request is in flight.
await p.waitForTimeout(700);
const runningState = await p.getAttribute('.cmp__result', 'data-state');
console.log('state after click:', runningState);
await p.screenshot({ path: '.shots/create-running.png', fullPage: true });

// Wait for the image.
try {
  await p.waitForSelector('.cmp__img', { timeout: 45000 });
  await p.waitForTimeout(1400); // let the receipt stagger finish
  console.log('final state:', await p.getAttribute('.cmp__result', 'data-state'));
  const meta = await p.evaluate(() =>
    [...document.querySelectorAll('.cmp__meta-row')].map(
      (r) => r.querySelector('dt').textContent + '=' + r.querySelector('dd').textContent
    )
  );
  console.log('receipt:', meta.join('  '));
  const img = await p.evaluate(() => {
    const n = document.querySelector('.cmp__img');
    return { w: n.naturalWidth, h: n.naturalHeight, op: getComputedStyle(n).opacity };
  });
  console.log('image:', JSON.stringify(img));
  await p.screenshot({ path: '.shots/create-done.png', fullPage: true });
} catch (e) {
  console.log('NO IMAGE:', String(e).slice(0, 200));
  await p.screenshot({ path: '.shots/create-failed.png', fullPage: true });
}

if (errs.length) console.log('CONSOLE ERRORS:', errs);
else console.log('no console errors');

await b.close();
