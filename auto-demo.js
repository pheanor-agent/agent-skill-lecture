/* Explanatory timelines: the audience watches a complete example, not a UI test. */
(() => {
'use strict';
const plans={
3:[['자료 접근','도구·연결·권한을 확인한다'],['팀 공통 기준','프로젝트 지침으로 남긴다'],['반복되는 순서','Skill 절차로 묶는다']],
11:[['날짜는 KST 기준','AGENTS.md · 공통 지침'],['완료 과제 조회','Tool call · 구체 행동'],['외부 시스템 연결 규약','MCP · 연결'],['수집 → 분류 → 검증 → 작성','Skill · 업무 절차']],
18:[['모호한 설명','무엇을 언제 하는지 부족하다'],['목적과 시점이 있는 설명','업무의 결과와 사용 조건을 함께 쓴다'],['과도하게 넓은 설명','한 업무와 한 결과물로 줄인다']],
19:[['Codex','.agents/skills/weekly-brief/SKILL.md'],['Claude Code','.claude/skills/weekly-brief/SKILL.md']],
25:[['날짜·수치·미확인 표시','프로젝트 전반에 적용하는 공통 지침'],['주간보고서의 구역·확인 순서','이 업무에 적용하는 Skill 절차']],
30:[['발견','호스트의 경로와 SKILL.md 형식'],['선택·읽기','description과 요청, 본문 로드'],['실행','도구·권한·실행 의존성'],['결과 기준','원자료·예외·완료 기준 대조']],
31:[['403 접근 거부','도구·연결 환경의 접근 권한'],['매번 다른 보고서 순서','Skill의 순서와 완료 기준'],['프로젝트의 모든 날짜가 UTC','공통 지침의 시간 기준']]
};
const fieldValues=['매주 금요일, 팀의 주간보고서 초안이 필요할 때','이번 주 과제·이슈·회의 메모','기간 확인 → 자료 수집 → 상태 분류 → 근거 확인','완료·진행·막힘 세 구역, 항목별 근거와 누락 표시가 있는 초안'];
const leadCopy={3:'자료·기준·절차에서 생기는 문제를 차례로 살펴봅니다.',11:'같은 문장이라도 담당하는 역할은 다릅니다.',18:'업무의 목적과 사용 시점이 드러나는 설명을 비교합니다.',25:'적용 범위에 따라 공통 지침과 업무 절차를 나눕니다.',30:'발견부터 결과 확인까지 순서대로 점검합니다.',31:'증상에서 먼저 확인할 위치를 찾습니다.'};
const titles={3:'문제는 서로 다른 곳에서 생긴다',11:'문장마다 맡는 역할이 다르다',18:'설명에는 목적과 시점을 담는다',25:'공통 기준과 업무 절차를 나눈다',31:'증상에서 고칠 위치를 찾는다',34:'한 업무를 네 줄로 정의한다'};
const noteRevisions={3:'자료 접근, 팀 공통 기준, 반복 순서의 세 문제가 자동으로 강조됩니다. 각 5초의 시연에서 무엇이 부족한지 설명하고 마지막 비교 화면에서 도구·연결, 공통 지침, Skill의 역할을 연결합니다. 필요하면 P로 잠시 멈춰 청중의 사례를 듣습니다.',6:'같은 도구 호출의 성공과 접근 거부를 자동으로 비교합니다. 반환된 자료가 있을 때는 근거를 기록하고, 접근할 수 없을 때는 미확인 표시와 권한 확인으로 이어지는 점을 설명합니다. 마지막 비교 화면을 충분히 읽습니다.',11:'네 문장이 각 역할에 자동으로 분류됩니다. 날짜 기준은 공통 지침, 구체 조회는 Tool call, 연결 규약은 MCP, 업무 순서는 Skill입니다. 마지막 전체 대응표로 적용 범위가 다름을 확인합니다.',15:'이름과 설명, 본문, 필요한 부록이 5초 간격으로 읽은 문맥에 추가됩니다. 읽지 않은 자료는 그대로 남아 있다는 점을 설명하고, 전체 파일을 매번 한꺼번에 넣는 구조와 구분합니다.',18:'모호한 설명, 구체적인 목적과 시점이 있는 설명, 과도한 설명을 차례로 비교합니다. 마지막에 좋은 설명이 다시 강조됩니다. 실제 description에는 어떤 일인지와 언제 사용하는지를 함께 적습니다.',19:'Codex와 Claude Code의 경로가 자동으로 바뀐 뒤 나란히 비교됩니다. 표준 폴더 형식과 호스트가 찾는 위치·호출 문법을 구분합니다. 경로는 공식 문서의 확인 날짜를 기준으로 설명합니다.',21:'진입하면 26초의 9단계 자동 시연이 시작됩니다. 무엇을 읽었고 무엇을 실행했는지 구분하며 설명합니다. 완성 보고서는 10초 유지된 뒤 반복됩니다. 완료1·진행1·막힘1 및 근거가 맞는지 함께 봅니다. R은 처음부터, P는 일시정지입니다.',22:'메모가 있는 상태와 누락된 상태를 자동으로 비교합니다. 누락은 검토 일정의 미확인을 뜻하며, 이슈 I-08에서 이미 확인된 막힘 1건은 사라지지 않습니다. 알 수 없는 것을 없음으로 바꾸지 않는 절차를 설명합니다.',25:'네 문장이 적용 범위에 따라 순차적으로 분류됩니다. 프로젝트 전체의 날짜·근거 기준은 공통 지침이고, 주간보고서의 구역·확인 순서는 특정 업무의 Skill 절차입니다.',30:'발견, 선택·읽기, 도구 실행, 결과 기준이 순서대로 강조됩니다. 무엇이 안 되는지를 먼저 좁혀야 경로·description·권한·절차 중 바꿀 곳을 찾을 수 있다는 점을 설명합니다.',31:'403 오류, 매번 다른 구역 순서, UTC 날짜의 세 증상이 자동으로 원인 위치에 연결됩니다. 접근 권한은 도구·연결 환경, 보고서 순서는 Skill, 프로젝트의 시간 기준은 공통 지침에서 먼저 확인합니다.',34:'빈 네 칸에 언제, 입력, 순서, 완료 기준의 예문이 차례로 나타납니다. 글자별 입력 효과 없이 의미 단위 전체를 보여 줍니다. 완성된 네 줄을 자신의 반복 업무에 대입해 보도록 설명합니다.'};
for(const slide of window.ASTRA_SLIDES||[]){if(titles[slide.id])slide.title=titles[slide.id];if(noteRevisions[slide.id])slide.notes=noteRevisions[slide.id];}
function mount(root,slide,{reduced=false}={}){
 const scene=root.querySelector('.astra-scene');if(!scene)return{cleanup(){},setPaused(){},restart(){}};
 const id=Number(slide.id),q=s=>scene.querySelector(s),qa=s=>[...scene.querySelectorAll(s)];
 if(titles[id]){q('.astra-slide-heading h2')&&(q('.astra-slide-heading h2').textContent=titles[id]);}
 if(leadCopy[id]&&q('.astra-lead'))q('.astra-lead').textContent=leadCopy[id];
 scene.classList.add('autoplay-scene');scene.querySelectorAll('[aria-live]').forEach(e=>e.setAttribute('aria-live','off'));
 qa('button').forEach(b=>{b.tabIndex=-1;b.disabled=true;b.setAttribute('aria-disabled','true');b.classList.add('auto-visual-option');});
 qa('.astra-controls,.astra-reset,[data-astra-action="sort-next"],[data-astra-action="copy"],[data-astra-action="example"]').forEach(b=>{b.hidden=true;b.classList.add('auto-hidden-control');});
 const fields=qa('textarea').map((input,i)=>{const div=document.createElement('div');div.className='auto-field';div.dataset.autoField=i;div.textContent='';input.replaceWith(div);return div;});
 const originalHidden=new Map([...scene.children].map(c=>[c,c.hidden]));let overview=null,events=[],timer=null,elapsed=0,started=0,cursor=0,paused=true,dead=false,cycle=0;
 const clean=()=>{qa('.astra-feedback,[data-boundary-feedback]').forEach(e=>{e.textContent=e.textContent.replace(/^(맞습니다\.|좋습니다\.|다시 생각해 보세요\.)\s*/,'').replace('선택하면 이유를 함께 확인합니다.','').replace('아직 선택하지 않았습니다.','').replace('문제의 위치를 골라 보세요.','').replace('점검할 단계를 선택해 보세요.','').replace('역할을 골라 이유를 확인하세요.','').replace('가장 먼저 확인할 위치를 고르세요.','증상과 관련된 위치를 차례로 확인합니다.');});};
 const click=selector=>{q(selector)?.dispatchEvent(new MouseEvent('click',{bubbles:true}));clean();};
 function showOverview(rows){if(!rows)return;for(const [c]of originalHidden)if(!c.matches('.astra-slide-heading,.astra-hint,.astra-sim'))c.hidden=true;overview=document.createElement('div');overview.className='auto-overview';rows.forEach(([label,detail])=>{const p=document.createElement('p'),b=document.createElement('b');b.textContent=label;p.append(b,document.createElement('br'),document.createTextNode(detail));overview.append(p);});const anchor=[...scene.children].find(c=>c.matches('.astra-hint,.astra-sim'));scene.insertBefore(overview,anchor||null);scene.dataset.demoPhase='overview';}
 function reset(){overview?.remove();overview=null;for(const [c,h]of originalHidden)c.hidden=h;click('[data-astra-action="reset"]');fields.forEach(f=>{f.textContent='';f.classList.remove('is-current');});clean();qa('.auto-active').forEach(e=>e.classList.remove('auto-active'));if(id===21&&q('[data-demo-caption]'))q('[data-demo-caption]').textContent='기간과 결과물을 확인하며 자동 시연이 시작됩니다.';if(id===34&&q('.astra-feedback'))q('.astra-feedback').textContent='한 업무를 언제·입력·순서·완료 기준으로 구체화합니다.';scene.dataset.demoPhase='ready';}
 const at=(seconds,fn)=>events.push({time:seconds*1000,fn});
 const action=(seconds,selector)=>at(seconds,()=>click(selector));
 let duration=0;
 switch(id){
 case 3: [0,1,2].forEach((n,i)=>action(1.5+i*5,`[data-choice="${n}"]`));at(16.5,()=>showOverview(plans[3]));duration=24500;break;
 case 6: action(1.5,'[data-result="ok"]');action(7.5,'[data-result="error"]');at(13.5,()=>showOverview([['조회 성공 → 항목과 근거를 기록','반환된 자료로 완료 구역을 채운다'],['접근 불가 → 미확인으로 남김','권한을 확인하며, 없는 수치를 만들지 않는다']]));duration=21500;break;
 case 11: ['agents','tool','mcp','skill'].forEach((role,i)=>{at(1.5+i*5,()=>{if(i)click('[data-astra-action="sort-next"]');click(`[data-role="${role}"]`);});});at(21.5,()=>showOverview(plans[11]));duration=29500;break;
 case 15: [0,1,2].forEach((n,i)=>action(1.5+i*5,`[data-load="${n}"]`));duration=24500;break;
 case 18: action(1.5,'[data-choice="0"]');action(6.5,'[data-choice="1"]');action(13.5,'[data-choice="2"]');at(18.5,()=>{click('[data-choice="1"]');});duration=26500;break;
 case 19: action(1.5,'[data-host="codex"]');action(8.5,'[data-host="claude"]');at(15.5,()=>showOverview(plans[19]));duration=23500;break;
 case 21: {let t=1.5;[3,3,3,3,4,3,3,2,2].forEach((d,n)=>{action(t,`[data-astra-action="demo-jump"][data-step="${n}"]`);t+=d;});duration=35500;break;}
 case 22: action(1.5,'[data-missing="false"]');action(7.5,'[data-missing="true"]');duration=22500;break;
 case 25: [0,1,2,3].forEach((n,i)=>action(1.5+i*5,`[data-item="${n}"][data-answer="${n<2?'agents':'skill'}"]`));duration=29500;break;
 case 30: [0,1,2,3].forEach((n,i)=>action(1.5+i*5,`[data-diag="${n}"]`));at(21.5,()=>showOverview(plans[30]));duration=29500;break;
 case 31: [0,1,2].forEach((n,i)=>{action(1.5+i*7,`[data-case="${n}"]`);action(4.5+i*7,`[data-astra-action="case-answer"][data-answer="${n}"]`);});at(22.5,()=>showOverview(plans[31]));duration=30500;break;
 case 34: fields.forEach((f,i)=>at(3+i*4,()=>{fields.forEach(x=>x.classList.remove('is-current'));f.textContent=fieldValues[i];f.classList.add('is-current');}));at(19,()=>fields.forEach(x=>x.classList.remove('is-current')));duration=29000;break;
 default: duration=0;
 }
 function still(){reset();if(plans[id]){showOverview(plans[id]);return;}if(id===6){showOverview([['조회 성공','항목과 근거를 기록한다'],['접근 불가','미확인 표시 후 권한을 확인한다']]);return;}if(id===15)click('[data-load="2"]');if(id===21)click('[data-astra-action="demo-jump"][data-step="8"]');if(id===22)click('[data-missing="true"]');if(id===25)[0,1,2,3].forEach(n=>click(`[data-item="${n}"][data-answer="${n<2?'agents':'skill'}"]`));if(id===34)fields.forEach((f,i)=>f.textContent=fieldValues[i]);scene.dataset.demoPhase='still';}
 function apply(){while(cursor<events.length&&events[cursor].time<=elapsed){events[cursor].fn();scene.dataset.demoPhase=String(cursor+1);cursor++;}scene.dataset.demoCycle=String(cycle);}
 function schedule(){if(dead||paused||!duration||reduced)return;const target=cursor<events.length?events[cursor].time:duration;timer=setTimeout(()=>{elapsed=performance.now()-started;if(elapsed>=duration){cycle++;reset();cursor=0;elapsed=0;started=performance.now();}apply();schedule();},Math.max(1,target-elapsed));}
 function setPaused(value){if(dead||reduced)return;if(Boolean(value)===paused)return;if(value){elapsed=performance.now()-started;clearTimeout(timer);timer=null;paused=true;}else{paused=false;started=performance.now()-elapsed;schedule();}scene.dataset.demoPaused=String(paused);}
 function restart(){if(dead)return;clearTimeout(timer);elapsed=0;cursor=0;cycle=0;reset();if(reduced){still();return;}started=performance.now();schedule();}
 reset();if(reduced)still();else setPaused(false);
 return{setPaused,restart,cleanup(){dead=true;clearTimeout(timer);timer=null;},getState(){return{id,elapsed:paused?elapsed:performance.now()-started,phase:cursor,cycle,paused,reduced};}};
}
window.AutoDemo={mount,version:'2.0'};
})();
