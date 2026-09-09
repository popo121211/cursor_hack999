import { CapsuleInput } from "./types";

/** 발표용 프리셋 입력 */
export const DEMO_INPUT: Omit<CapsuleInput, "createdAt"> = {
  goal: "이번 공모전에서 수상하기",
  reason: "내가 만든 서비스를 처음으로 사람들에게 인정받고 싶어서",
  targetDate: "2026-12-31",
  tone: "realistic",
};
