/* Finite reading guides for the narrative edition. */
(() => {
'use strict';
const slides=window.ASTRA_SLIDES||[], NS='http://www.w3.org/2000/svg';
const plans=Object.fromEntries(slides.map(s=>[s.id,s.motionPlan]));
for(const s of slides){s.motionDuration=1600+s.motionPlan.cues.reduce((n,c)=>n+(c.hold||1900),0);s.motionDescription=s.motionPlan.name;}
function mount(root,slide,{reduced=false}={}){
 const scene=root.querySelector('.astra-scene'),plan=plans[slide.id];
 if(!scene||!plan)throw new Error('Missing narrative motion plan');
 if(reduced)return{cleanup(){},setPaused(){},restart(){},getState(){return{id:slide.id,active:true,reduced:true,elapsed:slide.motionDuration,phase:plan.cues.length,finished:true,paused:true,cycle:0,duration:slide.motionDuration};}};
 let dead=false,paused=false,finished=reduced,elapsed=reduced?slide.motionDuration:0,last=null,raf=0;
 const touched=new Set(),graphics=[];
 // Lines retain the exact original characters and newlines, including copy/paste.
 scene.querySelectorAll('.astra-code>code').forEach(code=>{const lines=code.textContent.split('\n');code.replaceChildren(...lines.flatMap((line,i)=>{const span=document.createElement('span');span.dataset.motionLine=i;span.textContent=line;return i?[document.createTextNode('\n'),span]:[span];}));});
 const svg=document.createElementNS(NS,'svg');svg.classList.add('motion-plane');svg.setAttribute('viewBox','0 0 1600 900');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');scene.append(svg);
 const make=(name,attrs,parent=svg)=>{const e=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.append(e);return e;};
 function box(el){const r=el.getBoundingClientRect(),s=scene.getBoundingClientRect(),scale=s.width/1600;return{x:(r.left-s.left)/scale,y:(r.top-s.top)/scale,w:r.width/scale,h:r.height/scale};}
 function outline(b,kind){const{x,y,w,h}=b; if(kind==='frame'||kind==='scope')return `M${x+12} ${y-5}H${x+w-12}Q${x+w+5} ${y-5} ${x+w+5} ${y+12}V${y+h-12}Q${x+w+5} ${y+h+5} ${x+w-12} ${y+h+5}H${x+12}Q${x-5} ${y+h+5} ${x-5} ${y+h-12}V${y+12}Q${x-5} ${y-5} ${x+12} ${y-5}`;if(kind==='bracket')return `M${x+8} ${y-4}H${x-9}V${y+h+4}H${x+8}`;return `M${x} ${y+h+4}H${x+w}`;}
 function connect(a,b,route){
  const ac={x:a.x+a.w/2,y:a.y+a.h/2},bc={x:b.x+b.w/2,y:b.y+b.h/2};
  if(route==='direct'){const dx=bc.x-ac.x,dy=bc.y-ac.y;const edge=(r,sign)=>{const t=Math.min((r.w/2+6)/Math.max(.001,Math.abs(dx)),(r.h/2+6)/Math.max(.001,Math.abs(dy)));return{x:(sign===1?ac:bc).x+dx*t*sign,y:(sign===1?ac:bc).y+dy*t*sign};};const p=edge(a,1),q=edge(b,-1);return`M${p.x} ${p.y}L${q.x} ${q.y}`;}
  const x=a.x+a.w+8, tx=b.x-8, mid=(x+tx)/2;return`M${x} ${ac.y}C${mid} ${ac.y} ${mid} ${bc.y} ${tx} ${bc.y}`;
 }
 function build(){
  svg.replaceChildren();graphics.length=0;
  let start=1000;
  for(const item of plan.cues){
   const targets=[...scene.querySelectorAll(item.target)],hold=item.hold||1900;
   const group=make('g',{'class':`motion-cue motion-${item.color}`});
   const paths=[];
   const add=(d,opts={})=>{const path=make('path',{d,fill:'none','class':'motion-trace'},group);const len=path.getTotalLength();path.style.strokeDasharray=`${len} ${len}`;const dot=make('circle',{r:opts.dot===false?0:4.5,'class':'motion-dot'},group);paths.push({...opts,path,dot,len});};
   targets.forEach(el=>{
    touched.add(el);el.classList.add('motion-target');el.style.setProperty('--motion-color',`var(--a-${item.color})`);const b=box(el);
    if(item.from){const from=scene.querySelector(item.from);if(from)add(connect(box(from),b,item.route),{route:true});}
    if(item.kind==='loop'){
     const X=v=>b.x+v*b.w/1000,Y=v=>b.y+v*b.h/360;
     // Exact de Casteljau slices of agent-loop.svg, clipped at the node edges.
     // Original corner rises 95px; the visible arc reaches y=155/265 (40px).
     const t=Math.sqrt(40/95),control=110*t,right=720+220*t-110*t*t,left=1000-right;
     add(`M${X(280)} ${Y(115)}H${X(720)}Q${X(720+control)} ${Y(115)} ${X(right)} ${Y(155)}`,{route:true});
     add(`M${X(right)} ${Y(265)}Q${X(720+control)} ${Y(305)} ${X(720)} ${Y(305)}H${X(280)}Q${X(280-control)} ${Y(305)} ${X(left)} ${Y(265)}`,{route:true,second:true});
    }else if(item.kind==='exchange'){
     add(`M${b.x+5} ${b.y+1}H${b.x+b.w-10}`,{route:true});add(`M${b.x+b.w-5} ${b.y+b.h-1}H${b.x+10}`,{route:true,second:true});
    }else if(item.kind==='borderExchange'){
     add(`M${b.x} ${b.y+1}H${b.x+b.w}`,{route:true});
     add(`M${b.x+b.w} ${b.y+b.h-1}H${b.x}`,{route:true,second:true});
    }else if(item.kind==='timeline')add(`M${b.x} ${b.y+b.h/2}H${b.x+b.w}`,{route:true});
    else if(item.kind==='ink')el.querySelectorAll('.astra-blank').forEach(blank=>{const q=box(blank);add(`M${q.x} ${q.y+q.h/2}H${q.x+q.w}`,{ink:true,dot:false});});
    else add(outline(b,item.kind),{dot:item.kind==='scan'});
   });
   graphics.push({item,targets,group,paths,start,end:start+hold});start+=hold;
  }
  paint(elapsed);
 }
 function paint(ms){
  scene.dataset.motionState=ms>=slide.motionDuration?'finished':paused?'paused':'playing';
  for(const g of graphics){
   const t=Math.max(0,Math.min(1,(ms-g.start)/(g.end-g.start))),active=ms>=g.start&&ms<g.end;
   const settle=t===1;g.group.style.opacity=ms<g.start?'0':settle?(reduced?'0':'.24'):'1';
   for(const p of g.paths){
    const split=g.paths.some(x=>x.second);let progress=split?(p.second?Math.max(0,(t-.5)*2):Math.min(1,t*2)):Math.min(1,t/.72);
    // Draw causally meaningful routes; don't move a cursor over readable words.
    p.path.style.strokeDashoffset=String(p.len*(1-progress));p.path.style.strokeWidth=p.ink?'5':'3';
    p.dot.style.opacity=active&&progress>0&&progress<1?'1':'0';
    if(progress>0&&progress<1){const point=p.path.getPointAtLength(progress*p.len);p.dot.setAttribute('cx',point.x);p.dot.setAttribute('cy',point.y);}
   }
   g.targets.forEach(el=>el.style.setProperty('--motion-focus',active&&!['loop','exchange','borderExchange','timeline','ink'].includes(g.item.kind)?String(Math.sin(Math.PI*t)*.075):'0'));
  }
 }
 function frame(now){raf=0;if(dead||paused||finished)return;if(last!==null)elapsed=Math.min(slide.motionDuration,elapsed+now-last);last=now;paint(elapsed);if(elapsed>=slide.motionDuration){finished=true;scene.dispatchEvent(new CustomEvent('motioncomplete',{bubbles:true}));}else raf=requestAnimationFrame(frame);}
 function schedule(){if(!dead&&!paused&&!finished&&!raf)raf=requestAnimationFrame(frame);}
 function setPaused(value){if(dead)return;paused=Boolean(value);cancelAnimationFrame(raf);raf=0;last=null;paint(elapsed);schedule();}
 function restart(){if(dead||reduced)return;elapsed=0;finished=false;last=null;paint(0);schedule();}
 function cleanup(){dead=true;cancelAnimationFrame(raf);svg.remove();touched.forEach(el=>{el.classList.remove('motion-target');el.style.removeProperty('--motion-focus');el.style.removeProperty('--motion-color');});delete scene.dataset.motionState;}
 build();document.fonts?.ready.then(()=>{if(!dead)build();});if(!reduced)schedule();
 return{cleanup,setPaused,restart,getState(){return{id:slide.id,active:true,reduced,elapsed,phase:graphics.filter(g=>elapsed>=g.start).length,finished,paused,cycle:0,duration:slide.motionDuration};}};
}
window.DeckMotion={mount,plans,version:'narrative-1',motionIds:slides.map(s=>s.id)};
})();
