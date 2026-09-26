import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });

// --- Reduced motion: nothing armed, diff resolved on first paint. -----------
const rp = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
await rp.goto('http://localhost:5191/about', { waitUntil: 'networkidle' });
await rp.waitForTimeout(400);
console.log('REDUCED', JSON.stringify(await rp.evaluate(() => ({
  insTotal: document.querySelectorAll('.abt__tok--ins').length,
  insResolvedEarly: document.querySelectorAll('.abt__tok--ins.is-resolved').length,
  nodeIsStill: document.querySelector('.abt__node')?.classList.contains('is-still'),
  nodeAnim: getComputedStyle(document.querySelector('.abt__node')).animationName,
  childAnim: getComputedStyle(document.querySelector('.abt__child')).animationName,
  threadAnim: getComputedStyle(document.querySelector('.abt__thread')).animationName,
}))));
await rp.screenshot({ path: '.impeccable/review/reduced-motion.png', fullPage: false });

// --- Keyboard: every control reachable, focus ring visible. -----------------
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5191/about', { waitUntil: 'networkidle' });
await p.waitForTimeout(2600);
const stops = [];
for (let i = 0; i < 14; i++) {
  await p.keyboard.press('Tab');
  stops.push(await p.evaluate(() => {
    const a = document.activeElement; if (!a) return null;
    const c = getComputedStyle(a);
    return { tag: a.tagName, cls: (a.className||'').toString().slice(0,34),
             text: (a.textContent||'').trim().slice(0,30),
             outline: c.outlineWidth + ' ' + c.outlineColor };
  }));
}
console.log('TABSTOPS', JSON.stringify(stops.filter(s => s && s.cls.includes('abt')), null, 1));

// Activate a child by keyboard and confirm promotion happened.
const child = await p.$('.abt__child');
await child.focus();
await p.screenshot({ path: '.impeccable/review/focus-ring.png', fullPage: false });
await p.keyboard.press('Enter');
await p.waitForTimeout(1200);
console.log('AFTER_ENTER', JSON.stringify(await p.evaluate(() => ({
  depth: document.querySelector('.abt__depth-num')?.textContent,
  spineRows: document.querySelectorAll('.abt__spine-row').length,
}))));

await b.close();
