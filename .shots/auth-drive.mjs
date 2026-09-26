import { chromium } from "playwright";

const OUT = "d:/Personal Projects/HiggsField Cone/.shots";
const BASE = process.env.BASE || "http://localhost:5173";

const b = await chromium.launch({ executablePath: "C:/Users/mwasi/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe" });
const page = await b.newPage({ viewport: { width: 1280, height: 860 } });
const errs = [];
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
page.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));

await page.goto(BASE, { waitUntil: "networkidle" });

// The pill starts collapsed; hover reveals both doors.
await page.hover(".authpill");
await page.waitForTimeout(450);
await page.screenshot({ path: `${OUT}/auth-pill.png` });

const pill = await page.locator(".authpill").count();
console.log("auth pill present:", pill === 1);

// Open the signup door.
await page.click(".authpill__btn--primary");
await page.waitForSelector(".authmodal__panel", { timeout: 3000 });
await page.waitForTimeout(700); // let the stagger finish
await page.screenshot({ path: `${OUT}/auth-modal.png` });
console.log("modal heading:", await page.locator(".authmodal__title").innerText());

// Reject a bad address.
await page.fill(".authmodal__input", "not-an-email");
await page.click(".authmodal__submit");
await page.waitForTimeout(250);
const err = await page.locator(".authmodal__error").count();
console.log("rejects bad email:", err === 1);
await page.screenshot({ path: `${OUT}/auth-invalid.png` });

// Escape closes.
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
console.log("escape closes:", (await page.locator(".authmodal__panel").count()) === 0);

// Sign in for real, via email.
await page.hover(".authpill");
await page.click(".authpill__btn--primary");
await page.waitForSelector(".authmodal__input");
await page.fill(".authmodal__input", "wasiq.tanveer@studio.com");
await page.click(".authmodal__submit");

// The circle should replace the pill.
await page.waitForSelector(".usermenu__circle", { timeout: 3000 });
await page.waitForTimeout(600);
const pillGone = (await page.locator(".authpill").count()) === 0;
console.log("pill replaced by circle:", pillGone);
console.log("initials:", await page.locator(".usermenu__initials").innerText());
await page.screenshot({ path: `${OUT}/auth-circle.png` });

// Open the account menu.
await page.click(".usermenu__circle");
await page.waitForSelector(".usermenu__panel");
await page.waitForTimeout(400);
console.log("menu name:", await page.locator(".usermenu__id-name").innerText());
console.log("credits:", await page.locator(".usermenu__credits-n").innerText());
await page.screenshot({ path: `${OUT}/auth-menu.png` });

// Survives a reload -- the whole point of putting it in localStorage.
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
console.log(
  "survives reload:",
  (await page.locator(".usermenu__circle").count()) === 1
);

// Log out returns the pill.
await page.click(".usermenu__circle");
await page.waitForSelector(".usermenu__out");
await page.click(".usermenu__out");
await page.waitForTimeout(500);
console.log("logout restores pill:", (await page.locator(".authpill").count()) === 1);
await page.screenshot({ path: `${OUT}/auth-loggedout.png` });

// Mobile.
const m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto(BASE, { waitUntil: "networkidle" });
await m.evaluate(() =>
  localStorage.setItem(
    "hf.auth",
    JSON.stringify({
      email: "wasiq@studio.com",
      name: "Wasiq",
      initials: "W",
      credits: 180,
      handle: "@wasiq",
      provider: "email",
    })
  )
);
await m.reload({ waitUntil: "networkidle" });
await m.waitForTimeout(400);
await m.click(".usermenu__circle");
await m.waitForTimeout(400);
await m.screenshot({ path: `${OUT}/auth-mobile.png` });
console.log("mobile menu opens:", (await m.locator(".usermenu__panel").count()) === 1);

// Ring reflects a partial balance (180/250).
const off = await m.getAttribute(".usermenu__ring-fill", "stroke-dashoffset");
console.log("ring offset at 180 credits:", Number(off).toFixed(2), "(0 would be full)");

console.log(errs.length ? "CONSOLE ERRORS:\n" + errs.join("\n") : "no console errors");
await b.close();
