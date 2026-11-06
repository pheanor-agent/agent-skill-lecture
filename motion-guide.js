/* Astra motion direction. A finite visual reading path; the complete text never changes. */
(() => {
'use strict';
const slides=window.ASTRA_SLIDES||[], NS='http://www.w3.org/2000/svg';
const cue=(target,kind='underline',color='skill',extra={})=>({target,kind,color,...extra});
const series=(selector,count,kind='underline',color='skill')=>Array.from({length:count},(_,i)=>cue(`${selector}:nth-child(${i+1})`,kind,color));
const plans={
1:{name:'매주의 종이에서 반복 가능한 결과로',cues:[cue('.astra-paper-stack>span:nth-child(1)','underline'),cue('.astra-paper-stack>span:nth-child(2)','underline'),cue('.astra-report-row:nth-child(4)','ink'),cue('.astra-report-row:nth-child(5)','ink'),cue('.astra-report-row:nth-child(6)','ink'),cue('.astra-cover-line','underline')]},
2:{name:'요청 → 원자료 → 결과의 세 구역',cues:[cue('.astra-request','bracket'),cue('.astra-source-strip','underline','tool'),cue('.astra-report-row:nth-child(4)','ink','tool'),cue('.astra-report-row:nth-child(5)','ink','tool'),cue('.astra-report-row:nth-child(6)','ink','tool')]},
3:{name:'문제와 대응을 한 행씩 연결',cues:series('.rest-row',3,'scan')},
4:{name:'이름과 입력을 보내고 결과로 돌아오는 한 바퀴',cues:[cue('.astra-loop-image','loop','tool',{hold:5800})]},
5:{name:'요청 → 이름과 입력 → 반환 결과',cues:[cue('.astra-io-request','bracket','tool'),cue('.astra-io-call','frame','tool',{from:'.astra-io-request'}),cue('.astra-io-result','frame','tool',{from:'.astra-io-call'})]},
6:{name:'성공과 오류를 각각 다음 행동에 연결',cues:[cue('.rest-panel:first-child .astra-code','underline','tool'),cue('.rest-panel:first-child>p','bracket','tool'),cue('.rest-panel:last-child .astra-code','underline'),cue('.rest-panel:last-child>p','bracket')]},
7:{name:'하나의 에이전트에서 여러 자료로 갈라지는 연결',cues:['.p1','.p2','.p3'].map(s=>cue(`.astra-port${s}`,'frame','mcp',{from:'.astra-port-center',route:'direct'}))},
8:{name:'공통 메시지의 왕복과 별도의 내장 경로',cues:[cue('.astra-protocol svg','exchange','mcp',{hold:3400}),cue('.astra-local-route','underline','tool')]},
9:{name:'기능·데이터·템플릿의 세 종류를 개별 확인',cues:series('.astra-shelf>article',3,'frame','mcp')},
10:{name:'공통 기준 아래 세 규칙을 읽는 리듬',cues:[cue('.astra-rule-banner','underline','agents'),...series('.astra-rules>div',3,'bracket','agents')]},
11:{name:'네 문장의 역할을 독립적으로 대응',cues:['agents','tool','mcp','skill'].map((c,i)=>cue(`.rest-row:nth-child(${i+1})`,'scan',c))},
12:{name:'업무 질문에서 패키지의 필수 파일로',cues:[cue('.astra-statement','bracket'),cue('.astra-folder','frame'),cue('.astra-file','underline')]},
13:{name:'필수 파일을 먼저, 선택 자료를 뒤에',cues:[cue('.astra-file:not(.astra-file-small)','underline'),...series('.astra-file-legend>div',4,'scan')]},
14:{name:'description의 결과와 사용 시점에 밑줄',cues:[cue('[data-motion-line="3"], [data-motion-line="4"]','bracket'),cue('.astra-code-annotation:nth-child(2)','underline'),cue('[data-motion-line="5"]','underline'),cue('.astra-code-annotation:nth-child(3)','underline')]},
16:{name:'공개에서 표준화까지 이어지는 시간선',cues:[cue('.astra-timeline article:first-child','bracket'),cue('.astra-time-line','timeline'),cue('.astra-timeline article:last-child','bracket')]},
17:{name:'같은 모델은 유지하고 문맥에만 더하기',cues:[cue('.astra-before-after article:first-child>b, .astra-before-after article:last-child>b','underline','tool'),cue('.astra-before-after article:last-child .astra-desk>span:nth-child(2)','frame'),cue('.astra-before-after article:last-child .astra-desk>span:nth-child(3)','frame')]},
18:{name:'모호함과 넓은 범위를 지나 구체적인 설명에 정착',cues:[cue('.rest-description article:first-child','bracket'),cue('.rest-description article:last-child','bracket'),cue('.rest-recommended','frame')]},
19:{name:'두 호스트에서 같은 범위끼리 대조',cues:[cue('.rest-hosts .astra-code:nth-of-type(1)','bracket','tool'),cue('.rest-hosts .astra-code:nth-of-type(2)','bracket','agents'),cue('.rest-hosts .rest-panel>p','underline')]},
20:{name:'명시 호출과 자동 선택이라는 독립 경로',cues:[cue('.astra-invoke article:first-child','frame'),cue('.astra-invoke article:last-child','frame'),cue('.astra-scene-20>.astra-hint','underline')]},
22:{name:'막힘 1건은 같고, 일정의 근거만 다름',cues:[cue('.rest-evidence>b','underline'),cue('.rest-panel:first-child .rest-result','bracket','tool'),cue('.rest-panel:last-child .rest-result','bracket')]},
23:{name:'본문의 실행 순서를 따라가고 완료 기준에 닿기',cues:[cue('[data-motion-line="2"], [data-motion-line="3"]','bracket'),cue('[data-motion-line="4"], [data-motion-line="5"], [data-motion-line="6"]','bracket'),cue('[data-motion-line="8"]','underline'),...[2,3,4].map(i=>cue(`.astra-checklist>p:nth-child(${i})`,'underline'))]},
24:{name:'핵심 절차에서 필요한 자료로 분기',cues:[cue('.astra-reference-core','bracket'),...Array.from({length:3},(_,i)=>cue(`.astra-reference-leaf:nth-child(${i+2})`,'frame','skill',{from:'.astra-reference-core'}))]},
25:{name:'넓은 공통 범위와 좁은 업무 범위를 각각 묶기',cues:[cue('.rest-panel:first-child','frame','agents'),cue('.rest-panel:last-child','frame'),cue('.rest-result','underline')]},
26:{name:'입력 상황 → 기대 동작 → 확인 기준',cues:[2,3,4].map(i=>cue(`.astra-eval>div:nth-child(${i})`,'scan','mcp'))},
27:{name:'옮길 절차와 다시 확인할 환경 구분',cues:[cue('.astra-portability .astra-folder','frame'),cue('.astra-workbench','bracket','tool'),cue('.astra-four-checks','scan','tool'),cue('.astra-lead','underline')]},
28:{name:'공통 기준·업무 절차·외부 연결·별도 경로의 관계',cues:[cue('.astra-map-rule','underline','agents'),cue('.astra-map-skill','frame'),cue('.astra-map-connection','map','mcp',{hold:3000}),cue('.astra-map-local','underline','tool'),cue('.astra-role-legend','scan')]},
29:{name:'결핍에서 필요한 역할로 읽기',cues:series('.astra-decision>div',4,'scan')},
30:{name:'발견부터 결과 대조까지 진단 위치를 좁히기',cues:series('.rest-diagnosis>article',4,'frame')},
31:{name:'증상 → 먼저 확인할 위치 → 이유',cues:series('.rest-row',3,'scan')},
32:{name:'문서·환경·요청 범위를 각각 분리해 확인',cues:[1,3,5].map(i=>cue(`.astra-authority>article:nth-child(${i})`,'bracket','agents')).concat(cue('.astra-lead','underline'))},
33:{name:'넓은 범위를 한 결과물로 좁히고 네 조건 확인',cues:[cue('.astra-scope-wide','bracket'),cue('.astra-scope-small','scope'),cue('.astra-four-checks','scan')]},
34:{name:'언제 → 입력 → 순서 → 완료 기준의 네 줄',cues:series('.rest-example>article',4,'bracket')},
35:{name:'세 동사를 회수하고 실제 결과물에 정착',cues:[...series('.astra-closing-line',3,'underline'),cue('.astra-closing-folder','frame')]},
36:{name:'세 질문을 건넨 뒤 대화를 위한 정지',cues:series('.astra-qa>div>p',3,'underline','mcp')}
};
for(const slide of slides){
 slide.motion=true;
 const p=plans[slide.id];
 if(p){slide.motionDescription=p.name;slide.motionDuration=1000+p.cues.reduce((n,c)=>n+(c.hold||1900),0)+600;}
 else {slide.motionDescription='구획된 과정 시연을 한 번 재생한 뒤 완결된 상태 유지';slide.motionDuration=slide.id===15?18000:27500;}
 // Keep old presenter commentary accurate after adding the finite reading guide.
 slide.notes=slide.notes.replace('자동 강조가 없으므로','설명은 그대로 유지되므로').replace('타이머가 다른 단계로 강조를 옮기지 않습니다.','도입 강조가 끝나면 발표자가 필요한 단계에서 충분히 설명합니다.').replace('정적인 비교만으로','나란히 놓인 비교로').replace('모두 보이는 정적 대응표','모두 보이는 대응표');
 slide.notes+=` 도입 모션: ${slide.motionDescription}. 약 ${Math.round(slide.motionDuration/1000)}초 뒤 멈추며, 읽는 내용은 처음부터 모두 표시됩니다. P로 멈추고 R로 다시 볼 수 있습니다.`;
}
function mount(root,slide,{reduced=false}={}){
 if(slide.demo)return window.AutoDemo.mount(root,slide,{reduced});
 const scene=root.querySelector('.astra-scene'),plan=plans[slide.id];
 if(!scene||!plan)return window.AutoDemo.mount(root,slide,{reduced});
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
     add(`M${b.x+5} ${b.y+b.h*.3}H${b.x+b.w-10}`,{route:true});add(`M${b.x+b.w-5} ${b.y+b.h*.75}H${b.x+10}`,{route:true,second:true});
    }else if(item.kind==='map'){
     const bridge=box(el.querySelector('.astra-bridge'));add(`M${bridge.x} ${bridge.y+1}H${bridge.x+bridge.w}`,{route:true});
     add(`M${bridge.x+bridge.w} ${bridge.y+bridge.h-1}H${bridge.x}`,{route:true,second:true});
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
   g.targets.forEach(el=>el.style.setProperty('--motion-focus',active&&!['loop','exchange','map','timeline','ink'].includes(g.item.kind)?String(Math.sin(Math.PI*t)*.075):'0'));
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
window.DeckMotion={mount,plans,version:'1.0',motionIds:slides.map(s=>s.id)};
})();
