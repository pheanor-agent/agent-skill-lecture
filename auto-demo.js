/* Complete explanations are static. Only two bounded process diagrams move once. */
(() => {
'use strict';
const slides=window.ASTRA_SLIDES||[];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lead=s=>`<p class="astra-lead" data-page-text>${s}</p>`;
const hint=s=>`<p class="astra-hint" data-page-text>${s}</p>`;
const row=(a,b,c='')=>`<div class="rest-row"><strong>${a}</strong><p>${b}</p>${c?`<span>${c}</span>`:''}</div>`;
const panel=(label,body,kind='')=>`<article class="rest-panel ${kind}"><h3>${label}</h3>${body}</article>`;
const paragraph=s=>`<p>${s}</p>`;
const badge=(s,c)=>`<span class="astra-tag astra-${c}">${s}</span>`;
const code=s=>`<pre class="astra-code"><code>${esc(s)}</code></pre>`;
const fixed={
3:lead('자료 접근 · 공통 기준 · 반복 절차는 서로 다른 문제입니다.')+`<div class="rest-table">${row('자료를 가져오지 못한다','도구·연결·접근 권한을 확인한다','행동과 연결')}${row('팀의 기준이 빠진다','프로젝트 공통 지침으로 남긴다','AGENTS.md')}${row('매번 보고서 형식이 다르다','작성 순서와 완료 기준을 묶는다','Skill')}</div>`+hint('부족한 곳을 구분하면 무엇부터 고칠지 보입니다.'),
6:lead('같은 호출도 반환 결과에 따라 다음 행동이 달라집니다.')+`<div class="rest-columns">${panel('조회 성공',code('{ id: "T-101", status: "done" }')+paragraph('완료 구역에 항목을 넣고<br><b>근거 T-101을 남깁니다.</b>'),'rest-blue')}${panel('접근 불가',code('{ status: "access_denied" }')+paragraph('접근 권한을 확인하고<br><b>초안에는 미확인을 표시합니다.</b>'),'rest-warm')}</div>`+hint('실행 요청을 보낸 것과 요청한 일이 끝난 것은 다릅니다.'),
11:lead('문장의 역할은 적용 범위와 행동의 종류로 구분합니다.')+`<div class="rest-table">${row('날짜는 KST 기준',badge('AGENTS.md','agents'),'프로젝트 공통 기준')}${row('완료 과제를 조회한다',badge('Tool call','tool'),'구체적인 실행 요청')}${row('외부 시스템 연결 규약',badge('MCP','mcp'),'기능·문맥을 주고받는 방식')}${row('수집 → 분류 → 검증 → 작성',badge('Skill','skill'),'특정 업무의 절차')}</div>`+hint('네 역할은 함께 쓸 수 있으며, 모두 필요한 직렬 관문은 아닙니다.'),
18:lead('좋은 description에는 결과와 사용 시점이 함께 드러납니다.')+`<div class="rest-description"><article><span>너무 모호함</span><p>“보고서를 돕는다.”</p><small>어떤 보고서인지, 언제 쓰는지 부족합니다.</small></article><article class="rest-recommended"><span>목적 + 사용 시점</span><p>“주간업무를 완료·진행·막힘으로 정리한다.<br>주간보고서 초안 요청에 사용한다.”</p><small>결과의 형태와 적용 범위를 판단할 수 있습니다.</small></article><article><span>너무 넓음</span><p>“모든 업무를 완벽하게 처리한다.”</p><small>한 업무와 한 결과물로 범위를 줄입니다.</small></article></div>`,
19:lead('스킬의 폴더 형식과 호스트가 찾는 위치는 구분합니다.')+`<div class="rest-columns rest-hosts">${panel('Codex',`<span>프로젝트</span>${code('.agents/skills/weekly-brief/\n└── SKILL.md')}<span>사용자</span>${code('~/.agents/skills/weekly-brief/\n└── SKILL.md')}<p>명시 호출 <b>$weekly-brief</b></p>`)}${panel('Claude Code',`<span>프로젝트</span>${code('.claude/skills/weekly-brief/\n└── SKILL.md')}<span>사용자</span>${code('~/.claude/skills/weekly-brief/\n└── SKILL.md')}<p>명시 호출 <b>/weekly-brief</b></p>`)}</div>`+hint('2026-11-04 공식 문서 확인 · 실제 사용 전 제품 버전과 조직 정책을 확인합니다.'),
22:lead('회의 메모가 없어도, 이미 확인된 막힘은 사라지지 않습니다.')+`<div class="rest-columns">${panel('메모 M-03 있음',`<div class="rest-evidence">I-08 · 디자인 검토 대기 <b>막힘 1건</b></div>${paragraph('M-03: 다음 주 목요일 검토 예정')}<div class="rest-result">보고서: 목요일 검토 예정<br><small>근거 I-08 · M-03</small></div>`)}${panel('메모 M-03 누락',`<div class="rest-evidence">I-08 · 디자인 검토 대기 <b>막힘 1건</b></div>${paragraph('회의 메모를 확인하지 못함')}<div class="rest-result rest-warm">보고서: 검토 일정 미확인<br><small>다음 확인: 회의 메모 M-03</small></div>`)}</div>`+hint('모르는 것은 검토 일정입니다. 자료 누락을 “막힘 없음”으로 바꾸지 않습니다.'),
25:lead('프로젝트 전체의 기준과 특정 업무의 절차를 나눕니다.')+`<div class="rest-columns">${panel('공통 지침 · AGENTS.md',`<ul><li>모든 수치에는 근거를 남긴다.</li><li>모든 날짜는 KST로 표현한다.</li></ul><div class="rest-result">여러 작업에 같은 기준 적용</div>`,'rest-violet')}${panel('업무 절차 · Skill',`<ul><li>주간보고서는 완료 → 진행 → 막힘 순서.</li><li>지난주 대비 변동을 확인한다.</li></ul><div class="rest-result">주간보고서라는 업무에 적용</div>`,'rest-warm')}</div>`+hint('실제 배치는 프로젝트 범위에 따라 달라질 수 있습니다. 기준의 정본을 분명히 둡니다.'),
30:lead('실패한 단계를 좁히면 수정할 곳이 보입니다.')+`<div class="rest-diagnosis">${[['01','발견됐나?','호스트의 탐색 경로<br>폴더와 SKILL.md 형식'],['02','선택·읽기?','description과 요청의 관계<br>본문을 실제로 읽었는지'],['03','실행됐나?','도구의 반환 오류<br>권한과 실행 의존성'],['04','기준 충족?','원자료와 결과 대조<br>예외와 완료 기준']].map(([n,t,p])=>`<article><span>${n}</span><h3>${t}</h3><p>${p}</p></article>`).join('')}</div>`+hint('앞 단계의 문제를 뒤 단계의 프롬프트 수정만으로 해결할 수는 없습니다.'),
31:lead('증상에서 가장 먼저 확인할 위치를 찾습니다.')+`<div class="rest-table">${row('403 접근 거부','도구·연결 환경의 접근 권한','MCP가 있어도 권한은 필요')}${row('매번 다른 보고서 순서','Skill의 순서와 완료 기준','구역 순서를 절차에 명시')}${row('프로젝트의 모든 날짜가 UTC','공통 지침의 시간 기준','KST 기준의 적용 범위 확인')}</div>`+hint('실제 원인은 여러 곳에 걸칠 수 있습니다. 먼저 확인할 위치를 좁히는 예입니다.'),
34:lead('주간보고서 업무를 네 줄로 정의한 예입니다.')+`<div class="rest-example">${[['언제','매주 금요일, 팀의 주간보고서 초안이 필요할 때'],['입력','이번 주 과제 · 이슈 · 회의 메모'],['순서','기간 확인 → 자료 수집 → 상태 분류 → 근거 확인'],['완료 기준','완료·진행·막힘 세 구역, 항목별 근거, 누락 표시가 있는 초안']].map(([a,b],i)=>`<article><span>0${i+1} · ${a}</span><p>${b}</p></article>`).join('')}</div>`+hint('내 반복 업무도 한 결과물로 좁혀, 입력과 완료 기준부터 적어 보세요.')
};
const svgText=(x,y,text,cls='')=>`<text x="${x}" y="${y}" class="${cls}">${text}</text>`;
const loadSvg=`<svg viewBox="0 0 1360 380" role="img" aria-label="스킬의 이름과 설명, 본문, 필요한 부록을 차례로 읽어 작업 문맥에 더하는 과정"><text x="245" y="38" class="rest-svg-label">스킬 폴더</text><text x="1040" y="38" class="rest-svg-label">이번 작업의 문맥</text><rect x="810" y="65" width="500" height="285" rx="20" class="rest-context-bg"/>${[['이름 · description','언제 쓰는지 판단',110],['SKILL.md 본문','업무의 순서와 확인 기준',205],['report-format.md','필요한 상세 형식',300]].map(([t,d,y],i)=>`<path d="M490 ${y}H870" class="rest-wire"/><g data-focus="${i}"><rect x="30" y="${y-35}" width="460" height="74" rx="12" class="rest-file-node"/>${svgText(260,y-3,t)}${svgText(260,y+24,d,'rest-svg-small')}<rect x="870" y="${y-30}" width="380" height="65" rx="10" class="rest-context-item"/>${svgText(1060,y+11,['선택 단서','수행 지침','참고 형식'][i])}</g>`).join('')}<circle data-packet r="8" cx="490" cy="110" class="rest-packet" opacity="0"/></svg>`;
const mapSvg=`<svg viewBox="0 0 850 430" role="img" aria-label="공통 지침과 스킬을 참고하며 연결된 도구로 자료를 조회하고 보고서를 확인하는 과정"><path d="M260 230H710M385 80V140M290 320L355 230" class="rest-wire"/><path d="M755 230V270H385V230" class="rest-wire rest-wire-return"/><g data-focus="0"><rect x="30" y="160" width="195" height="70" rx="13" class="rest-file-node"/>${svgText(127,189,'이번 주 보고서')}${svgText(127,214,'초안 요청','rest-svg-small')}</g><g data-focus="1"><rect x="270" y="18" width="280" height="62" rx="10" class="rest-rule-node"/>${svgText(410,46,'AGENTS.md')}${svgText(410,68,'KST · 근거 · 미확인','rest-svg-small')}</g><g><rect x="270" y="140" width="180" height="100" rx="24" class="rest-agent-node"/>${svgText(360,182,'에이전트')}${svgText(360,213,'다음 행동 선택','rest-svg-small')}</g><g data-focus="3"><rect x="505" y="160" width="135" height="70" rx="10" class="rest-mcp-node"/>${svgText(572,201,'MCP')}</g><g data-focus="4"><rect x="690" y="140" width="135" height="100" rx="12" class="rest-tool-node"/>${svgText(757,178,'조회 도구')}${svgText(757,210,'T-101 · T-102','rest-svg-tiny')}<text x="757" y="230" class="rest-svg-tiny">I-08 · M-03</text></g><g data-focus="2"><rect x="90" y="320" width="300" height="82" rx="12" class="rest-skill-node"/>${svgText(240,353,'weekly-brief')}${svgText(240,383,'순서 · 완료 기준','rest-svg-small')}</g><g data-focus="6"><rect x="475" y="320" width="350" height="82" rx="12" class="rest-file-node"/>${svgText(650,353,'report-format.md')}${svgText(650,383,'필요한 보고서 형식','rest-svg-small')}</g><text x="550" y="130" class="rest-svg-small">Tool call · 자료 조회</text><circle data-packet r="8" cx="225" cy="195" class="rest-packet" opacity="0"/></svg>`;
// Keep labels in the same fixed logical plane as SVG paths; viewport CSS cannot reflow them.
function atomicPlane(markup,width,height,paintWidth){
 const labels=[];
 const shapes=markup.replace(/<text x="([\d.]+)" y="([\d.]+)"(?: class="([^"]*)")?>([\s\S]*?)<\/text>/g,(_,x,y,cls,text)=>{labels.push(`<span class="rest-plane-text ${cls||''}" style="left:${x}px;top:${y}px">${text}</span>`);return '';});
 const scale=paintWidth/width;
 return `<div class="rest-atomic-plane" style="width:${paintWidth}px;height:${height*scale}px"><div class="rest-plane-inner" style="width:${width}px;height:${height}px;transform:scale(${scale})">${shapes}${labels.join('')}</div></div>`;
}
const report=`<article class="rest-demo-report"><div class="rest-report-head">WEEKLY BRIEF · 2026-W44</div><h3>주간업무 보고서</h3><p>10.26–10.30 · KST</p>${[['완료 1','온보딩 가이드 개정','T-101'],['진행 1','설문 결과 정리','T-102'],['막힘 1','디자인 검토 대기','I-08']].map(([a,b,c])=>`<div class="rest-report-item" data-report-row><span>${a}</span><strong>${b}</strong><small>근거 ${c}</small></div>`).join('')}<footer data-report-check>다음 확인: 목요일 검토 예정 · M-03<br>✓ 항목별 근거 · 누락 자료 확인</footer></article>`;
const phases=['요청 확인','공통 지침','Skill 읽기','MCP 연결','도구 반환','상태 분류','형식 참고','기준 대조','초안 완성'];
fixed[15]=lead('선택 단서에서 본문으로, 필요한 부록까지 차례로 읽습니다.')+`<div class="rest-demo-region rest-load-demo" data-demo-region="progressive-reading" data-demo-state="finished" data-demo-phase="3"><div class="rest-demo-label"><span>과정 시연 · 필요한 문맥을 더하기</span><span data-demo-status>읽기 완료</span></div>${atomicPlane(loadSvg,1360,380,1260)}<div class="rest-demo-track" aria-hidden="true"><span data-demo-progress></span></div></div>`+hint('표지 → 본문 → 필요한 부록. 로딩 방식은 호스트마다 다를 수 있습니다. 한 번 시연한 뒤 결과를 유지합니다.');
fixed[21]=lead('공통 지침과 업무 절차를 참고하며, 조회 결과로 초안을 완성합니다.')+`<div class="rest-demo-region rest-report-demo" data-demo-region="weekly-report" data-demo-state="finished" data-demo-phase="9"><div class="rest-demo-label"><span>과정 시연 · 하나의 요청을 끝까지</span><span data-demo-status>초안 완성</span></div><div class="rest-process-layout"><div>${atomicPlane(mapSvg,850,430,700)}</div>${report}</div><ol class="rest-process-steps">${phases.map((p,i)=>`<li data-phase-item="${i}"><span>${String(i+1).padStart(2,'0')}</span>${p}</li>`).join('')}</ol><div class="rest-demo-track" aria-hidden="true"><span data-demo-progress></span></div></div>`+hint('이 사례의 조합이며 네 역할이 필수 관문은 아닙니다. 합성 데이터 · 실제 API 호출 없음 · 한 번 재생 후 유지');
const titles={3:'문제는 서로 다른 곳에서 생긴다',11:'문장마다 맡는 역할이 다르다',18:'설명에는 목적과 시점을 담는다',25:'공통 기준과 업무 절차를 나눈다',31:'증상에서 고칠 위치를 찾는다',34:'한 업무를 네 줄로 정의한다'};
const notes={
3:'세 문제와 대응 위치를 처음부터 함께 보여줍니다. 청중의 경험을 먼저 듣거나, 자료 접근·프로젝트 기준·업무 절차 순서로 설명해도 됩니다. 화면이 바뀌지 않으므로 발표자의 호흡으로 진행합니다. 자료가 없는 문제를 스킬 문구만으로 해결하지 않는다는 점을 강조합니다.',
6:'성공과 접근 불가를 나란히 비교합니다. 성공에서는 항목과 근거를 보고서에 넣고, 접근 불가에서는 미확인 표시와 권한 확인으로 이어집니다. 호출 요청과 작업 완료를 구분합니다. 두 결과를 순환시키지 않으므로 어느 쪽에서든 충분히 설명할 수 있습니다.',
11:'네 문장과 담당 역할이 모두 보이는 정적 대응표입니다. 프로젝트 기준은 AGENTS.md, 구체 행동은 Tool call, 연결 규약은 MCP, 업무 절차는 Skill입니다. 네 개가 같은 계층의 경쟁 제품이나 필수 직렬 관문이라는 오해를 막습니다.',
15:'제목과 설명은 고정된 상태에서 구획된 그림만 한 번 움직입니다. 처음 1.5초 후 이름과 설명, 본문, 필요한 부록이 작업 문맥으로 전달되는 흐름을 보여줍니다. 모든 파일 이름과 역할은 처음부터 읽을 수 있습니다. 약 18초 후 최종 도식을 유지하며 자동 반복하지 않습니다. 책 표지와 필요한 장을 읽는 비유로 설명하고 실제 파일 이름으로 돌아옵니다. P로 정지, R로 필요할 때만 다시 볼 수 있습니다.',
18:'세 description을 동시에 보여줍니다. 가운데 설명은 목적과 사용 시점이 구체적입니다. 위는 너무 모호하고 아래는 범위가 지나치게 넓습니다. 자동 강조가 없으므로 실제 비해당 요청을 들어 충분히 설명합니다. 자동 선택이나 성공을 보장하는 문구로 설명하지 않습니다.',
19:'두 호스트의 프로젝트·사용자 경로와 호출 문법을 나란히 고정 표시합니다. Codex와 Claude Code를 비교하면서 폴더 형식과 발견 위치의 차이를 설명합니다. 경로는 2026-11-04 확인한 공식 문서 기준이며 실제 제품 버전과 조직 정책을 확인하도록 안내합니다.',
21:'제목과 핵심 설명, 지도와 보고서의 위치가 고정됩니다. 구획된 시연 안에서 공통 지침과 스킬, MCP 연결, 도구 반환, 분류와 검증이 국소 강조됩니다. 같은 객체를 계속 보며 요청부터 초안까지 따라갑니다. 진입 1.5초 후 시작하여 26초 동안 한 번 재생하고 완성 상태를 계속 유지합니다. 완료1·진행1·막힘1과 근거 ID는 합성 데이터입니다. 네 역할은 이 사례의 조합이며 모든 작업의 필수 게이트가 아닙니다. 설명을 멈추고 싶을 때 P, 다시 볼 필요가 있을 때만 R을 씁니다.',
22:'메모가 있는 경우와 누락된 경우를 나란히 고정 표시합니다. 두 경우 모두 이슈 I-08에서 막힘1건이 확인되어 있습니다. 메모가 없으면 알 수 없는 것은 검토 일정입니다. 누락을 없음으로 바꾸지 않는다는 지침을 정적인 비교만으로 설명합니다.',
25:'프로젝트 공통 기준과 주간보고서 절차를 두 영역으로 보여줍니다. 모든 날짜·수치에 적용되는 기준과 특정 보고서의 순서·확인을 구분합니다. 실제 위치는 프로젝트 범위에 따라 달라질 수 있고, 정본을 분명하게 유지하는 것이 중요합니다.',
30:'네 점검 단계를 처음부터 펼쳐 둡니다. 발견, 선택·읽기, 실행, 결과 기준 중 무엇이 안 되는지 좁힙니다. 발표자는 실제 증상을 따라 필요한 칸으로 바로 갈 수 있습니다. 타이머가 다른 단계로 강조를 옮기지 않습니다.',
31:'세 증상과 먼저 확인할 위치를 함께 읽습니다. 403은 도구·연결 환경의 권한, 순서 흔들림은 Skill 절차, 프로젝트 전체 UTC 표기는 공통 시간 기준을 확인합니다. 실제 원인은 복수일 수 있으므로 가장 먼저 볼 위치의 예라고 설명합니다.',
34:'작성된 네 줄 예제를 처음부터 모두 보여줍니다. 언제, 입력, 순서, 완료 기준을 자신의 반복 업무에 대입해 생각할 시간을 줍니다. 입력 창이나 자동 작성 연출 없이 예제로 설명합니다. 원한다면 청중이 종이에 자기 업무를 적고 완료 기준이 확인 가능한지 이야기하도록 진행합니다.'
};
for(const slide of slides){
 if(fixed[slide.id])slide.html=`<div class="astra-scene astra-scene-${slide.id}${slide.theme==='dark'?' astra-night':''}" data-astra-slide="${slide.id}">${fixed[slide.id]}</div>`;
 if(titles[slide.id])slide.title=titles[slide.id];
 const sections={3:'문제 구분',11:'역할 구분',18:'설명 비교',25:'적용 범위',31:'진단 예시',34:'업무 정의 예시'};if(sections[slide.id])slide.section=sections[slide.id];
 if(notes[slide.id])slide.notes=notes[slide.id];
 slide.staticExposition=true;slide.demo=[15,21].includes(slide.id);
 if(slide.demo)slide.html=slide.html.replace('class="astra-scene ', 'class="astra-scene has-process-demo ');
 if(!slide.demo)slide.html=slide.html.replace(/^(<div\b)/,'$1 data-page-text');
}
const noop=id=>({cleanup(){},setPaused(){},restart(){},getState(){return{id,active:false,finished:true,paused:true,elapsed:0,phase:0,cycle:0,duration:0,reduced:false};}});
function mount(root,slide,{reduced=false}={}){
 const region=root.querySelector('[data-demo-region]');
 if(!slide.demo||!region)return noop(slide.id);
 const id=Number(slide.id),duration=id===15?18000:27500;
 const starts=id===15?[1500,6500,11500]:[1500,4500,7500,10500,13500,17500,20500,23500,25500];
 const packet=region.querySelector('[data-packet]'),status=region.querySelector('[data-demo-status]'),bar=region.querySelector('[data-demo-progress]');
 let elapsed=0,last=0,raf=0,paused=false,dead=false,finished=false,phase=-2;
 function paint(ms){
  const done=ms>=duration;const next=done?starts.length-1:starts.reduce((p,t,i)=>ms>=t?i:p,-1);
  if(next!==phase||done!==finished){phase=next;finished=done;region.dataset.demoPhase=String(phase+1);region.dataset.demoState=done?'finished':paused?'paused':'playing';
   region.querySelectorAll('[data-focus]').forEach(e=>{const n=+e.dataset.focus;e.classList.toggle('is-current',!done&&n===phase);e.classList.toggle('is-read',done||n<phase);});
   region.querySelectorAll('[data-phase-item]').forEach(e=>{const n=+e.dataset.phaseItem;e.classList.toggle('is-current',!done&&n===phase);e.classList.toggle('is-read',done||n<phase);});
   region.querySelectorAll('[data-report-row]').forEach(e=>e.classList.toggle('is-ready',done||phase>=5));
   region.querySelector('[data-report-check]')?.classList.toggle('is-ready',done||phase>=7);
   status.textContent=done?(id===15?'읽기 완료':'초안 완성'):phase<0?'과정 준비':id===15?['선택 단서 읽기','업무 지침 읽기','필요한 형식 읽기'][phase]:phases[phase];
  }
  bar.style.transform=`scaleX(${Math.min(1,ms/duration)})`;
  let x=0,y=0,visible=false;
  if(!done&&phase>=0){const progress=Math.min(1,(ms-starts[phase])/1600);const ease=progress*progress*(3-2*progress);if(progress<1){if(id===15){x=490+380*ease;y=[110,205,300][phase];visible=true;}else if(phase===0){x=225+45*ease;y=195;visible=true;}else if(phase===1){x=385;y=80+60*ease;visible=true;}else if(phase===2){x=290+65*ease;y=320-90*ease;visible=true;}else if(phase===4){x=755-370*ease;y=270;visible=true;}}}
  packet.setAttribute('cx',x);packet.setAttribute('cy',y);packet.setAttribute('opacity',visible?'1':'0');
 }
 function tick(now){if(dead||paused||finished||reduced)return;if(!last)last=now;elapsed=Math.min(duration,elapsed+now-last);last=now;paint(elapsed);if(!finished)raf=requestAnimationFrame(tick);}
 function setPaused(value){if(dead||reduced||finished)return;paused=Boolean(value);cancelAnimationFrame(raf);last=0;region.dataset.demoState=paused?'paused':'playing';if(!paused)raf=requestAnimationFrame(tick);}
 function restart(){if(dead)return;cancelAnimationFrame(raf);elapsed=reduced?duration:0;phase=-2;finished=false;last=0;paint(elapsed);if(!paused&&!reduced)raf=requestAnimationFrame(tick);}
 function cleanup(){dead=true;cancelAnimationFrame(raf);}
 if(reduced){elapsed=duration;paint(duration);}else{paint(0);raf=requestAnimationFrame(tick);}
 return{cleanup,setPaused,restart,getState(){return{id,active:true,reduced,elapsed,phase:phase+1,finished,paused,cycle:0,duration};}};
}
window.AutoDemo={mount,version:'3.0',demoIds:[15,21]};
})();
