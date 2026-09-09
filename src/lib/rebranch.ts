import {
  ActionOutcome,
  CapsuleAIResult,
  CapsuleInput,
  FutureMessage,
} from "./types";
import { buildFallbackResult, ensureDualResult } from "./fallback";

export function buildRebranchSystemPrompt() {
  return `당신은 FROM.ME의 미래 분기 엔진이다.
사용자의 오늘 행동 결과(done/skipped)를 보고 Future Self 메시지를 다시 쓴다.

규칙:
1. 예언/확정 금지. 가상 페르소나.
2. done이면 kept 쪽을 강화하고, 다음 행동 난이도를 아주 살짝만 올려도 된다.
3. skipped이면 missed 쪽을 강화하되 모욕 금지. 행동은 더 작고 쉽게.
4. reading은 기존 해석을 유지하되 friction/stake를 결과에 맞게 한 줄씩 다듬을 수 있다.
5. branchShift: 이번 분기 변화를 한 문장으로. 예: "오늘 해낸 쪽으로 미래가 기울었다."
6. AI 자기계발 문장 금지. 짧은 구어체.
7. JSON만 출력.

스키마:
{
  "branchShift": "",
  "reading": {
    "coreDesire": "",
    "likelyFriction": "",
    "stakeIfSkipped": "",
    "personaLabel": ""
  },
  "headline": "",
  "message": "",
  "action": "",
  "notificationMessage": "",
  "missed": {
    "headline": "",
    "message": "",
    "action": "",
    "notificationMessage": ""
  }
}`;
}

export function buildRebranchUserPrompt(args: {
  input: CapsuleInput;
  previous: CapsuleAIResult;
  outcome: ActionOutcome;
}) {
  return `목표: ${args.input.goal}
이유: ${args.input.reason}
말투: ${args.input.tone}
오늘 행동 결과: ${args.outcome === "done" ? "해냄(done)" : "못 함/미룸(skipped)"}
이전 행동 제안: ${args.previous.action}
이전 해석: ${JSON.stringify(args.previous.reading)}

결과에 맞춰 미래를 다시 분기해 JSON으로 작성.`;
}

function softenAction(action: string): string {
  if (action.includes("15분")) return action.replace("15분", "5분");
  if (action.includes("20개")) return action.replace("20개", "5개");
  if (action.includes("10분")) return action.replace("10분", "3분");
  return `일단 관련 화면만 30초 열어보기 — (${action})`;
}

function hardenAction(action: string): string {
  if (action.includes("5분")) return action.replace("5분", "10분");
  if (action.includes("10개")) return action.replace("10개", "15개");
  if (action.includes("3분")) return action.replace("3분", "8분");
  return action;
}

/** API 없이 재분기 Fallback */
export function buildRebranchFallback(args: {
  input: CapsuleInput;
  previous: CapsuleAIResult;
  outcome: ActionOutcome;
}): CapsuleAIResult {
  const base = ensureDualResult(args.previous, args.input);
  const reading = { ...base.reading };

  if (args.outcome === "done") {
    const kept: FutureMessage = {
      headline: "오늘을 이은 쪽으로 기울었다",
      message: [
        `오늘 네가 "${base.action}"을(를) 해낸 기록이 남았어.`,
        "",
        `이유 — "${args.input.reason}" — 가 서류가 아니라 행동이 됐어.`,
        "",
        "오늘의 네가 빠지지 않아서, 이 장면이 유지된다. 내일도 과하게 말고 이어서.",
      ].join("\n"),
      action: hardenAction(base.action),
      notificationMessage: "오늘 이은 쪽이 남았어. 내일도 한 번만.",
    };
    const missed: FutureMessage = {
      ...base.missed,
      headline: "아직 열려 있는 다른 갈래",
      message: [
        "지금은 이은 쪽에 가깝다.",
        "",
        "그래도 하루 비우면 다시 멀어질 수 있어. 연결만 끊지 마.",
      ].join("\n"),
      action: softenAction(base.missed.action),
      notificationMessage: "이은 쪽이지만, 끊기면 다시 멀어진다.",
    };
    reading.likelyFriction = "한 번 해낸 뒤 '오늘은 됐다'로 멈추기";
    reading.stakeIfSkipped = "오늘 만든 연결이 하루 만에 다시 끊길 수 있음";
    return {
      ...kept,
      reading,
      missed,
      branchShift: "오늘 해낸 쪽으로 미래가 기울었다.",
    };
  }

  const missed: FutureMessage = {
    headline: "비운 날이 남긴 쪽",
    message: [
      `오늘은 "${base.action}"을(를) 못 한 쪽으로 기울었어.`,
      "",
      `그래도 "${args.input.reason}"는 아직 유효해. 끝이라고 쓰지 마.`,
      "",
      "더 작은 행동으로 다시 이으면 된다.",
    ].join("\n"),
    action: softenAction(base.action),
    notificationMessage: "비웠어도 끝 아님. 더 작게 다시.",
  };
  const kept: FutureMessage = {
    ...base,
    headline: "아직 되돌릴 수 있는 쪽",
    message: [
      "지금은 미룬 쪽에 가깝다.",
      "",
      "그래도 다음 작은 행동 하나가 다시 이쪽을 연다.",
      "",
      `이유: "${args.input.reason}"`,
    ].join("\n"),
    action: softenAction(base.action),
    notificationMessage: "미룬 쪽이지만, 다음 행동이 분기점.",
  };
  reading.likelyFriction = "시작 문턱에서 하루를 통째로 넘기기";
  reading.stakeIfSkipped = `"${args.input.goal}"과의 거리가 하루 더 벌어짐`;

  return {
    ...kept,
    reading,
    missed,
    branchShift: "오늘을 비운 쪽으로 미래가 기울었다. 다만 다시 열 수 있다.",
  };
}

export function emptyPrevious(): CapsuleAIResult {
  return buildFallbackResult({
    goal: "목표를 이어가기",
    reason: "중간에 놓치지 않기 위해서",
    targetDate: new Date().toISOString().slice(0, 10),
    tone: "realistic",
    createdAt: new Date().toISOString(),
  });
}
