import { CapsuleInput } from "./types";

function daysFromToday(days: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 발표용 프리셋 — 날짜는 호출 시점에 오늘+60일로 계산 */
export function getDemoInput(): Omit<CapsuleInput, "createdAt"> {
  return {
    goal: "내 이름으로 만든 첫 서비스를 끝까지 세상에 내놓기",
    reason:
      "시작만 하고 놓아둔 목표가 너무 많아서. 이번에는 누군가의 초심을 지켜주는 결과물로, 나부터 끝까지 책임지고 싶어서.",
    targetDate: daysFromToday(60),
    tone: "gentle",
  };
}

/** @deprecated use getDemoInput() for fresh dates */
export const DEMO_INPUT = getDemoInput();
