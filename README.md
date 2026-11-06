# Agent Skill · 다음 금요일에도 같은 기준으로

[강의 열기](https://pheanor-agent.github.io/agent-skill-lecture/) · [강의 노트](https://pheanor-agent.github.io/agent-skill-lecture/notes.html) · [보충 자료](https://pheanor-agent.github.io/agent-skill-lecture/supplement.html)

한국어 본편 26장. 본 강의 55분 + Q&A 5분. 한 장 보고서가 실제 조회로 첫 칸을 채우고, 반복 절차를 Skill로 묶어 정상·예외 결과를 확인하는 과정을 따라갑니다.

## 학습 흐름

|시간|내용|장|
|---|---|---|
|0–5분|목표 보고서와 완료 기준|1–3|
|5–10분|실제 조회가 보고서 한 칸을 채움|4–5|
|10–22분|절차 작성, Skill의 유래·실물·선택 조건|6–10|
|22–29분|배치·호출·읽기·정상 결과|11–13|
|29–37분|공통 기준과 외부 연결이 필요한 조건|14–16|
|37–46분|같은 자료의 누락·비해당·실패 검증|17–20|
|46–55분|내 업무 네 줄 + 시험 하나 작성·검토|21–25|
|55–60분|Q&A|26|

MCP의 세 기능, 두 호스트의 전체 경로, 선택적 파일 구성은 `supplement.html`에 있습니다. [실습 양식](examples/my-first-skill-worksheet.md)을 내려받거나 종이에 작성합니다. 초기 정상 사례에는 아직 설명하지 않은 AGENTS.md/MCP를 넣지 않고, 같은 좌표의 관계도에 필요할 때 추가합니다.

## 발표와 모션

- ← / → / Space: 앞뒤 이동. P: 모션 정지·재개. R: 다시 보기. F: 전체 화면.
- 페이지 번호는 목차, ⋯는 재생·노트·보충·출처·인쇄 메뉴입니다.
- 모든 글과 비교는 진입 순간부터 완결되어 있습니다. 사례의 발전은 장과 장 사이에서 일어납니다. 장 안에서는 선·표시·국소 강조가 관계를 한 번 안내한 뒤 멈춥니다.
- 페이지는 자동 이동하지 않습니다. 메뉴·목차·숨겨진 탭에서 모션을 정지하고, 장면 이탈 시 작업을 정리합니다.
- `prefers-reduced-motion`과 인쇄는 완결된 정지 상태를 보여줍니다. 발표 노트에는 배정 시간·질문·다음 장이 필요한 이유가 있습니다.
- 발표 캔버스는 1600×900 고정이며 모든 해상도에서 균등하게 확대·축소합니다. 13/16번 관계도는 같은 논리 좌표를 사용합니다.

## 파일과 계약

- `astra-scenes.js`: 새 26장 원고·장면·노트·모션 계획. `ASTRA_SLIDES`의 `id`, `section`, `seconds`, `startSeconds`, `previousSlides`, `motionPlan`이 기준입니다. 21–25번에는 `workshop`이 있습니다.
- `astra-scenes.css`, `narrative.css`: 기본 색·글꼴과 서사 장면 레이아웃.
- `motion-guide.js/css`: 단일 모션 엔진. `DeckMotion.mount(root,slide,{reduced})`는 `cleanup`, `setPaused`, `restart`, `getState`를 제공합니다. 상태에는 `active`, `finished`, `phase`, `elapsed`, `cycle`, `duration`이 있고 자동 반복은 0입니다.
- 이전 `auto-demo.js`의 특정 ID 콘텐츠 교체·데모 계층은 제거했습니다. 모든 장이 같은 엔진을 사용하며 `DeckMotion.motionIds`는 1~26입니다.
- `deck.js`, `ui.css`, `index.html`: 발표 UI·고정 캔버스·인쇄. `notes.html/js`: 진행표. `supplement.html`: 보충·실습 링크.
- `examples/weekly-brief/`: 실제 SKILL.md와 합성 입력·서식·시험 데이터. 본편과 파일 모두 `assets/report-template.md`를 사용합니다. 예제에 references/scripts 파일은 없으며 보충 페이지에서 선택적 구성으로만 설명합니다.

합성 예시는 실제 성능 측정이나 API 호출이 아닙니다. M-03이 없더라도 확인된 I-08 막힘 1건은 유지하고, 검토 일정만 미확인으로 남깁니다. 예제는 자동 설치되지 않으며 초안 작성만 다룹니다.

정적 파일만 사용하며 오프라인에서 `index.html`을 열 수 있습니다. 자체 코드·원고는 MIT, 로컬 Pretendard는 `assets/PRETENDARD-OFL.txt`를 따릅니다. 참고 원리는 출처 페이지에 남겨 두었습니다.
