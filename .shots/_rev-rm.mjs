import { chromium } from 'playwright';
import fs from 'fs';
const OUT='D:/Personal Projects/HiggsField Cone/.impeccable/review';
const b=await chromium.launch({channel:'chrome'});
const L=[];const log=(...a)=>{L.push(a.join(' '));console.log(...a);};

// --- reduced motion, NO scrolling at all: land and jump straight to each band ---
const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const p=await ctx.newPage();
await p.goto('http://localhost:4319/',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
// hard jump (no smooth scroll) to the deepest band first: worst case for gated content
await p.evaluate(()=>window.scrollTo(0,document.getElementById('close').offsetTop));
await p.waitForTimeout(500);
const rmClose=await p.evaluate(()=>{
 const o={};
 const q=s=>document.querySelector(s);
 o.titleWordOpacity=[...document.querySelectorAll('.cc-title__word')].map(e=>getComputedStyle(e).opacity);
 o.titleWordTransform=[...document.querySelectorAll('.cc-title__word')].slice(0,3).map(e=>getComputedStyle(e).transform);
 o.field=getComputedStyle(q('.cc-field')).opacity;
 o.readout=getComputedStyle(q('.cc-readout')).opacity;
 return o;});
log('RM #close',JSON.stringify(rmClose));
await p.screenshot({path:OUT+'/rm-close.png'});

for (const id of ['feed','how','models']){
 await p.evaluate(i=>window.scrollTo(0,document.getElementById(i).offsetTop),id);
 await p.waitForTimeout(600);
 const st=await p.evaluate((i)=>{
  const r=document.getElementById(i);
  const hidden=[...r.querySelectorAll('*')].filter(e=>{const c=getComputedStyle(e);const b=e.getBoundingClientRect();
    return b.width>2&&b.height>2&&(parseFloat(c.opacity)<0.55||(c.transform!=='none'&&!/matrix\(1, 0, 0, 1, 0, 0\)/.test(c.transform)));})
   .map(e=>({el:(e.className?.toString?.()||e.tagName).slice(0,38),op:getComputedStyle(e).opacity,tr:getComputedStyle(e).transform.slice(0,44)}));
  const band=r.closest('.arrive')||r;
  return {arriveClass:band.className,arriveOp:getComputedStyle(band).opacity,arriveFilter:getComputedStyle(band).filter,arriveTr:getComputedStyle(band).transform, hidden:hidden.slice(0,14), hiddenCount:hidden.length};
 },id);
 log('RM #'+id,JSON.stringify(st,null,1));
 await p.screenshot({path:OUT+`/rm-${id}.png`});
}
await ctx.close();

// --- mobile 390x844 ---
const m=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const mp=await m.newPage();
await mp.goto('http://localhost:4319/',{waitUntil:'networkidle'});
const H=await mp.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<H;y+=400){await mp.evaluate(v=>window.scrollTo(0,v),y);await mp.waitForTimeout(150);}
await mp.evaluate(()=>window.scrollTo(0,0));await mp.waitForTimeout(500);
await mp.screenshot({path:OUT+'/mobile.png',fullPage:true});
const of=await mp.evaluate(()=>{
 const out=[];const vw=document.documentElement.clientWidth;
 for(const id of ['feed','how','models','close']){
  document.getElementById(id).querySelectorAll('*').forEach(e=>{const r=e.getBoundingClientRect();
   if(r.width>0&&(r.right>vw+1.5||r.left<-1.5)) out.push({band:id,el:(e.className?.toString?.()||e.tagName).slice(0,36),left:Math.round(r.left),right:Math.round(r.right),vw});});
 } return out.slice(0,20);});
log('MOBILE OVERFLOW',JSON.stringify(of,null,1));
// tap targets
const tt=await mp.evaluate(()=>{const o=[];for(const id of ['feed','how','models','close']){document.getElementById(id).querySelectorAll('a,button,input').forEach(e=>{const r=e.getBoundingClientRect();if(r.height>0&&(r.height<44||r.width<44))o.push({band:id,el:(e.className?.toString?.()||e.tagName).slice(0,32),w:Math.round(r.width),h:Math.round(r.height)});});}return o;});
log('SMALL TAP TARGETS',JSON.stringify(tt));
for(const id of ['feed','close']){await mp.evaluate(i=>document.getElementById(i).scrollIntoView({block:'start'}),id);await mp.waitForTimeout(1200);await mp.screenshot({path:OUT+`/mobile-${id}.png`});}
fs.writeFileSync(OUT+'/rm-log.txt',L.join('\n'));
await b.close();
