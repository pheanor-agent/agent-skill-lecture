#!/usr/bin/env python3
"""Render the authored live lecture; static reading and speaker notes require no JS."""
from pathlib import Path
import argparse,json,html,re,zipfile,shutil
P=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('--source',type=Path,default=P/'scene-source.json');args=a.parse_args();C=json.loads(args.source.read_text());S=C['scenes'];assert sum(s['seconds'] for s in S)==3600
E=lambda x:html.escape(str(x))
def p(x,cl=''):return '<p class="'+cl+'">'+E(x)+'</p>'
def code(x):return '<pre>'+E(x)+'</pre>'
def doc(title,body,cl=''):return '<section class="paper '+cl+'"><div class="paper-label">'+E(title)+'</div>'+body+'</section>'
def tag(x,cl=''):return '<span class="tag '+cl+'">'+E(x)+'</span>'
def table(h,r):return '<table><thead><tr>'+''.join('<th>'+E(x)+'</th>' for x in h)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+E(x)+'</td>' for x in row)+'</tr>' for row in r)+'</tbody></table>'
def md(text):
 out=[];rows=[]
 def flush():
  if rows:
   rr=[x for x in rows if not re.match(r'^\|[\s:|\-]+\|?$',x)];out.append(table([v.strip() for v in rr[0].strip('|').split('|')],[[v.strip() for v in r.strip('|').split('|')] for r in rr[1:]]));rows.clear()
 for line in text.splitlines():
  if line.startswith('|'):rows.append(line);continue
  flush()
  if not line.strip():continue
  if line.startswith('#'):out.append('<h3>'+E(line.lstrip('# '))+'</h3>')
  else:out.append(p(line.lstrip('- ')))
 flush();return ''.join(out)
def rule(x):return '<div class="rule">'+p(x)+'</div>'
def parts(items,cls='lines'):return '<div class="'+cls+'">'+''.join(p(x) for x in items)+'</div>'
def states(panels,labels):
 return '<div class="states">'+''.join('<div class="state-pane'+(' selected' if i==0 else '')+'" data-state="'+str(i)+'">'+x+'</div>' for i,x in enumerate(panels))+'</div><nav class="state-nav" aria-label="장면 단계">'+''.join('<button data-set-state="'+str(i)+'" aria-pressed="'+str(i==0).lower()+'">'+E(x)+'</button>' for i,x in enumerate(labels))+'</nav>'
def pairdocs(left,right,labels=('원자료','결과'),cls=''):
 return '<div class="two-docs '+cls+'">'+doc(labels[0],left)+ '<div class="between">→</div>'+doc(labels[1],right)+'</div>'
def evidence(items):return ''.join('<div class="evidence-row">'+tag(x['label'])+p(x['text'])+'</div>' for x in items)
def answerblock(s,read=False):
 if not s.get('answer'):return ''
 q=s.get('question','판단을 확인해 보세요.');an=s['answer']
 if not read and s['screen']['data'].get('revealInNextScene'):return '<div class="question-only">'+p(q)+'<small>다음 장면에서 확인합니다.</small></div>'
 return '<details class="answer"'+(' open' if read else '')+'><summary>'+E(q)+' <span>답과 이유 보기</span></summary><div>'+p(an['text'],'answer-text')+p(an['reason'])+'</div></details>'
def visual(s,reading=False):
 k=s['key'];d=s['screen']['data']
 if k=='opening':
  sections=d['reportText'].split('## '); report={chunk.splitlines()[0].strip():'\n'.join(chunk.splitlines()[1:]).strip() for chunk in sections[1:]}
  header='<h3 class="cover-report-title">주간업무 보고서 초안</h3>'+p('2026-10-26 — 2026-10-30','cover-period')
  rows=''
  for label in ['완료','진행','막힘']:
   line=report[label].lstrip('- ');claim,ref=line.split('근거: ',1);name,detail=claim.strip().split(' — ',1)
   rows+='<div class="cover-report-row"><span>'+E(label)+'</span><div><h4>'+E(name)+'</h4><p>'+E(detail.strip()+' · '+ref.rstrip('.'))+'</p></div></div>'
  nextline=report['다음 확인'].splitlines()[0].lstrip('- ');claim,ref=nextline.split('근거: ',1);date=re.search(r'(\d{4})-(\d{2})-(\d{2})',claim);schedule=str(int(date[2]))+'월 '+str(int(date[3]))+'일 검토 예정'
  rows+='<div class="cover-next"><span>다음 확인</span><h4>'+E(schedule)+'</h4>'+p(ref.rstrip('.'))+'</div>'
  return '<div class="hero-visual">'+doc('기획팀 · 기준일 2026-10-30',header+rows,'cover-report')+p(d['deliverable'],'hero-takeaway')+'</div>'

 if k=='request':return '<div class="request-visual"><blockquote>'+E(d['request'])+'</blockquote><div class="source-stack">'+''.join(doc(x['path'],md(x['text'])) for x in d['documents'])+'</div></div>'
 if k=='read-and-return':
  panels=[]
  for i,x in enumerate(d['states']):
   left=tag('지금 일어나는 일')+'<h3>'+E(x['name'])+'</h3>'+p('Tool call: 도구에 구체적인 행동을 요청하는 호출','term')
   if i==0:content=doc(x['file'],p(x['excerpt'],'quote'));verb='읽기 요청 →';after='지정된 원자료를 읽을 차례입니다.'
   elif i==1:content=doc('읽기 요청의 대상',code(x['target'])+p('내용은 아직 반환되지 않았습니다.','near-caption'),'pending');verb='요청 →';after=x['from']+' → '+x['to']
   else:content=doc('업무표 3행 · 실제 반환 발췌',p('디자인 검토','subject')+p('막힘','status')+p('검토 담당자의 회신을 기다리고 있다.','quote'));verb='← 원문 반환';after='돌아온 내용을 보고 막힘으로 분류합니다.'
   panels.append('<div class="action-flow"><div class="action-actor">'+left+'</div><div class="verb">'+E(verb)+'</div>'+content+'<div class="next-action">'+tag('그다음 판단')+p(after)+'</div></div>')
  return states(panels,[x['name'] for x in d['states']])+p(d['relationshipLabel'],'micro-note')
 if k=='draft-from-evidence':return pairdocs(evidence(d['left']),evidence(d['right']),('읽은 원자료','실제 보고서 초안'),'evidence-pair')
 if k=='next-week':return '<div class="fact-method"><div><span class="label">다음 주에 바뀔 사실</span>'+parts(d['facts'],'facts')+'</div><div><span class="label">다음에도 쓸 방법</span>'+parts(d['methods'],'methods')+'</div></div>'+p(d['question'],'question-line')
 if k=='save-the-method':
  left=tag('이번 주 원자료')+p(d['source'],'quote')+'<div class="bad-example">'+tag('이렇게 굳히면 다음 주에 틀릴 수 있습니다')+p(d['badInstruction'])+'</div>'
  file=doc(d['destination'],tag('실제 지침의 해당 부분')+code(d['actualInstruction'])+'<div class="destination-slot"></div>','skill-destination')
  return '<div class="method-transform" data-transform="0"><div class="method-fact">'+left+'</div>'+file+'<div class="moving-method" data-object="method">'+tag('반복할 판단 기준')+p(d['reusableInstruction'])+'</div></div><nav class="state-nav"><button data-transform-to="0" aria-pressed="true">자료와 방법</button><button data-transform-to="1" aria-pressed="false">지침에 남기기 →</button></nav>'
 if k=='skill-file':
  before,after=d['file'].split('## 절차',1);a=before.split('---');left=code('---'+a[1]+'---')+md(a[2]);right=md('## 절차'+after)
  return '<div class="file-spread">'+doc('SKILL.md · 앞부분',left)+doc('같은 파일 · 이어서',right)+'</div>'+p(d['tree'],'folder-caption')
 if k=='format-origin':return '<div class="file-history">'+doc(d['fileAnchor'],'<div class="format-name">SKILL.md</div>'+p('이름·사용 조건','file-line')+p('수행 방법·완료 기준','file-line'))+'<div class="history-notes">'+''.join('<div>'+tag(x['date'])+'<h3>'+E(x['event'])+'</h3></div>' for x in d['milestones'])+p(d['smallNote'],'near-caption')+'</div></div>'
 if k=='description':return '<div class="metadata-match"><div class="request-fragment">'+tag('이번 요청')+'<blockquote>'+E(d['request'])+'</blockquote>'+p('“'+d['weakDescription']+'”만으로는 사용 범위를 알기 어렵습니다.','near-caption')+'</div>'+doc('SKILL.md · 메타정보',code(d['metadata']))+'</div>'+p(d['note'],'micro-note')
 if k=='body-judgment':return '<div class="judgment-closeup"><div>'+tag('구체적인 판단 기준')+parts(d['rules'],'numbered-rules')+'</div><aside>'+tag('결과에서 확인할 것')+p(d['completion'],'quote')+'<div class="word-change">'+p(d['contrast']['vague'])+'<span>↓</span>'+p(d['contrast']['checkable'])+'</div></aside></div>'
 if k=='support-template':return '<div class="template-link"><div>'+tag('SKILL.md · 절차 6')+p(d['rule'],'quote')+'<div class="down-label">서식을 읽습니다 →</div>'+p(d['separation'],'near-caption')+'</div>'+doc(d['templatePath'],md(d['templateText']),'blank-template')+'</div>'
 if k=='place-skill':return '<div class="folder-layout">'+doc('프로젝트의 파일 배치 예',code(d['tree']))+'<div class="placement-actions">'+''.join('<div><span>'+str(i+1)+'</span>'+p(x)+'</div>' for i,x in enumerate(d['actions']))+p(d['fallback'],'near-caption')+'<a class="download-link" href="'+E(d['downloadUrl'])+'">'+E(d['downloadLabel'])+' ↓</a></div></div>'
 if k=='invoke-skill':
  lines=d['prompt'].splitlines();panels=[]
  for n in range(1,4):panels.append('<div class="prompt-composer">'+doc('Codex에 보낼 요청 · 셸 명령 아님',code('\n'.join(lines[:n]))+'<span class="caret"></span>')+'<div class="prompt-meaning">'+tag('이번에 덧붙인 것')+p(d['parts'][n-1]['role'],'quote')+p(d['parts'][n-1]['text'],'near-caption')+'</div></div>')
  return states(panels,['Skill 지정','이번 조건','원자료 지정'])+p('비교해 보세요: '+d['missingPrompt'],'question-line')
 if k=='use-and-review':
  out=d['output']
  if not reading:
   chunks=out.split('## ');out=chunks[0]+''.join('## '+chunk for chunk in chunks[1:] if chunk.startswith(('막힘','다음 확인')))
  return '<div class="review-result"><div class="review-path">'+tag('실제 기록에서 읽은 파일')+''.join('<div>'+p(x['verb'],'verb-line')+code(x['file'])+'</div>' for x in d['traceExcerpt'])+'<h3>초안에서 확인</h3>'+parts(d['reviewFocus'])+'</div>'+doc('run-output.md · 실제 초안'+(' 전체' if reading else ' 발췌'),md(out)+'<a class="output-link" href="examples/teacher-demo/run-output.md">전체 실제 결과 보기 →</a>','full-report')+'</div>'
 if k=='more-work':
  panes=[]
  for state in [0,1]:
   docs=''.join('<div class="project-document"><h3>'+E(x['title'])+'</h3>'+p(x.get('normalizedDate',x['date']) if state else x['date'],'date-value')+'</div>' for x in d['documents'])
   panes.append('<div class="project-scope '+('normalized' if state else 'mixed')+'"><div class="project-rule">'+tag('프로젝트 공통 규칙')+'<h3>'+E(d['commonRule'])+'</h3></div><div class="branch-lines"><i></i><i></i><i></i></div><div class="project-documents">'+docs+'</div><div class="task-only">'+tag('주간보고서에만')+p(d['taskRule'])+'</div></div>')
  return states(panes,['서로 다른 날짜 표기','공통 규칙 적용'])
 if k=='agents-scope':return '<div class="scope-placement">'+doc('프로젝트 파일',code(d['tree']))+'<div class="scope-rules"><div class="common-bracket">'+tag('AGENTS.md · 여러 업무에 적용')+md(d['agentsText'])+'</div><div class="task-bracket">'+tag('weekly-brief/SKILL.md · 해당 업무')+p(d['skillText'],'quote')+'</div>'+p(d['note'],'near-caption')+'</div></div>'
 if k=='where-to-put':return '<div class="placement-lines">'+''.join('<div>'+tag(x['place'])+p(x['text'])+'</div>' for x in d['items'])+'</div>'+p(d['question'],'question-line')
 if k=='source-moved':
  def pane(external):return '<div class="source-move"><div class="fixed-method">'+tag('수행 방법은 유지')+p(d['fixedSkill'],'quote')+'</div><div class="acting-app">'+tag('작업의 주체')+'<h3>Codex 앱</h3>'+p('업무표 읽기 요청')+'</div><div class="connection-edge '+('broken' if external else '')+'">'+('연결·권한 미확인' if external else '파일 읽기 →')+'</div><div class="data-place">'+tag('입력 자료')+p(d['after'] if external else d['before'],'quote')+'</div></div>'
  return states([pane(False),pane(True)],['내 폴더의 자료','회사 서비스로 이동'])+p(d['brokenEdge']['reason'],'micro-note')
 if k=='mcp-connection':return '<div class="mcp-route"><div class="mcp-node app-node">'+tag('작업하는 앱')+'<h3>Codex</h3>'+p('MCP 클라이언트')+'</div><div class="protocol"><strong>MCP</strong>'+p('연결 표준 규약')+'<span>조회 요청 →<br>← 조회 결과</span></div><div class="mcp-node server-node"><h3>MCP 서버</h3>'+p('허용된 기능 제공')+'</div><div class="service-arrow">조회 →<br>← 반환</div><div class="mcp-node service-node"><h3>회사 업무<br>서비스</h3>'+p('허용된 자료')+'</div></div><div class="mcp-foundation">'+rule(d['fixedRule'])+p(d['permission'])+p(d['alternative'],'near-caption')+'</div>'
 if k=='whole-map':return '<div class="whole-map"><div class="map-guidance"><div>'+tag(d['backgroundRule']['label'])+p(d['backgroundRule']['text'])+'</div><div>'+tag(d['workflow']['label'])+p(d['workflow']['text'])+'</div></div><div class="map-arrow">기준 제공 →</div><div class="map-app"><h3>에이전트 앱</h3>'+p(d['action']['text'])+tag('Tool call')+'</div><div class="map-io"><div>'+tag(d['connection']['label'])+p(d['connection']['text'])+'</div><div class="roundtrip">요청 → 도구<br>← '+E(d['input'])+'</div><div class="map-output">'+E(d['output'])+'</div></div></div>'
 if k in ['missing-predict','missing-reveal']:
  reveal=k=='missing-reveal';left=doc('업무표 3행 · 남아 있는 자료','<h3>디자인 검토 <em>막힘</em></h3>'+p('검토 담당자의 회신을 기다리고 있다.'))+doc('회의 메모 1항 · 이번 입력에 없음',p('디자인 검토는 2026-11-05에 진행할 예정이다.'),'excluded')
  right='<div class="evidence-row">'+tag('막힘'+(' · 유지' if reveal else ''))+p(d['unchanged'] if reveal else d['previousOutput'][0]['text'])+'</div><div class="evidence-row '+('replaced' if reveal else '')+'">'+tag('다음 확인'+(' · 수정' if reveal else ''))+p(d['replaced']['after'] if reveal else d['previousOutput'][1]['text'])+'</div>'
  return '<div class="missing-pair"><div class="source-stack">'+left+'</div><div class="evidence-bridges"><span></span><span class="broken"></span></div>'+doc('조건 변경 후 기대 결과' if reveal else '이전 출력의 해당 부분',right)+'</div>'+ (rule(d['rule']) if reveal else '')
 if k=='conflict':return '<div class="conflict-inputs">'+''.join(doc(x['label'],p(x['text'],'quote')+(p(x['note'],'near-caption') if 'note'in x else '')) for x in d['inputs'])+'</div>'+p(d['question'],'question-line')
 if k=='nonmatch':return '<div class="boundary-request"><blockquote>'+E(d['request'])+'</blockquote><div class="boundary-match">'+tag('Skill의 사용 조건')+p(d['skillDescription'],'quote')+'</div></div><div class="wrong-format">'+tag('이 요청에 강제할 서식이 아님')+parts(d['badFrame'],'format-labels')+'</div>'
 if k=='read-denied':return '<div class="denied-layout"><div>'+tag('가정한 도구 반환')+'<blockquote>'+E(d['toolResult'])+'</blockquote><div class="struck">'+E(d['wrongConclusion'])+'</div></div><div>'+tag('확인할 자리: '+d['highlightMapPart'])+p(d['expected'],'quote')+p(d['keep'],'near-caption')+'</div></div>'
 if k=='transfer-example':return '<div class="transfer-table">'+doc('회의 메모의 원문',p(d['input'],'quote'))+table(['확인할 항목','원문에서 찾은 내용'],[[x['label'],x['value'] if x['value'] is not None else '어떻게 남길까요?'] for x in d['fields']])+'</div>'
 if k=='transfer-to-skill':return '<div class="transfer-draft"><div>'+''.join('<div class="transfer-connection">'+p(x['from'])+'<span>↓ '+E(x['verb'])+'</span>'+p(x['to'],'mint')+'</div>' for x in d['connections'])+'</div>'+doc('meeting-actions/SKILL.md · 작성 예',code(d['draft']))+'</div>'
 if k=='workshop-write':return '<div class="workshop"><div class="workshop-clock"><strong>6</strong><span>분 · 작성</span>'+p(d['artifact'],'quote')+tag('업무가 떠오르지 않으면')+p(d['fallbackTask'],'near-caption')+p(d['fallbackInput'],'practice-input')+'<a href="examples/my-skill-template.md">작성 틀 받기 →</a></div>'+doc('내 업무로 채울 자리',code(d['template']))+'</div>'
 if k=='workshop-test':return '<div class="workshop"><div class="workshop-clock"><strong>3</strong><span>분 · 시험</span><ol>'+''.join('<li>'+E(x)+'</li>' for x in d['steps'])+'</ol></div>'+doc('기대 결과는 별도로 보관',code(d['recordTemplate'])+p(d['fallbackVariation'],'near-caption'))+'</div>'
 if k=='workshop-review':return '<div class="workshop-review"><div class="review-clock"><strong>2</strong><span>분 · 검토</span></div><div class="review-instruction">'+p(d['reviewPrompt'],'quote')+'<div class="pair-timing">'+''.join('<div>'+E(x)+'</div>' for x in d['pairFlow'])+'</div>'+p(d['soloFlow'],'near-caption')+rule(d['finish'])+'</div></div>'
 if k=='questions':return '<div class="qa-layout"><div class="qa-input">'+''.join('<div><span>0'+str(i+1)+'</span>'+p(x)+'</div>' for i,x in enumerate(d['promptFields']))+'</div><div class="qa-directions">'+''.join('<div>'+p(x['symptom'])+'<span>→ '+E(x['lookAt'])+'</span></div>' for x in d['diagnosisPaths'])+'</div></div>'+p(d['closingArtifact'],'closing-artifact')
 raise ValueError(k)
def screen(s,reading=False):
 k=s['key'];cl='scene--'+k
 small=k in ['save-the-method','skill-file','format-origin','description','body-judgment','support-template','place-skill','invoke-skill','use-and-review','agents-scope','transfer-to-skill','workshop-write','workshop-test','workshop-review','mcp-connection']
 return '<article class="scene slide '+cl+(' compact-title' if small else '')+'" id="scene-'+str(s['id'])+'" data-scene="'+str(s['id'])+'"><header class="scene-meta"><span>'+E(('AGENT SKILL · ' if k=='opening' else '')+s['section'])+'</span><span>'+str(s['id'])+' / '+str(len(S))+'</span></header><h2 class="scene-title">'+(E(s['screen']['headline']).replace('맡긴다면','<em>맡긴다면</em>') if k=='opening' else E(s['screen']['headline']).replace('유지하고, 모르는','유지하고,<br>모르는').replace('초대문에는 이 보고서','초대문에는<br>이 보고서')).replace('\n','<br>')+'</h2><div class="screen-caption">'+E(s['screen']['caption'])+'</div><div class="canvas">'+visual(s,reading)+answerblock(s,reading)+'</div></article>'
nav='<nav class="site-nav"><a href="index.html">발표</a><a href="read.html">읽기</a><a href="notes.html">강사 대본</a><a href="supplement.html">실습</a><a href="teacher-demo.html">실제 시연</a><a href="sources.html">출처</a></nav>'
def shell(title,body,cls='reading',extra=''):return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+E(title)+'</title><link rel="stylesheet" href="lecture.css"></head><body class="'+cls+'">'+nav+body+extra+'</body></html>'
controls='<footer class="controls"><button id="prev">← 이전</button><label>장면 <select id="jump">'+''.join('<option value="'+str(s['id'])+'">'+str(s['id'])+'. '+E(s['title'])+'</option>' for s in S)+'</select></label><button id="next">다음 →</button><button id="fullscreen">전체 화면</button><a href="read.html">읽기 모드</a><span>60분 · 실습 11분 · Q&A 5분</span></footer>'
(P/'index.html').write_text(shell(C['course']['title'],'<noscript><p class="notice">발표 제어에는 JavaScript를 사용합니다. <a href="read.html">전체 읽기 문서</a>와 <a href="notes.html">강사 대본</a>는 JavaScript 없이 읽을 수 있습니다.</p></noscript><main id="deck">'+''.join(screen(s) for s in S)+'</main>','presentation',controls+'<script src="player.js"></script>'))
for file,notes in [('read.html',False),('notes.html',True)]:
 body='<header class="reading-intro"><h1>'+E(C['course']['title'])+'</h1>'+p(C['course']['subtitle'])+p('31장면 · 60분 계획 · 44–55분 실습 · 55–60분 Q&A')+'</header><main>'
 for s in S:
  body+='<section class="reading-scene" id="read-scene-'+str(s['id'])+'">'+screen(s,True)
  body+='<div class="reader-copy"><h3>이어 읽기</h3>'+parts(s['reader'])+'</div>'
  if notes:
   body+='<div class="speaker-copy"><h3>실제 강사 발화</h3>'+parts(s['speech'])+'<h3>조작·관찰·기다림</h3><ul>'+''.join('<li>'+E(x)+'</li>' for x in s['cues'])+'</ul>'
   if s.get('audience'):body+='<h3>예상 반응과 추가 질문</h3>'+p(s['audience']['question'])+p('예상 답: '+' / '.join(s['audience']['expected']))+p(s['audience']['ifDifferent'])+p(s['audience']['silence'])
   body+='<h3>다음 장면으로</h3>'+parts(s['bridge'])+p('진행 예산: '+str(s['seconds'])+'초 · '+'발화 '+str(s['timing']['speechSeconds'])+'초 · 관찰/조작 '+str(s['timing']['observationSeconds'])+'초 · 질문/응답 '+str(s['timing']['interactionSeconds'])+'초 · 활동 '+str(s['timing']['activitySeconds'])+'초','time-budget')+'</div>'
  if s['sources']:body+='<div class="references">'+''.join('<a href="'+E(u)+'">공식 참고 '+str(i+1)+'</a> ' for i,u in enumerate(s['sources']))+'</div>'
  body+='</section>'
 body+='</main>';(P/file).write_text(shell('강사 대본' if notes else C['course']['title']+' · 읽기',body))
# Teaching materials remain separate from model inputs.
ex=P/'examples';(ex/'my-skill-template.md').write_text(next(s for s in S if s['key']=='workshop-write')['screen']['data']['template']+'\n')
conf=next(s for s in S if s['key']=='conflict')['screen']['data'];(ex/'practice-data/conflicting/completion-notice.md').write_text('# 추가 알림 · 교사용 가정\n\n디자인 검토를 완료했다.\n')
expected={s['key']:s['answer'] for s in S if s.get('answer')};expected['workshop-fallback']={'text':'할 일: 안내문 개정. 담당자: 미확인. 기한: 11월 12일. 담당자를 확인한다.','reason':'담당자는 원문에 없으며 결정과 기한은 원문에 있다.'}
review=ex/'reviewer-only';review.mkdir(exist_ok=True);(review/'test-cases.expected.json').write_text(json.dumps({'audience':'검토자용 · 모델 입력에서 제외','cases':expected},ensure_ascii=False,indent=2)+'\n')
(ex/'README.md').write_text('''# 실습 자료

weekly-brief/는 재사용할 지침과 빈 서식, practice-data/는 모델에 제공할 원자료입니다. weekly-brief-package.zip은 학생용입니다. reviewer-answers.zip은 별도 검토자 답안이며 모델 입력에 넣지 않습니다.

1. normal 또는 조건 변경 폴더의 원자료를 선택합니다.
2. weekly-brief/SKILL.md와 선택한 입력으로 2026-10-30 기준, 2026-10-26~30 보고서 초안을 요청합니다.
3. 실제 결과를 저장한 뒤 별도 reviewer-answers.zip의 기대 결과와 대조합니다. 실행하지 않았으면 수기 적용으로 기록합니다.
4. conflicting에서는 업무표와 추가 완료 알림을 함께 봅니다. 디자인 검토의 막힘/완료가 상충하며 시점·우선순위 근거가 없습니다.

자기 업무는 my-skill-template.md에 작성합니다. 제공 실습 원문은 “결정: 안내문을 개정한다. 기한: 11월 12일.”입니다. 시험 입력과 기대 결과는 먼저 직접 작성하세요. 본편 가이드의 “준호가 FAQ 초안을 작성하기로 했다”와 다른 문제입니다.
''')
for zipname,roots,files in [('weekly-brief-package.zip',[ex/'weekly-brief',ex/'practice-data'],[ex/'README.md',ex/'my-skill-template.md']),('reviewer-answers.zip',[review],[])]:
 with zipfile.ZipFile(ex/zipname,'w',zipfile.ZIP_DEFLATED) as z:
  for root in roots:
   for f in sorted(root.rglob('*')):
    if f.is_file():z.write(f,f.relative_to(ex))
  for f in files:z.write(f,f.relative_to(ex))
# Preserve the eight observed demo files byte-for-byte; do not regenerate their content.
whitelist=['weekly-brief/SKILL.md','weekly-brief/assets/report-template.md','input/tasks.md','input/meeting-notes.md','request.txt','classification.json','run-output.md','trace.json'];demo=ex/'teacher-demo';tr=json.loads((demo/'trace.json').read_text())
with zipfile.ZipFile(ex/'teacher-demo.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in whitelist:z.write(demo/f,'teacher-demo/'+f)
starter_readme="""# 시작용 프로젝트

이 폴더를 Codex에서 열고 weekly-brief Skill이 목록에 보이는지 확인하세요. .agents/skills/weekly-brief/에는 지침과 빈 서식, input/에는 교육용 업무표와 회의 메모가 있습니다.

요청 예:
$weekly-brief
2026-10-30을 기준으로 기획팀의 2026-10-26~2026-10-30 주간업무 보고서 초안을 작성해.
input/tasks.md와 input/meeting-notes.md를 사용해.

이 묶음에는 정답·실행 출력·trace가 없습니다. 실제 사용 기록과 별도 검토자 답안은 강의 참고에서 확인합니다.
"""
with zipfile.ZipFile(ex/'starter-project.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in ['weekly-brief/SKILL.md','weekly-brief/assets/report-template.md']:
  z.write(demo/f,'my-project/.agents/skills/'+f)
 for f in ['input/tasks.md','input/meeting-notes.md']:z.write(demo/f,'my-project/'+f)
 z.writestr('my-project/README.md',starter_readme)
body='<main class="document"><h1>실제 시연 기록</h1>'+p(tr['description'])+p(tr['limits'])+table(['단계','실제 기록','결과'],[[x['id'],x['label'],x['result']] for x in tr['steps']])+doc('실제 최종 초안',md((demo/'run-output.md').read_text()))+'<ul>'+''.join('<li><a href="examples/teacher-demo/'+f+'">'+f+'</a></li>' for f in whitelist)+'</ul><a href="examples/teacher-demo.zip">시연 8파일 ZIP</a></main>'
(P/'teacher-demo.html').write_text(shell('실제 시연 기록',body))
body='<main class="document"><h1>실습과 참고</h1>'+p('44–50분 작성 · 50–53분 시험 · 53–55분 검토')+'<ul><li><a href="examples/starter-project.zip">시작용 프로젝트 ZIP — Skill과 입력이 배치됨</a></li><li><a href="examples/my-skill-template.md">내 Skill 작성 틀</a></li><li><a href="examples/weekly-brief-package.zip">Skill·원자료 학생용 ZIP</a></li><li><a href="examples/reviewer-answers.zip">검토자 기대 결과 ZIP — 모델 입력에서 제외</a></li><li><a href="examples/README.md">시험 실행 안내</a></li><li><a href="examples/teacher-demo.zip">실제 사용 시연 ZIP</a></li></ul>'+md((ex/'README.md').read_text())+'</main>'; (P/'supplement.html').write_text(shell('실습 자료',body))
urls=list(dict.fromkeys(u for s in S for u in s['sources']))
body='<main class="document"><h1>출처와 자료 성격</h1>'+''.join('<h2>'+E(r['title'])+'</h2>'+p(r['text'])+'<ul>'+''.join('<li><a href="'+E(u)+'">'+E(u)+'</a></li>' for u in r['links'])+'</ul>' for r in C['course']['referencePages'])+'<h2>공식 출처</h2><ul>'+''.join('<li><a href="'+E(u)+'">'+E(u)+'</a></li>' for u in urls)+'</ul><h2>글꼴과 코드</h2>'+p('일반 한글은 전체 Noto Sans CJK KR Regular/Bold를 사용합니다. 코드 라틴 문자는 시스템 고정폭, 코드 한글은 같은 Noto를 사용합니다.')+'<p><a href="assets/NOTO-CJK-THIRD-PARTY-LICENSE.txt">Noto 라이선스</a> · <a href="LICENSE">MIT 라이선스</a></p></main>'; (P/'sources.html').write_text(shell('출처',body))
(P/'README.md').write_text('''# Agent Skill · 실제 강연 자료

한 보고서의 실제 사용에서 반복할 방법을 Skill로 남기고, 프로젝트 규칙·외부 자료·조건 변경을 거쳐 자기 업무를 작성하는 한국어 강의입니다. 31장면, 60분 계획이며 44–55분 실습 11분과 55–60분 Q&A를 포함합니다.

- index.html: 네이비 무대의 발표 화면. 핵심 자료·관계·판단을 표시합니다.
- read.html: 연결된 자습 설명, 모든 정적 자료와 문제·해설. JavaScript 불필요.
- notes.html: 실제 발화, 조작·기다림, 예상 청중 반응과 전환을 포함한 강사 대본.
- supplement.html: 작성 틀, 원자료, 별도 검토자 답안.
- teacher-demo.html: 실제 관측된 다섯 단계와 원본 여덟 파일.
- sources.html: 공식 출처와 관측 범위, 라이선스.

정본은 scene-source.json입니다. screen/reader/speech를 분리해 작성하며 모든 발화를 슬라이드에 복사하지 않습니다. `python3 scripts/build.py`로 정적 페이지와 실습 ZIP을 생성합니다. 다른 소스는 `--source PATH`로 지정합니다. 스타일은 lecture.css, 발표 제어는 player.js입니다.

발표 화면은 좌우키·Home/End·장면 선택·주소 해시·브라우저 뒤로가기를 지원합니다. 상태 버튼은 강사가 수동 조작합니다. 700px 미만 화면은 read.html로 이동합니다. 로컬 file:// 열기 또는 정적 HTTP 서버로 사용할 수 있습니다. 인쇄는 흰 바탕에서 자료·답·노트를 읽도록 구성했습니다.

기획팀 원자료는 교육용 합성 자료입니다. 시연은 제작 Codex 세션에서 이미 본 자료의 명시적 사용 순서를 관찰한 기록이며 자동 선택·블라인드 평가·성능 비교가 아닙니다. 외부 서비스·상충·누락 장면은 설명 상황 또는 기대 결과로 구분합니다. 학생 ZIP에 기대 결과를 넣지 않습니다.

일반 한글과 코드 한글은 Noto Sans CJK KR 전체 글꼴을 사용합니다. 라이선스는 assets/NOTO-CJK-THIRD-PARTY-LICENSE.txt, 프로젝트 코드는 MIT입니다. 공개 기록의 원본 파일은 바이트를 보존합니다.
''')
print('Built',len(S),'scenes,',sum(s['seconds'] for s in S),'seconds')
