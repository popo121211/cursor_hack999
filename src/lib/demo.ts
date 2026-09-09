import { CapsuleInput } from "./types";

/** 발표용 프리셋 — 절절한 목표 + 의미 있는 이유 */
export const DEMO_INPUT: Omit<CapsuleInput, "createdAt"> = {
  goal: "내 이름으로 만든 첫 서비스를 끝까지 세상에 내놓기",
  reason:
    "시작만 하고 놓아둔 목표가 너무 많아서. 이번에는 누군가의 초심을 지켜주는 결과물로, 나부터 끝까지 책임지고 싶어서.",
  targetDate: "2026-10-31",
  tone: "gentle",
};
