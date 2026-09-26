import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://localhost:4319/',{waitUntil:'networkidle'});
await p.evaluate(()=>{const H=document.body.scrollHeight;});
for(let y=0;y<5000;y+=500){await p.evaluate(v=>window.scrollTo(0,v),y);await p.waitForTimeout(120);}
await p.waitForTimeout(600);
const res=await p.evaluate(()=>{
 const lum=(r,g,bl)=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(bl);};
 const parse=s=>{const m=s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);return m?{r:+m[1],g:+m[2],b:+m[3],a:m[4]===undefined?1:+m[4]}:null;};
 const bgOf=el=>{let n=el;while(n&&n!==document.documentElement){const c=parse(getComputedStyle(n).backgroundColor);if(c&&c.a>0.75)return c;n=n.parentElement;}return {r:8,g:9,b:12,a:1};};
 const out=[];const seen=new Set();
 for(const id of ['feed','how','models','close']){
  const root=document.getElementById(id);
  root.querySelectorAll('*').forEach(el=>{
   const t=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim().length>1);
   if(!t.length)return;
   const cs=getComputedStyle(el); if(cs.visibility==='hidden'||+cs.opacity<0.3)return;
   const r=el.getBoundingClientRect(); if(r.width<3||r.height<3)return;
   const fg=parse(cs.color); if(!fg)return; const bg=bgOf(el);
   const L1=lum(fg.r,fg.g,fg.b),L2=lum(bg.r,bg.g,bg.b);
   const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
   const px=parseFloat(cs.fontSize),bold=+cs.fontWeight>=700;
   const large=px>=24||(px>=18.66&&bold);
   const floor=large?3:4.5;
   const key=id+'|'+cs.color+'|'+cs.fontSize+'|'+(el.className?.toString?.()||el.tagName);
   if(ratio<floor && !seen.has(key)){seen.add(key);
    out.push({band:id,el:(el.className?.toString?.()||el.tagName).slice(0,40),color:cs.color,px:cs.fontSize,ratio:+ratio.toFixed(2),floor,text:el.textContent.trim().slice(0,46)});}
  });
 }
 // foot
 document.querySelectorAll('.sf *, footer *').forEach(el=>{
   const t=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim().length>1); if(!t.length)return;
   const cs=getComputedStyle(el); const fg=parse(cs.color); if(!fg)return; const bg=bgOf(el);
   const L1=lum(fg.r,fg.g,fg.b),L2=lum(bg.r,bg.g,bg.b);
   const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
   const px=parseFloat(cs.fontSize);const large=px>=24;
   const floor=large?3:4.5;
   if(ratio<floor) out.push({band:'foot',el:(el.className?.toString?.()||el.tagName).slice(0,40),color:cs.color,px:cs.fontSize,ratio:+ratio.toFixed(2),floor,text:el.textContent.trim().slice(0,40)});
 });
 return out;});
console.log('CONTRAST FAILURES:',res.length);
res.forEach(r=>console.log(JSON.stringify(r)));
await b.close();
