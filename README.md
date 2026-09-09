# FROM.ME

1박2일 해커톤 MVP — AI Future Self 타임캡슐

## 핵심

목표를 세운 순간, 미래의 내가 오늘을 남긴다.

- 입력: 목표 / 이유 / 날짜 / 말투
- AI: Future Self Persona 메시지 생성
- 결과: 편지 + 오늘의 행동 + 알림 체험

## 시작

```bash
npm install
cp .env.example .env.local
# OPENAI_API_KEY=...
npm run dev
```

`OPENAI_API_KEY`가 없어도 Fallback 메시지로 전체 플로우 체험이 가능합니다.

## 스택

Next.js · TypeScript · Tailwind CSS · OpenAI · localStorage
