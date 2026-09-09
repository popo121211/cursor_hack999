export type Tone = "gentle" | "realistic" | "spicy";

export type Emotion =
  | "overwhelmed"
  | "anxious"
  | "three_days"
  | "hard_to_start"
  | null;

/** 오늘을 지킨 미래 vs 오늘을 미룬 미래 */
export type FuturePath = "kept" | "missed";

/** 사용자가 오늘 행동을 실제로 했는지 */
export type ActionOutcome = "done" | "skipped";

export interface CapsuleInput {
  goal: string;
  reason: string;
  /** 지금의 내가 미래의 나에게 직접 남기는 메시지 */
  letterToFuture?: string;
  targetDate: string;
  tone: Tone;
  emotion?: Emotion;
  createdAt: string;
  /** 음성으로 이유를 입력했는지 (데모/심사 포인트) */
  reasonFromVoice?: boolean;
}

/** AI가 입력에서 먼저 뽑는 해석 레이어 */
export interface FutureReading {
  coreDesire: string;
  likelyFriction: string;
  stakeIfSkipped: string;
  personaLabel: string;
}

export interface FutureMessage {
  headline: string;
  message: string;
  action: string;
  notificationMessage: string;
}

export interface CapsuleAIResult extends FutureMessage {
  reading: FutureReading;
  missed: FutureMessage;
  /** 재분기 후 AI가 남긴 한 줄 요약 */
  branchShift?: string;
}

export interface Capsule {
  id: string;
  input: CapsuleInput;
  result: CapsuleAIResult;
  promiseAccepted: boolean;
  promiseCompleted?: boolean;
  actionOutcome?: ActionOutcome | null;
  /** 내가 직접 읽은 편지 내용 */
  selfReading?: {
    path: FuturePath;
    transcript: string;
    savedAt: string;
  } | null;
  /** 내가 직접 남긴 말을 읽어 저장한 내용 */
  selfLetterReading?: {
    transcript: string;
    savedAt: string;
  } | null;
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
