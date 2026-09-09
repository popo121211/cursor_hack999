# FROM.ME

1박2일 해커톤 MVP — AI Future Self 타임캡슐

## 핵심

목표를 세운 순간, 미래의 내가 오늘을 남긴다.

- 입력: 목표 / 이유 / 미래의 나에게 직접 전할 말 / 날짜 / 말투
- 선택: 음성 메모(녹음 또는 파일) — 나중에 결과에서 재생
- AI: 지킨 나 / 미룬 나 듀얼 메시지 + 행동 결과 재분기
- 결과: 편지 + 오늘의 행동 + 알림 체험

## 시작

```bash
npm install
cp .env.example .env.local
# OPENAI_API_KEY=...
npm run dev
```

`OPENAI_API_KEY`가 없어도 Fallback 메시지로 전체 플로우 체험이 가능합니다.

## 배포 (Vercel)

1. GitHub 리포 연결
2. Environment Variables에 `OPENAI_API_KEY` 추가
3. Deploy — HTTPS에서 마이크 녹음 가능

## 스택

Next.js · TypeScript · Tailwind CSS · OpenAI · localStorage · IndexedDB
