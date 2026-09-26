import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:4319/',{waitUntil:'networkidle'});
await p.evaluate(()=>document.getElementById('close').scrollIntoView({block:'start'}));
await p.waitForTimeout(1500);
// sample ghost line opacities every 200ms for 9s to see the crossfade overlap window
let maxOverlap=0, samples=[];
for(let i=0;i<45;i++){
  const ops=await p.evaluate(()=>[...document.querySelectorAll('.cc-ghost__line')].map(e=>+getComputedStyle(e).opacity));
  const visible=ops.filter(o=>o>0.06).length;
  if(visible>1) maxOverlap=Math.max(maxOverlap,visible);
  samples.push(ops.map(o=>o.toFixed(2)).join('/'));
  await p.waitForTimeout(200);
}
console.log('MAX simultaneously visible ghost lines:',maxOverlap);
console.log('sample window:',samples.slice(14,24).join('  '));
// contrast of key text
const c=await p.evaluate(()=>{
 const g=(s)=>{const e=document.querySelector(s);if(!e)return null;const cs=getComputedStyle(e);return{sel:s,color:cs.color,size:cs.fontSize,weight:cs.fontWeight};};
 return ['.cc-ghost__line','.cc-readout','.cc-foot','.fl__forks-hint','.ms-foot__note','.fd-lede','.sf__blurb'].map(g);});
console.log(JSON.stringify(c,null,1));
await b.close();
