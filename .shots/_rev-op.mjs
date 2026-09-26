import { chromium } from 'playwright';
import fs from 'fs';
const OUT='D:/Personal Projects/HiggsField Cone/.impeccable/review';
const b=await chromium.launch({channel:'chrome'});
const L=[];const log=(...a)=>{L.push(a.join(' '));console.log(...a);};
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
p.on('pageerror',e=>log('PAGEERR',e.message));
await p.goto('http://localhost:4319/',{waitUntil:'networkidle'});
const go=async id=>{await p.evaluate(i=>document.getElementById(i).scrollIntoView({block:'start'}),id);await p.waitForTimeout(1500);};

// ===== 1. FEED: click chip 3 =====
await go('feed');
const before=await p.evaluate(()=>{const i=document.querySelector('.fl__img');return{t:getComputedStyle(i).transform,f:getComputedStyle(i).filter,line:document.querySelector('.fl__line.is-edit').innerText,forks:document.querySelector('.fl__stat').innerText};});
log('FEED before',JSON.stringify(before));
await p.click('.fl__chips button:nth-of-type(1)').catch(()=>{});
await p.locator('.fl__chip').nth(2).click();
await p.waitForTimeout(1800);
const after=await p.evaluate(()=>{const i=document.querySelector('.fl__img');return{t:getComputedStyle(i).transform,f:getComputedStyle(i).filter,line:document.querySelector('.fl__line.is-edit').innerText,forks:document.querySelector('.fl__stat').innerText,src:document.querySelector('.fl__img').currentSrc};});
log('FEED after ',JSON.stringify(after));
log('FEED image changed?', before.t!==after.t||before.f!==after.f, '| src same photo?', after.src.includes('c11'));
await p.screenshot({path:OUT+'/op-feed-forked.png'});
// another prompt
await p.click('.fl__next'); await p.waitForTimeout(1200);
log('FEED next entry img', await p.evaluate(()=>document.querySelector('.fl__img').getAttribute('src')));
// composer link href reflects composed prompt
log('FEED composer href', await p.getAttribute('.fl__open','href'));

// ===== 2. HOW: pick fork 2 =====
await go('how');
const h0=await p.evaluate(()=>document.querySelector('.fd-diff').innerText);
await p.locator('.fd-rail__item').nth(1).click();
await p.waitForTimeout(2600);
const h1=await p.evaluate(()=>({diff:document.querySelector('.fd-diff').innerText,legend:document.querySelector('.fd-beat--out .fd-beat__by').innerText,result:document.querySelector('.fd-result').innerText}));
log('HOW changed?',h0!==h1.diff);log('HOW legend',JSON.stringify(h1.legend));log('HOW result',h1.result.slice(0,90));
await p.screenshot({path:OUT+'/op-how-fork2.png'});

// ===== 3. MODELS: select channel 2 =====
await go('models');
const m0=await p.evaluate(()=>({steps:document.querySelector('.ms-steps__num').innerText,lit:document.querySelectorAll('.ms-ladder__tick.is-lit').length,name:document.querySelector('[role=tab][aria-selected=true] .ms-tab__name').innerText}));
await p.locator('.ms-tab').nth(1).click(); await p.waitForTimeout(1500);
const m1=await p.evaluate(()=>({steps:document.querySelector('.ms-steps__num').innerText,lit:document.querySelectorAll('.ms-ladder__tick.is-lit').length,name:document.querySelector('[role=tab][aria-selected=true] .ms-tab__name').innerText}));
log('MODELS',JSON.stringify(m0),'->',JSON.stringify(m1));
// keyboard
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(900);
log('MODELS after ArrowRight', await p.evaluate(()=>document.querySelector('[role=tab][aria-selected=true] .ms-tab__name').innerText));
await p.screenshot({path:OUT+'/op-models-sd3.png'});

// ===== 4. CLOSE: type =====
await go('close');
const c0=await p.evaluate(()=>document.querySelector('.cc-readout').innerText);
await p.fill('#cc-prompt','a loading bay at dawn, sodium light, wet concrete and steam');
await p.waitForTimeout(900);
const c1=await p.evaluate(()=>({r:document.querySelector('.cc-readout').innerText,armed:document.querySelector('.cc-field').dataset.armed,fill:getComputedStyle(document.querySelector('.cc-field')).getPropertyValue('--cc-fill'),threadW:document.querySelector('.cc-field__thread').getBoundingClientRect().width}));
log('CLOSE readout',JSON.stringify(c0),'->',JSON.stringify(c1));
await p.screenshot({path:OUT+'/op-close-typed.png'});

// ===== 5. keyboard focus sweep across bands =====
await p.evaluate(()=>window.scrollTo(0,0));
await p.waitForTimeout(400);
const focusables=await p.evaluate(()=>{
 const out=[];
 for(const id of ['feed','how','models','close']){
  const r=document.getElementById(id);
  r.querySelectorAll('a,button,input,[tabindex]:not([tabindex="-1"])').forEach(e=>{
    e.focus();
    const c=getComputedStyle(e);
    out.push({band:id,el:(e.className?.toString?.()||e.tagName).slice(0,34),outline:c.outlineWidth+' '+c.outlineStyle+' '+c.outlineColor,boxShadow:c.boxShadow.slice(0,60),focusVisible:e.matches(':focus-visible')});
  });
 }
 // foot
 document.querySelectorAll('.sf a, footer a').forEach(e=>{e.focus();const c=getComputedStyle(e);out.push({band:'foot',el:(e.className?.toString?.()||e.tagName).slice(0,34),outline:c.outlineWidth+' '+c.outlineStyle+' '+c.outlineColor,boxShadow:c.boxShadow.slice(0,60),focusVisible:e.matches(':focus-visible')});});
 return out;
});
const bad=focusables.filter(f=>(f.outline.startsWith('0px')||f.outline.includes('none'))&&(f.boxShadow==='none'||!f.boxShadow));
log('FOCUSABLES total',focusables.length,'NO VISIBLE FOCUS:',bad.length);
bad.forEach(f=>log('  NOFOCUS',JSON.stringify(f)));
fs.writeFileSync(OUT+'/op-log.txt',L.join('\n'));
await b.close();
