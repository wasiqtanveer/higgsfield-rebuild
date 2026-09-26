import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
for (const [route, file, y] of [['/credits','credits-mid',1500],['/credits','credits-end',2400],['/mcp','mcp-mid',1200],['/mcp','mcp-end',2100]]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:5188' + route, { waitUntil: 'networkidle' });
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `.shots/${file}.png` });
  await p.close();
}
await b.close();
