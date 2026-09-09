export type Tone = "gentle" | "realistic" | "spicy";

export type Emotion =
  | "overwhelmed"
  | "anxious"
  | "three_days"
  | "hard_to_start"
  | null;

export interface CapsuleInput {
  goal: string;
  reason: string;
  targetDate: string;
  tone: Tone;
  emotion?: Emotion;
  createdAt: string;
}

export interface CapsuleAIResult {
  headline: string;
  message: string;
  action: string;
  notificationMessage: string;
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
  { value: "gentle", label: "다정하게", hint: "따뜻하지만 유치하지 않게" },
  { value: "realistic", label: "현실적으로", hint: "차분하게 이유를 상기" },
  { value: "spicy", label: "매콤하게", hint: "직설적이되 모욕 없이" },
];

export const STORAGE_KEY = "fromme.capsules.v1";
export const MAX_STORED_CAPSULES = 5;
