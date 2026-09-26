import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:5188/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
// open the More menu so its links render
await p.click('.hdr__more').catch(()=>{});
await p.waitForTimeout(400);
const links = await p.evaluate(() =>
  [...document.querySelectorAll('header a[href], .hdr__menu a[href]')]
    .map(a => ({ text: a.textContent.trim().slice(0,28), href: a.getAttribute('href') })));
console.log(JSON.stringify(links, null, 1));
await b.close();
