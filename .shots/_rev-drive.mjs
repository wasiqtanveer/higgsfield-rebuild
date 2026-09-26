import { chromium } from 'playwright';
const OUT = 'D:/Personal Projects/HiggsField Cone/.impeccable/review';
import fs from 'fs'; fs.mkdirSync(OUT, {recursive:true});
const b = await chromium.launch({ channel: 'chrome' });
const log = [];
const L = (...a)=>{log.push(a.join(' '));console.log(...a);};

async function band(page, id){ await page.evaluate(i=>document.getElementById(i).scrollIntoView({block:'start'}), id); await page.waitForTimeout(1400); }

// ---------- desktop ----------
const ctx = await b.newContext({viewport:{width:1440,height:900}, deviceScaleFactor:1});
const p = await ctx.newPage();
p.on('console', m=>{ if(m.type()==='error') L('CONSOLE-ERR:', m.text()); });
p.on('pageerror', e=>L('PAGEERR:', e.message));
await p.goto('http://localhost:4319/', {waitUntil:'networkidle'});
await p.waitForTimeout(800);

// full page after slow scroll so all Arrive bands settle
const H = await p.evaluate(()=>document.body.scrollHeight);
L('docHeight', H);
for(let y=0;y<H;y+=500){ await p.evaluate(v=>window.scrollTo(0,v), y); await p.waitForTimeout(180); }
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(600);
await p.screenshot({path:OUT+'/desktop.png', fullPage:true});

// per-band viewport shots
for (const id of ['feed','how','models','close']) {
  await band(p, id);
  await p.screenshot({path:`${OUT}/desktop-${id}.png`});
}
// foot
await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
await p.waitForTimeout(900);
await p.screenshot({path:OUT+'/desktop-foot.png'});

// band heights in viewports
const heights = await p.evaluate(()=>{
  const o={};
  for(const id of ['feed','how','models','close']){const e=document.getElementById(id);o[id]=+(e.getBoundingClientRect().height/window.innerHeight).toFixed(2);}
  const f=document.querySelector('footer, .sf'); o.foot = f? +(f.getBoundingClientRect().height/window.innerHeight).toFixed(2):null;
  return o;
});
L('BAND VIEWPORTS', JSON.stringify(heights));

// ---- honesty sweep: all text on page, look for benchmark/latency words ----
const txt = await p.evaluate(()=>document.body.innerText);
fs.writeFileSync(OUT+'/pagetext.txt', txt);
const suspects = /(\d+\s*(ms|s|sec|seconds|fps)\b)|(\d+\s*x\s*faster)|(fastest|best[- ]in[- ]class|state of the art|SOTA|benchmark|outperform|beats|#1|industry[- ]leading|99\.\d|uptime|SLA)/gi;
L('HONESTY HITS:', JSON.stringify(txt.match(suspects)||[]));

// images inside the four bands (no parent/child pair)
const imgs = await p.evaluate(()=>{
  const o={};
  for(const id of ['feed','how','models','close']){
    o[id]=[...document.getElementById(id).querySelectorAll('img')].map(i=>i.currentSrc||i.src);
  }
  return o;
});
L('IMGS', JSON.stringify(imgs,null,1));

// ---- accent rationing: every element whose color/bg/border uses the orange ----
const accent = await p.evaluate(()=>{
  const hit=[];
  const isO=(s)=>/rgba?\(\s*2(5[0-5]|4\d)\s*,\s*(8\d|9[0-9]|10\d)\s*,\s*([0-4]?\d)\s*/.test(s)||/#ff5c1a/i.test(s);
  for(const id of ['feed','how','models','close']){
    const root=document.getElementById(id);
    for(const el of root.querySelectorAll('*')){
      const c=getComputedStyle(el);
      const props=['color','backgroundColor','borderTopColor','borderLeftColor','borderBottomColor','borderRightColor','outlineColor','fill','stroke'];
      for(const pr of props){ if(isO(c[pr])){ 
        const r=el.getBoundingClientRect();
        if(r.width>0&&r.height>0) hit.push({band:id, sel:el.className?.toString?.().slice(0,46)||el.tagName, pr, v:c[pr], w:Math.round(r.width),h:Math.round(r.height)});
        break; } }
    }
  }
  return hit;
});
L('ACCENT USES:'); accent.forEach(a=>L(' ', JSON.stringify(a)));
await ctx.close();
fs.writeFileSync(OUT+'/drive-log.txt', log.join('\n'));
await b.close();
