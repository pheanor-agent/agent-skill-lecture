#!/usr/bin/env python3
"""Build static presentation, reading pages and examples. No network required."""
import argparse,html,json,re,shutil,zipfile
from pathlib import Path
P=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('--source',type=Path,default=P/'course-source.json');a.add_argument('--demo',type=Path,default=P/'examples/teacher-demo');args=a.parse_args()
c=json.loads(args.source.read_text()); S=c['slides']
# Public data contains only deployment-relative coordinates.
c['demoRoot']='examples/teacher-demo/';c['traceArtifact']='examples/teacher-demo/trace.json'
def clean(x):
 if isinstance(x,str):return x.replace('../teacher-demo/','examples/teacher-demo/')
 if isinstance(x,list):return [clean(v) for v in x]
 if isinstance(x,dict):return {k:clean(v) for k,v in x.items()}
 return x
c=clean(c);S=c['slides'];(P/'course-source.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
e=lambda x:html.escape(str(x))
def md(t):
 lines=t.splitlines();out=[];tab=[];lis=[]
 def flush():
  if tab:
   rows=[r for r in tab if not re.match(r'^\|[\s:|\-]+\|?$',r)]
   out.append(table([v.strip() for v in rows[0].strip('|').split('|')],[[v.strip() for v in r.strip('|').split('|')] for r in rows[1:]]));tab.clear()
 for l in lines:
  if l.startswith('|'):tab.append(l);continue
  flush()
  if not l.strip():continue
  if l.startswith('#'):out.append('<h4>'+e(l.lstrip('# '))+'</h4>')
  else:out.append('<p>'+e(l.lstrip('- '))+'</p>')
 flush();return ''.join(out)
def table(headers,rows):return '<table><thead><tr>'+''.join('<th>'+e(x)+'</th>' for x in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+e(x)+'</td>' for x in row)+'</tr>' for row in rows)+'</tbody></table>'
def box(title,body,cl=''):return '<section class="paper '+cl+'"><h3>'+e(title)+'</h3>'+body+'</section>'
def para(t):return '<p>'+e(t)+'</p>'
def code(t):return '<pre>'+e(t)+'</pre>'
def visual(s):
 d=s['visual']['data'];typ=s['visual']['type'];key=s['key']
 if typ=='course-route':return '<div class="route">'+''.join('<span>'+e(x)+'</span>' for x in d['stops'])+'</div>'+box('오늘 남길 것',para(d['artifact']))
 if typ=='brief-document':return box('기획팀 · 주간업무 보고 요청',para(d['request'])+table(['입력','초안 확인 기준'],[[' · '.join(d['inputs']),d['acceptance']]]))
 if typ=='source-document':return ''.join(box(v['name'],md(v['text'])) for v in d['documents'])
 if typ=='blank-template':return box(d['path'],md(d['text']),'template')
 if typ=='evidence-mapping':
  rows=d.get('rows',[d]);out='<div class="mapping">'
  for r in rows:
   out+=box('원자료',para(r['source']))+box('판단',para(r.get('judgment') or '먼저 직접 판단해 보세요.'))+box('보고서',para(r.get('output') or '답을 펼쳐 대조합니다.'))
  return out+'</div>'+ (para(d['followup']) if 'followup'in d else '')
 if typ=='procedure-strip':return '<ol class="steps">'+''.join('<li>'+e(x)+'</li>' for x in d['steps'])+'</ol>'+para('매번 다시 읽을 값: '+' · '.join(d['variableFacts']))
 if typ=='full-skill':
  t=d['text'];parts=t.split('## 절차');left=parts[0];right='## 절차'+parts[1]
  # Present metadata literally, body as continuous document, no content omitted.
  bits=left.split('---');body=code('---'+bits[1]+'---')+md(bits[2])
  return '<div class="skill-spread">'+box(d['path']+' · 앞부분',body)+box('같은 파일 · 이어서',md(right))+'</div>'
 if typ=='code-annotation':return '<div class="split">'+box('메타정보',code(d['code']))+box('이름과 사용 조건',''.join(para(x['token']+' — '+x['meaning']) for x in d['annotations'])+table(['사용 범위','요청'],[['해당',d['match']],['비해당',d['nonmatch']]]))+'</div>'
 if typ=='rule-to-result':return table(['본문의 규칙','결과에서 확인할 것'],[[x['rule'],x['effect']] for x in d['rows']])
 if typ=='file-tree':return '<div class="split">'+box('실제 파일 구성',code(d['tree']))+box('지원 파일을 읽는 조건',para(d['relationship'])+para(d['excluded']))+'</div>'
 if typ=='history-line':return '<div class="timeline">'+''.join(box(x['date'], '<h4>'+e(x['label'])+'</h4>'+para(x['detail'])) for x in d['events'])+'</div><p class="source"><a href="'+e(d['source'])+'">Anthropic 원문 · 공개 및 표준화 업데이트</a></p>'
 if typ in ('placement-table','environment-table'):return table(d['headers'],d['rows'])
 if typ=='demo-manifest':return '<div class="split">'+box('시연 파일', '<ul>'+''.join('<li><a href="examples/teacher-demo/'+e(f)+'">'+e(f)+'</a></li>' for f in d['files'])+'</ul>')+box('관측한 범위',para(d['mode'])+para(d['runtime'])+'<p><a href="teacher-demo.html">실제 기록과 산출물 보기</a> · <a href="examples/teacher-demo.zip">전체 파일 ZIP</a></p>')+'</div>'
 if typ=='actual-request':return box('실제 요청문',para(d['text']))+table(['앱의 기본 Skill 사용','저장소 위치','명시 호출'],[[x['app'],x['path'],x['invocation']] for x in d['nativeExamples']])
 if typ=='actual-trace':
  steps='<ol class="trace">'+''.join('<li><button class="trace-step" data-step="'+str(i)+'"><b>'+e(x['label'])+'</b><span>'+e(' · '.join(x['files']))+'</span></button><p>'+e(x['result'])+'</p></li>' for i,x in enumerate(d['steps']))+'</ol>'
  evidence=''.join(box(x['file'],para(x['returnedExcerpt']),'evidence') for x in d['visibleEvidence'])
  return '<div class="trace-explorer">'+steps+'<div class="trace-evidence"><h3>실제로 읽은 파일의 반환 내용</h3>'+evidence+'</div></div><p class="source">기록 탐색: 왼쪽 단계를 선택하면 관련 반환·산출을 강조합니다. <a href="examples/teacher-demo/trace.json">실제 기록 열기</a></p>'
 if typ=='result-comparison':
  if 'output'in d:return '<div class="result-grid">'+box('원자료 → 보고서',table(['근거','항목'],[[x['input'],x['outputSection']+' · '+x['value']] for x in d['mapping']]))+box('실제 작성 결과',md(d['output']))+'</div>'
  return '<div class="result-grid">'+box('바뀐 입력 조건',para(d['condition'])+para(d['source']))+box('보고서에서 판단할 자리', '<h4>막힘</h4><p>현재 상태는?</p><h4>다음 확인</h4><p>검토 일정은?</p>')+'</div>'
 if typ=='relationship-map':return '''<div class="relation"><div class="guidance"><section><b>공통 지침</b><p>날짜 표기 규칙</p></section><section><b>Skill</b><p>분류·근거·누락 처리</p></section></div><div class="arrow">기준 제공 →</div><section class="app"><b>에이전트 앱</b><p>요청과 지침을 읽고<br>다음 행동을 결정</p></section><div class="channels"><section><b>호출 → 도구</b><p>파일 읽기</p><p>← 내용·오류 반환</p></section><section class="optional"><b>선택: MCP 등으로 연결</b><p>외부 업무 서비스에 요청 →</p><p>← 자료·오류 반환</p></section></div></div>'''
 if typ=='conflict-record':return '<div class="split">'+box('상충하는 원자료',''.join('<h4>'+e(x['name'])+'</h4>'+para(x['text']) for x in d['sources']))+box('확인할 사항으로 남기기',para(d['output'])+para(d['classification']))+'</div>'
 if typ=='scope-comparison':return table(['현재 요청','Skill의 사용 조건'],[[d['request'],d['description']]])+box('활용할 수 있는 자료',para(d['availableFact']))
 if typ=='failure-path':return '<div class="failure">'+box(d['label'],para(d['request'])+'<strong class="error">'+e(d['returned'])+'</strong>')+box('확인한 범위',para(d['known']))+box('다음 행동',para(d['next']))+'</div>'
 if typ=='worksheet':
  if 'template'in d:return '<div class="work-grid">'+box('6분 · SKILL.md 작성',para(d['fallbackTask'])+para(d['deliverable'])+'<p><a href="examples/my-skill-template.md" download>빈 작성 틀 받기</a></p>')+box('직접 채울 틀',code(d['template']))+'</div>'
  return '<div class="split">'+box('시험 입력',code(d['input']))+box('검토 기록', '<ol>'+''.join('<li>'+e(x)+'</li>' for x in d['recordFields'])+'</ol>'+para(d['answerLocation']))+'</div>'
 if typ=='review-sheet':return table(['검토 질문','확인할 증거'],[[x['prompt'],x['evidence']] for x in d['checks']])+box('모호한 문장 하나 고치기',para(d['revisionExample']['before']+' → '+d['revisionExample']['after']))
 if typ=='closing-artifacts':return '<div class="takeaway">'+''.join('<span>'+e(x)+'</span>' for x in d['takeaway'])+'</div>'
 raise ValueError(typ)
def article(s,notes=False):
 q=''
 if 'question'in s:q='<details class="answer"><summary>'+e(s['question'])+' <span>답과 이유 보기</span></summary><div><p><b>답</b> '+e(s['answer']['text'])+'</p><p><b>이유</b> '+e(s['answer']['reason'])+'</p></div></details>'
 n='<aside class="presenter"><h3>발표자 확장</h3>'+''.join(para(x) for x in s['notes'])+'</aside>' if notes else ''
 src='<div class="sources">'+''.join('<a href="'+e(x)+'">공식 출처 '+str(i+1)+'</a>' for i,x in enumerate(s.get('sources',[])))+'</div>'
 return '<article class="slide '+e('scene-'+s['key'] if s['key'] in ('trace','sources') else s['key'])+'" id="slide-'+str(s['id'])+'" data-slide="'+str(s['id'])+'"><div class="eyebrow">'+e(s['section'])+' <span>'+str(s['id'])+' / '+str(len(S))+'</span></div><h2>'+e(s['title'])+'</h2><div class="prose">'+''.join(para(x) for x in s['paragraphs'])+'</div><div class="visual '+s['visual']['type']+'">'+visual(s)+'</div>'+q+src+n+'</article>'
def shell(title,body,extra='',cls='reading'):
 return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+e(title)+'</title><link rel="stylesheet" href="lecture.css"></head><body class="'+cls+'"><nav class="topnav"><a href="index.html">발표</a><a href="read.html">읽기</a><a href="notes.html">발표 노트</a><a href="supplement.html">실습 자료</a><a href="teacher-demo.html">실제 시연</a><a href="sources.html">출처</a></nav>'+body+extra+'</body></html>'
main='<main id="deck">'+''.join(article(s) for s in S)+'</main>'
controls='<footer class="controls"><button id="prev" aria-label="이전 장">← 이전</button><label>장 <select id="jump">'+''.join('<option value="'+str(s['id'])+'">'+str(s['id'])+'. '+e(s['title'])+'</option>' for s in S)+'</select></label><button id="next" aria-label="다음 장">다음 →</button><button id="fullscreen">전체 화면</button><a href="read.html">읽기 모드</a><span id="budget"></span></footer>'
(P/'index.html').write_text(shell(c['title'], '<noscript><p class="notice">모든 장을 순서대로 표시합니다. <a href="read.html">읽기 문서</a>에서도 전체 내용을 볼 수 있습니다.</p></noscript>'+main,controls+'<script src="player.js"></script>','presentation'))
for name,notes in [('read.html',False),('notes.html',True)]:
 body='<header class="reading-header"><h1>'+e(c['title'])+'</h1><p>28장 · 60분 계획 · 실습 11분 · 질문 5분</p><p>교육용 합성 자료와 실제 명시적 파일 사용 기록을 구분해 읽습니다.</p></header><main>'+''.join(article(s,notes) for s in S)+'</main>'
 (P/name).write_text(shell('발표 노트' if notes else c['title']+' · 읽기',body))
# Exact demo whitelist.
whitelist=['weekly-brief/SKILL.md','weekly-brief/assets/report-template.md','input/tasks.md','input/meeting-notes.md','request.txt','classification.json','run-output.md','trace.json']
dest=P/'examples/teacher-demo';dest.mkdir(parents=True,exist_ok=True)
for f in whitelist:
 src=args.demo/f;to=dest/f;to.parent.mkdir(parents=True,exist_ok=True)
 if src.resolve()!=to.resolve():shutil.copyfile(src,to)
with zipfile.ZipFile(P/'examples/teacher-demo.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in whitelist:z.write(dest/f,'teacher-demo/'+f)
tr=json.loads((dest/'trace.json').read_text())
body='<main class="document"><h1>실제 시연 기록</h1>'+para(tr['description'])+para(tr['limits'])+table(['순서','관측한 행동','결과'],[[x['id'],x['label'],x['result']] for x in tr['steps']])+box('실제 초안',md((dest/'run-output.md').read_text()))+'<ul>'+''.join('<li><a href="examples/teacher-demo/'+f+'">'+f+'</a></li>' for f in whitelist)+'</ul><a href="examples/teacher-demo.zip">전체 파일 ZIP</a></main>'
(P/'teacher-demo.html').write_text(shell('실제 시연 기록',body))
# Practice package is independent from reviewer answers.
ex=P/'examples'; old=ex/'weekly-brief'
if old.exists():shutil.rmtree(old)
shutil.copytree(dest/'weekly-brief',old)
practice=ex/'practice-data';answers=ex/'reviewer-only';practice.mkdir(exist_ok=True);answers.mkdir(parents=True,exist_ok=True)
for variant in ['normal','missing-meeting','conflicting','not-applicable','access-failure']:(practice/variant).mkdir(exist_ok=True)
for f in ['tasks.md','meeting-notes.md']:shutil.copyfile(dest/'input'/f,practice/'normal'/f)
for variant in ['missing-meeting','conflicting']:shutil.copyfile(dest/'input/tasks.md',practice/variant/'tasks.md')
(practice/'conflicting/completion-notice.md').write_text('# 完了 알림\n\n1. 설문 결과 정리 — 완료\n'.replace('完了','완료'))
(practice/'not-applicable/request.txt').write_text('디자인 검토 회의 초대문을 작성해.\n')
(practice/'access-failure/tool-result.json').write_text(json.dumps({'kind':'수업용 가정 상황','operation':'업무표 읽기','error':'접근 거부'},ensure_ascii=False,indent=2))
expected={s['key']:s['answer'] for s in S if 'answer' in s}
expected['conflicting']={'text':next(s for s in S if s['key']=='conflict')['visual']['data']['output'],'reason':next(s for s in S if s['key']=='conflict')['visual']['data']['classification']}
expected['normal']={'text':(dest/'run-output.md').read_text(),'kind':'actual observed output; not an expected model result'}
(answers/'test-cases.expected.json').write_text(json.dumps({'audience':'reviewer-only; never include in student/model input','cases':expected},ensure_ascii=False,indent=2)+'\n')
if (ex/'answers').exists():shutil.rmtree(ex/'answers')
(ex/'my-skill-template.md').write_text(next(s for s in S if s['key']=='workshop-write')['visual']['data']['template'])
(ex/'README.md').write_text('''# 강의 실습 자료

weekly-brief/는 재사용 지침과 빈 서식입니다. practice-data/는 학생용 합성 원자료입니다. 기대 결과는 별도 검토자 자료이며 학생 ZIP과 모델 입력에 포함되지 않습니다.

1. normal의 두 파일 또는 missing-meeting의 업무표를 선택합니다.
2. weekly-brief/SKILL.md를 읽고 지정한 원자료로 2026-10-30 기준, 2026-10-26~30 기획팀 주간보고서 초안을 작성하도록 요청합니다.
3. 실제 결과를 저장한 뒤에만 별도 reviewer-answers.zip의 reviewer-only/test-cases.expected.json을 열어 상태·근거·누락 처리를 대조합니다. 검토자 ZIP은 학생용 자료 묶음과 별도입니다.
4. conflicting에서는 tasks.md와 completion-notice.md를 함께 입력합니다. not-applicable은 초대문 요청의 적용 범위를 판단합니다. access-failure는 실제 실패 측정이 아닌 가정한 도구 반환을 검토합니다.

실행하지 않았다면 예상 검토로 기록합니다. 개인 실습은 my-skill-template.md에 작성하고 별도 시험 입력과 기대 결과를 만듭니다.
''')
with zipfile.ZipFile(ex/'weekly-brief-package.zip','w',zipfile.ZIP_DEFLATED) as z:
 for root in [old,practice]:
  for f in root.rglob('*'):
   if f.is_file():z.write(f,f.relative_to(ex))
 for f in ['README.md','my-skill-template.md']:z.write(ex/f,f)
with zipfile.ZipFile(ex/'reviewer-answers.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in answers.glob('*.json'):z.write(f,'reviewer-only/'+f.name)
body='<main class="document"><h1>실습과 다시 찾아보기</h1><p>44–50분 작성, 50–53분 시험, 53–55분 검토에 사용합니다.</p><ul><li><a href="examples/my-skill-template.md">빈 SKILL.md 작성 틀</a></li><li><a href="examples/weekly-brief-package.zip">Skill·원자료 ZIP</a></li><li><a href="examples/README.md">시험 실행 순서</a></li><li><a href="examples/reviewer-answers.zip">검토자 답안 ZIP (모델 입력에서 제외)</a></li><li><a href="examples/teacher-demo.zip">실제 명시 사용 시연 ZIP</a></li></ul><h2>실행 순서</h2>'+md((ex/'README.md').read_text())+'<h2>다른 앱으로 옮기기</h2>'+visual(next(s for s in S if s['key']=='transfer'))+'</main>'
(P/'supplement.html').write_text(shell('실습 자료',body))
urls=list(dict.fromkeys(u for s in S for u in s.get('sources',[])))
body='<main class="document"><h1>출처와 확인 범위</h1><p>공식 자료에 근거한 개념 설명과 교육용 사례를 구분합니다. 공개·표준화 날짜는 Anthropic 원문의 두 이정표입니다. 앱별 설치·선택 방법은 사용 전 해당 공식 문서에서 확인하세요.</p><ol>'+''.join('<li><a href="'+e(u)+'">'+e(u)+'</a></li>' for u in urls)+'</ol><h2>사례와 시연</h2>'+para(tr['description'])+para(tr['limits'])+'<p>예외 문제는 기대 동작의 설명이며 실행 결과가 아닙니다. 60분은 발표 계획 예산입니다.</p><h2>글꼴과 라이선스</h2><p>본문과 코드 내 한글은 동일한 Noto Sans CJK KR을 사용합니다. 배포 글꼴은 전체 한국어 글리프를 포함하는 WOFF2입니다. 코드는 시스템 고정폭 라틴 글꼴과 명시적 Noto 한글 fallback을 사용합니다.</p><p><a href="assets/NOTO-CJK-THIRD-PARTY-LICENSE.txt">Noto CJK 라이선스</a> · <a href="LICENSE">프로젝트 MIT 라이선스</a></p></main>'
(P/'sources.html').write_text(shell('출처와 확인 범위',body))
(P/'README.md').write_text('''# Agent Skill 강의

기획팀의 주간보고서 사례로 업무 판단을 SKILL.md에 정리하는 한국어 60분 강의입니다. 본편 28장, 44–55분 실습 11분, 55–60분 Q&A 5분을 포함합니다. 시간은 발표 계획입니다.

- index.html: 키보드·장 선택·주소 해시를 지원하는 발표 화면
- read.html: 모바일 기본 경로, JavaScript 없이 읽는 전체 본문·자료·문제·해설
- notes.html: 전체 본문에 발표자 확장을 더한 정적 문서
- teacher-demo.html: 실제 명시 파일 사용의 다섯 단계와 초안
- supplement.html: 작성 틀, 분리된 원자료·검토자 답안, ZIP
- sources.html: 공식 출처와 라이선스

course-source.json이 28장의 본문·자료·답·노트 정본입니다. `python3 scripts/build.py`로 정적 페이지와 자료 묶음을 생성합니다. 다른 저작 소스나 시연 묶음은 `--source PATH --demo PATH`로 지정합니다. 플레이어는 player.js, 모든 화면 스타일은 lecture.css입니다. 로컬 파일 열기 또는 정적 HTTP 서버로 이용합니다.

합성 사례의 기준일은 2026-10-30, 보고 기간은 2026-10-26~30입니다. 시연은 제작 세션에서 이미 본 자료를 명시적으로 다시 읽고 적용한 실제 기록입니다. 새 세션의 자동 선택·블라인드 평가·성능 향상 실험이 아닙니다. trace.json과 run-output.md를 바이트 그대로 제공합니다. 예외 답안은 입력과 별도입니다.

일반 한글은 Noto Sans CJK KR Regular/Bold 한 계열을 사용합니다. 전체 한국어 글리프를 보존한 WOFF2를 동봉하며 라이선스는 assets/NOTO-CJK-THIRD-PARTY-LICENSE.txt입니다. 코드의 라틴 고정폭 글꼴은 시스템 monospace, 한글은 동일 Noto 글꼴입니다. 프로젝트 코드는 MIT입니다.
''')
print('Built',len(S),'slides;',sum(s['seconds'] for s in S),'seconds')
