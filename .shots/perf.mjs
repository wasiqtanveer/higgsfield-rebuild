import { chromium } from 'playwright';

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);

// Sample real frame intervals via rAF over ~4s of idle marquee animation.
const idle = await p.evaluate(() => new Promise((res) => {
  const t = [];
  let last = performance.now();
  const tick = (now) => {
    t.push(now - last); last = now;
    if (t.length < 240) requestAnimationFrame(tick); else res(t);
  };
  requestAnimationFrame(tick);
}));

// Same, but while scrolling — the scroll-linked parallax is the risky path.
const scrolling = await p.evaluate(() => new Promise((res) => {
  const t = [];
  let last = performance.now();
  let y = 0;
  const tick = (now) => {
    t.push(now - last); last = now;
    y += 9; window.scrollTo(0, y);
    if (t.length < 180) requestAnimationFrame(tick); else res(t);
  };
  requestAnimationFrame(tick);
}));

const stat = (name, arr) => {
  const s = arr.slice(5).sort((a, b) => a - b);
  const pct = (q) => s[Math.floor(s.length * q)].toFixed(1);
  const long = s.filter((v) => v > 20).length;
  const worst = s[s.length - 1].toFixed(1);
  console.log(`${name.padEnd(10)} median ${pct(0.5)}ms  p95 ${pct(0.95)}ms  worst ${worst}ms  frames>20ms: ${long}/${s.length}`);
};

stat('idle', idle);
stat('scrolling', scrolling);

await b.close();
