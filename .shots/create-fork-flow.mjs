/**
 * The product's core loop, driven through the real UI:
 *   1. type a prompt, Generate  -> a root row in Supabase
 *   2. press Fork this          -> prompt reloaded, seed pinned, parent set
 *   3. edit one clause, Generate -> a child row whose parent_id is the root
 *
 * Then reads /api/feed back to confirm the two rows are actually linked. If the
 * chain is there, lineage is real end to end from the browser.
 */
import { chromium } from 'playwright';

const PORT = process.env.PORT || 5189;
const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });

const errs = [];
p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 200)));
p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 200)));

const receipt = () =>
  p.evaluate(() =>
    [...document.querySelectorAll('.cmp__meta-row')]
      .map((r) => r.querySelector('dt').textContent + '=' + r.querySelector('dd').textContent)
      .join('  ')
  );

await p.goto(`http://localhost:${PORT}/create`, { waitUntil: 'networkidle' });
await p.waitForTimeout(800);

// --- 1. the root -----------------------------------------------------------
await p.fill('.cmp__input', 'a harbour at dawn, fog on the water, 35mm');
await p.click('.cmp__run');
await p.waitForSelector('.cmp__img', { timeout: 90000 });
await p.waitForTimeout(1200);
console.log('ROOT  ', await receipt());
await p.screenshot({ path: '.shots/create-root.png', fullPage: true });

// --- 2. fork it ------------------------------------------------------------
await p.click('.cmp__fork');
await p.waitForTimeout(700);
console.log('after fork, lineage strip says:',
  (await p.textContent('.cmp__lineage')).replace(/\s+/g, ' ').trim().slice(0, 80));
console.log('seed pinned to:', await p.inputValue('.cmp__seed'));
await p.screenshot({ path: '.shots/create-forking.png', fullPage: true });

// --- 3. change one clause and run -------------------------------------------
await p.fill('.cmp__input', 'a harbour at dawn, fog on the water, 85mm from the breakwater');
await p.click('.cmp__run');
await p.waitForSelector('.cmp__img', { timeout: 90000 });
await p.waitForTimeout(1200);
console.log('CHILD ', await receipt());
await p.screenshot({ path: '.shots/create-child.png', fullPage: true });

// --- verify in the database -------------------------------------------------
const feed = await p.evaluate(async () => (await fetch('/api/feed')).json());
const rows = feed.generations.slice(0, 2);
console.log('\nnewest two rows in Supabase:');
for (const g of rows) {
  console.log(' ', g.id.slice(0, 8), 'parent:', g.parent_id ? g.parent_id.slice(0, 8) : 'ROOT', '|', g.prompt.slice(0, 50));
}
const [child, root] = rows;
console.log('\nchild.parent_id === root.id ?', child?.parent_id === root?.id ? 'YES — lineage is real' : 'NO');

console.log(errs.length ? `console errors: ${errs}` : 'no console errors');
await b.close();
