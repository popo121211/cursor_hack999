# FROM.ME 개발 실행 순서

이 문서는 해커톤 MVP를 **이 순서대로** 진행하기 위한 체크리스트다.

## 고정 순서

1. [x] Next.js + TS + Tailwind 스캐폴딩
2. [x] 기반: types / storage / prompt / fallback / demo
3. [x] 랜딩 `/`
4. [x] 입력 `/create`
5. [x] 결과 + 알림 UI `/result/[id]`
6. [x] AI API `/api/generate` + 로딩 연출
7. [x] 저장·약속·다시보기 `/capsule`
8. [x] Fallback + 발표 프리셋 + README

## 다음 (배포/발표)

1. [ ] `.env.local`에 `OPENAI_API_KEY` 설정
2. [ ] Vercel 배포 + 환경변수 등록
3. [ ] 발표 데모 1회 리허설 (예시 채우기 → 편지 → 알림 체험)

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```
