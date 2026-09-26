import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
for (const [route, file] of [['/credits','credits'], ['/mcp','mcp']]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:5188' + route, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `.shots/${file}.png` });
  const m = await p.evaluate(() => ({
    docW: document.documentElement.scrollWidth, vw: innerWidth,
    docH: document.documentElement.scrollHeight,
    overflow: [...document.querySelectorAll('body *')].filter(n=>{
      const r=n.getBoundingClientRect(); return r.width>0 && (r.left<-2||r.right>innerWidth+2);
    }).map(n=>n.className?.toString?.().slice(0,32)).slice(0,5),
  }));
  console.log(route, JSON.stringify(m));
  await p.close();
}
await b.close();
