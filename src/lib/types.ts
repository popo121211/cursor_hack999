export type Tone = "gentle" | "realistic" | "spicy";

export type Emotion =
  | "overwhelmed"
  | "anxious"
  | "three_days"
  | "hard_to_start"
  | null;

/** 오늘을 지킨 미래 vs 오늘을 미룬 미래 */
export type FuturePath = "kept" | "missed";

export interface CapsuleInput {
  goal: string;
  reason: string;
  targetDate: string;
  tone: Tone;
  emotion?: Emotion;
  createdAt: string;
}

/** AI가 입력에서 먼저 뽑는 해석 레이어 — 단순 편지 생성기와 차별점 */
export interface FutureReading {
  /** 이유가 가리키는 진짜 바람 (한 줄) */
  coreDesire: string;
  /** 작심삼일로 빠지기 쉬운 지점 */
  likelyFriction: string;
  /** 오늘을 비웠을 때 잃는 것 */
  stakeIfSkipped: string;
  /** 이 타임캡슐의 미래 자아 호칭 */
  personaLabel: string;
}

/** 단일 Future Self 메시지 묶음 */
export interface FutureMessage {
  headline: string;
  message: string;
  action: string;
  notificationMessage: string;
}

export interface CapsuleAIResult extends FutureMessage {
  reading: FutureReading;
  /** 오늘을 미룬 미래의 나 — 실패를 인정하되 다시 기회를 준다 */
  missed: FutureMessage;
}

export interface Capsule {
  id: string;
  input: CapsuleInput;
  result: CapsuleAIResult;
  promiseAccepted: boolean;
  promiseCompleted?: boolean;
  updatedAt: string;
}

export const TONE_OPTIONS: { value: Tone; label: string; hint: string }[] = [
  { value: "gentle", label: "다정하게", hint: "담백하고 따뜻하게" },
  { value: "realistic", label: "현실적으로", hint: "담담하게, 이유를 다시" },
  { value: "spicy", label: "매콤하게", hint: "직설적이되 모욕 없이" },
];

export const STORAGE_KEY = "fromme.capsules.v2";
export const MAX_STORED_CAPSULES = 5;

export function pickFutureMessage(
  result: CapsuleAIResult,
  path: FuturePath,
): FutureMessage {
  if (path === "missed") return result.missed;
  return {
    headline: result.headline,
    message: result.message,
    action: result.action,
    notificationMessage: result.notificationMessage,
  };
}
