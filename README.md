# Agent Skill 강의

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
