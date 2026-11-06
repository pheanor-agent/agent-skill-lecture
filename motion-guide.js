/* Three finite information events. Every other scene has no motion work. */
(() => {
'use strict';
const slides=window.ASTRA_SLIDES||[],NS='http://www.w3.org/2000/svg';
const plans=Object.fromEntries(slides.filter(s=>s.motion).map(s=>[s.id,s.motionPlan]));
function mount(root,slide,{reduced=false}={}){
 const plan=plans[slide.id],scene=root.querySelector('.astra-scene');
 if(!plan||reduced)return{cleanup(){},setPaused(){},restart(){},getState(){return{id:slide.id,active:false,reduced,elapsed:0,phase:0,finished:true,paused:true,cycle:0,duration:0};}};
 if(!scene)throw new Error('Missing motion scene');
 let dead=false,paused=false,finished=false,elapsed=0,last=null,raf=0,draw=()=>{};
 const svg=document.createElementNS(NS,'svg');svg.classList.add('motion-plane');svg.setAttribute('viewBox','0 0 1600 900');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');scene.append(svg);
 const make=(tag,attrs={},parent=svg)=>{const el=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);parent.append(el);return el;};
 function box(selector){const el=typeof selector==='string'?scene.querySelector(selector):selector;if(!el)throw new Error(`Missing event anchor: ${selector}`);const r=el.getBoundingClientRect(),s=scene.getBoundingClientRect(),scale=s.width/1600;return{x:(r.left-s.left)/scale,y:(r.top-s.top)/scale,w:r.width/scale,h:r.height/scale};}
 const progress=(ms,start,end)=>Math.max(0,Math.min(1,(ms-start)/(end-start)));
 // Quintic smoothstep gives quiet departures and arrivals with no overshoot.
 const ease=t=>t*t*t*(t*(t*6-15)+10);
 function build(){svg.replaceChildren();draw=buildEvent(plan.kind,{svg,make,box,progress,ease});paint();}
 function paint(){scene.dataset.motionState=finished?'finished':paused?'paused':'playing';draw(elapsed);}
 function frame(now){raf=0;if(dead||paused||finished)return;if(last!==null)elapsed=Math.min(plan.duration,elapsed+now-last);last=now;finished=elapsed>=plan.duration;paint();if(finished)scene.dispatchEvent(new CustomEvent('motioncomplete',{bubbles:true}));else schedule();}
 function schedule(){if(!dead&&!paused&&!finished&&!raf)raf=requestAnimationFrame(frame);}
 function setPaused(value){if(dead)return;paused=Boolean(value);cancelAnimationFrame(raf);raf=0;last=null;paint();schedule();}
 function restart(){if(dead)return;elapsed=0;finished=false;last=null;paint();schedule();}
 function cleanup(){dead=true;cancelAnimationFrame(raf);raf=0;svg.remove();delete scene.dataset.motionState;}
 build();document.fonts?.ready.then(()=>{if(!dead)build();});schedule();
 return{cleanup,setPaused,restart,getState(){return{id:slide.id,active:true,reduced:false,elapsed,phase:finished?'settled':elapsed<900?'read':'event',finished,paused,cycle:0,duration:plan.duration};}};
}
function buildEvent(kind,{make,box,progress,ease}){
 const move=(el,x,y)=>el.setAttribute('transform',`translate(${x} ${y})`);
 const line=(x1,y1,x2,y2,cls='event-route')=>make('path',{d:`M${x1} ${y1}L${x2} ${y2}`,class:cls});
 const label=(text,x,y,parent,cls='event-label')=>{const el=make('text',{x,y,class:cls},parent);el.textContent=text;return el;};
 if(kind==='transfer'){
  const source=box('.n-return .astra-code'),target=box('.n-transfer [data-record="T-101"]');
  const a={x:source.x+source.w-66,y:source.y+source.h/2},b={x:target.x-43,y:target.y+target.h/2};
  // A returned record becomes a compact evidence tag; the underlying fact stays readable.
  const dock=line(b.x+32,b.y,target.x-5,b.y);const token=make('g',{'data-event-object':'record'});
  const rect=make('rect',{class:'event-token',rx:9},token);label('T-101',0,-10,token);const status=label('done',0,14,token);status.setAttribute('class','event-label event-status');
  return ms=>{const t=ease(progress(ms,1100,3100)),compact=ease(progress(ms,2600,3500));const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t-25*Math.sin(Math.PI*t);move(token,x,y);const w=96-32*compact,h=60-28*compact;rect.setAttribute('x',-w/2);rect.setAttribute('y',-h/2);rect.setAttribute('width',w);rect.setAttribute('height',h);token.querySelector('text').setAttribute('y',-10+10*compact);status.style.opacity=String(1-compact);dock.style.opacity=String(.38*compact);};
 }
 if(kind==='exchange'){
  const lane=box('.n-protocol-lines'),x0=lane.x+28,x1=lane.x+lane.w-28,y0=lane.y,y1=lane.y+lane.h;
  const request=make('g',{class:'event-mcp','data-event-object':'request'});make('rect',{x:-29,y:-14,width:58,height:28,rx:14,class:'event-token'},request);label('조회',0,0,request);
  const result=make('g',{'data-event-object':'response'});for(let i=2;i>=0;i--)make('rect',{x:-35+i*4,y:-14-i*4,width:70,height:28,rx:4,class:'event-token'},result);label('자료',0,0,result);
  return ms=>{const out=ease(progress(ms,1000,2450)),back=ease(progress(ms,3450,5350));move(request,x0+(x1-x0)*out,y0);move(result,x1-(x1-x0)*back,y1+9);request.style.opacity=ms>2800?'.48':'1';result.style.opacity=ms<3150?'0':String(Math.min(1,(ms-3150)/200));};
 }
 if(kind==='comparison'){
  const left=box('.n-comparison>div:first-child .n-report'),right=box('.n-comparison>div:last-child .n-report');
  const known=box('.n-comparison>div:first-child [data-record="I-08"]'),footer=box('.n-comparison>div:first-child footer');
  const x0=left.x+left.w+8,x1=right.x-8,c=(x0+x1)/2,knownY=known.y+known.h/2,changeY=footer.y+footer.h/2;
  // The upper correspondence never changes. Only the schedule evidence separates.
  line(x0,knownY,c-12,knownY,'event-link');line(c+12,knownY,x1,knownY,'event-link');label('=',c,knownY);label('I-08',c,knownY-20).setAttribute('class','event-label event-caption');
  const leftHalf=line(x0,changeY,c,changeY,'event-link'),rightHalf=line(c,changeY,x1,changeY,'event-link');
  const fixed=make('rect',{x:x0-4,y:changeY-4,width:8,height:8,rx:2,class:'event-anchor'});
  const missing=make('rect',{x:x1-4,y:changeY-4,width:8,height:8,rx:2,class:'event-anchor'});
  label('M-03',c,changeY+23).setAttribute('class','event-label event-caption');
  const breakMark=label('≠',c,changeY);breakMark.style.opacity='0';
  return ms=>{const t=ease(progress(ms,1800,3150));leftHalf.setAttribute('d',`M${x0} ${changeY}H${c-13*t}`);rightHalf.setAttribute('d',`M${c+13*t} ${changeY}H${x1}`);rightHalf.style.opacity=String(1-.65*t);fixed.style.fill='var(--a-tool)';missing.style.fill='var(--a-paper)';missing.setAttribute('stroke-dasharray',t>.5?'2 2':'none');breakMark.style.opacity=String(ease(progress(ms,2900,3400)));};
 }
 throw new Error(`Unknown information event: ${kind}`);
}
window.DeckMotion={mount,plans,version:'motion-rhythm-1',motionIds:slides.filter(s=>s.motion).map(s=>s.id)};
})();
