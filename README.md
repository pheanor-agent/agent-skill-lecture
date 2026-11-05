# Agent Skill · 설명과 과정 시연

[강의 열기](https://pheanor-agent.github.io/agent-skill-lecture/) · [강의 노트](https://pheanor-agent.github.io/agent-skill-lecture/notes.html)

한국어 36장, 본 강의 55분 + Q&A 5분. 주간보고서 한 사례로 Agent Skill의 유래·사용법과 Tool call, AGENTS.md, MCP의 차이를 설명합니다.

## 발표

- 설명·비교·코드·경로·예제는 진입 순간부터 모두 보이며, 시간이 지나도 내용과 배치가 바뀌지 않습니다.
- 15번 ‘필요한 만큼 읽기’와 21번 ‘보고서 생성 과정’만 구획된 영역에서 한 번 시연합니다. 최종 상태를 유지하며 반복하거나 다음 슬라이드로 자동 이동하지 않습니다.
- ← / → / Space: 앞뒤 이동. 마우스를 움직이면 작은 이동 메뉴가 나타납니다.
- 두 시연 장에서만 R: 다시 보기, P: 일시정지·이어 보기. F: 전체 화면.
- 페이지 번호: 목차. ⋯: 전체 화면, 필요한 재생 보조, 별도 강의 노트·출처·인쇄.
- 시간배정과 발표 노트는 청중 화면에 표시하지 않고 별도 노트에 둡니다.

## 시연과 배치

15번은 문서를 읽어 작업 문맥에 더하는 과정을 약 18초, 21번은 요청부터 보고서 확인까지의 과정을 진입 후 약 27.5초에 걸쳐 보여줍니다. 제목·정의·핵심 설명은 고정되고, `data-demo-region` 안의 객체·자료 이동·국소 강조만 변합니다. 모든 값은 합성 데이터이며 실제 API 호출은 없습니다. 누락 비교에서 I-08의 막힘 1건은 그대로 유지합니다.

메뉴·목차·숨겨진 탭에서는 시연을 정지하고 복귀하면 이어갑니다. 장면 이탈 시 작업을 정리합니다. 모션 감소 설정과 인쇄에서는 완결된 정지 상태를 표시합니다.

발표 캔버스는 모든 해상도에서 1600×900 좌표를 유지하고 전체를 같은 비율로 확대·축소합니다. 연결선과 노드는 별도 재배치되지 않습니다. 새 시연의 SVG 도형과 HTML 라벨도 고정된 같은 논리 좌표를 씁니다. 휴대폰 세로에서도 구도를 유지하며 긴 설명은 별도 노트에서 읽을 수 있습니다.

## 자료와 수정

- `astra-scenes.js/css`: 36장 기본 장면과 의미 색·레이아웃. `assets/agent-loop.svg`는 원자화한 순환 도식입니다.
- `auto-demo.js`: 12장 콘텐츠를 완결된 설명으로 정리하고, 15/21번에만 한 번 재생하는 과정 시연을 연결합니다. `AutoDemo.demoIds`는 `[15,21]`입니다.
- `AutoDemo.mount(root, slide, {reduced})`는 `cleanup`, `setPaused`, `restart`, `getState`를 제공합니다. 정적 장에서는 타이머를 만들지 않습니다. 상태에는 `active`, `finished`, `phase`, `elapsed`, `cycle`이 포함되며 자동 반복 횟수는 항상 0입니다.
- `data-page-text`: 고정 본문. `data-demo-region`: 시연이 변할 수 있는 유일한 영역. 영역 밖의 텍스트·배치·스타일은 재생 중 변하지 않습니다.
- `deck.js`, `ui.css`, `index.html`: 최소 인터페이스와 고정 캔버스. `notes.html`: 설명과 전환. `sources.html`: 공식 원문·확인 날짜.
- `examples/weekly-brief/`: SKILL.md·합성 자료·서식·테스트 예제. 자동 설치되지 않습니다.

정적 파일만 사용하며 오프라인에서도 `index.html`을 열 수 있습니다. 기존 p-hermes v1/v2와 reveal.js, Slidev, impress.js에서 참고한 원리는 출처 페이지에 있습니다. 자체 코드·원고는 MIT, 로컬 Pretendard는 `assets/PRETENDARD-OFL.txt`를 따릅니다.
