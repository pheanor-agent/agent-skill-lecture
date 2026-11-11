# 회의록 Skill 시연 자료

강의 11장의 실행 기록을 그대로 재현할 수 있는 자료입니다. 녹취는 교육용 합성 자료입니다.

```
examples/meeting-notes/
├─ .claude/skills/meeting-notes/   ← Skill 폴더 (SKILL.md, template.md, scripts/find_todos.py)
├─ 녹취_1110.txt                    ← 입력
└─ 회의록_1110.md                   ← 실제 실행 결과
```

## 따라 하기 (Claude Code)

```bash
cd examples/meeting-notes
claude "어제 회의 녹취, 팀 양식으로 정리해 줘"
```

## 2026-11-11 실행 기록 (Claude Code 2.1.317, 16초)

1. `Skill("meeting-notes")` — 설명이 요청과 맞아 본문을 불러옴
2. `Bash("ls …")` — 폴더의 파일 확인 (강의 화면에서는 생략)
3. `Read("녹취_1110.txt")`
4. `Read("template.md")` — 양식 확인
5. `Read("scripts/find_todos.py")` — 스크립트 내용 확인 (강의 화면에서는 생략)
6. `Bash("python3 find_todos.py 녹취_1110.txt")` — 할 일 후보 추출
7. `Write("회의록_1110.md")` — 담당이 없는 공지 초안은 '미정'

같은 요청이라도 실행할 때마다 중간 단계는 조금씩 달라질 수 있습니다.
