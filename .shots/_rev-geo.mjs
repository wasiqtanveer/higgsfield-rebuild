import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:4319/',{waitUntil:'networkidle'});
await p.evaluate(()=>document.getElementById('feed').scrollIntoView({block:'start'}));
await p.waitForTimeout(1500);
const g=await p.evaluate(()=>{
 const R=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{top:Math.round(r.top),bottom:Math.round(r.bottom),left:Math.round(r.left),w:Math.round(r.width),h:Math.round(r.height)};};
 return {head:R('.fl__head'),stage:R('.fl__stage'),promptCol:R('.fl__prompt-col'),prompt:R('.fl__prompt'),frameCol:R('.fl__frame-col'),frame:R('.fl__frame'),img:R('.fl__img'),
   stageW:R('.fl__stage').w, ratio:(R('.fl__prompt-col').w/R('.fl__frame-col').w).toFixed(2)};});
console.log(JSON.stringify(g,null,1));
// eyebrows + section numbers inventory
const e=await p.evaluate(()=>{
 const out=[];
 document.querySelectorAll('#feed .label, #how .label, #models .label, #close .label, .sf__label').forEach(el=>{
  const h=el.parentElement?.querySelector('h1,h2,h3')||el.nextElementSibling;
  out.push({cls:el.className,text:el.innerText.trim().slice(0,30),followedByHeading:!!(el.nextElementSibling&&/^H[123]$/.test(el.nextElementSibling.tagName))});});
 return out;});
console.log('LABELS/EYEBROWS:'); e.forEach(x=>console.log(' ',JSON.stringify(x)));
await b.close();
