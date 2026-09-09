import {
  CapsuleAIResult,
  CapsuleInput,
  FutureMessage,
  FutureReading,
  Tone,
} from "./types";

function buildReading(input: CapsuleInput): FutureReading {
  const reason = input.reason.trim();
  const shortReason =
    reason.length > 36 ? `${reason.slice(0, 36)}…` : reason;

  return {
    coreDesire: shortReason,
    likelyFriction: "초반 열정이 식으면, 이유를 다시 꺼내기 전에 미루게 됨",
    stakeIfSkipped: `"${input.goal}"을(를) 향해 가던 오늘의 연결이 끊김`,
    personaLabel: "초심을 붙든 나",
  };
}

function toneKept(tone: Tone, reason: string, goal: string) {
  const quote = reason.length > 42 ? `${reason.slice(0, 42)}…` : reason;
  switch (tone) {
    case "gentle":
      return {
        headline: "그 문장을 안 놓친 아침",
        opening: `모니터 불빛 아래, "${goal}" 관련 파일을 다시 연 상태야.`,
        middle: `메모에 남은 건 이거야. "${quote}"`,
        close: "오늘의 네가 빠지면 이 장면도 없어. 거창할 필요 없고, 오늘 할 수 있는 것만.",
      };
    case "spicy":
      return {
        headline: "도망 안 친 날의 결과",
        opening: `"${goal}" 쪽으로 하루를 붙든 나야. 연설은 없고, 기록만 있어.`,
        middle: `네가 남긴 이유: "${quote}"`,
        close: "오늘 너 없으면 이 미래도 없다. 변명 저장하지 말고, 지금 할 일 하나만.",
      };
    case "realistic":
    default:
      return {
        headline: "연결이 남은 쪽의 나",
        opening: `"${goal}"을(를) 완전히 끝낸 상태는 아니야. 다만 끊기지 않은 쪽이지.`,
        middle: `중심에 남은 문장: "${quote}"`,
        close: "오늘의 선택이 이 장면을 만든다. 감정은 나중에 두고, 작은 행동부터.",
      };
  }
}

function toneMissed(tone: Tone, reason: string, goal: string) {
  const quote = reason.length > 42 ? `${reason.slice(0, 42)}…` : reason;
  switch (tone) {
    case "gentle":
      return {
        headline: "비워둔 날의 잔상",
        opening: `"${goal}" 폴더는 그대로고, 손은 다른 데로 가 있어.`,
        middle: `그래도 "${quote}" — 이건 아직 안 지웠어. 다시 열면 된다.`,
        close: "실패로 끝난 버전은 아니야. 지금 다시 잇으면 돼.",
      };
    case "spicy":
      return {
        headline: "미룬 쪽의 나",
        opening: `적어놓고 비운 결과야. "${goal}"은(는) 멀어졌고.`,
        middle: `근데 "${quote}"는 아직 남아 있어. 자책 말고 재접속.`,
        close: "끝이라고 쓰지 마. 오늘 한 번만 다시 열어.",
      };
    case "realistic":
    default:
      return {
        headline: "끊긴 연결, 남은 선택",
        opening: `오늘을 비운 누적이 "${goal}"과의 거리를 벌려 놓았어.`,
        middle: `이유 — "${quote}" — 는 아직 유효해. 다시 시작하면 갈래가 바뀐다.`,
        close: "짧게 인정하고, 다음 행동으로 분기점을 옮겨.",
      };
  }
}

function defaultAction(goal: string, missed: boolean): string {
  const g = goal.toLowerCase();
  if (g.includes("토익") || g.includes("영어") || g.includes("toeic")) {
    return missed
      ? "단어장 열고 10개만 표시하기"
      : "영단어 20개 소리 내어 읽고 표시하기";
  }
  if (g.includes("운동") || g.includes("헬스") || g.includes("다이어트")) {
    return missed ? "운동복 입고 5분 걷기" : "운동복 입고 10분 걷기";
  }
  if (g.includes("자소서") || g.includes("취업") || g.includes("면접")) {
    return missed
      ? "자소서 파일 열고 한 줄만 고치기"
      : "자기소개서 첫 문장 하나 쓰기";
  }
  if (
    g.includes("공모전") ||
    g.includes("해커톤") ||
    g.includes("발표") ||
    g.includes("서비스") ||
    g.includes("세상에")
  ) {
    return missed
      ? "작업 문서 다시 열고 문장 1개만 고치기"
      : "오늘 꼭 보여줄 핵심 문장 1개 적기";
  }
  return missed
    ? "관련 작업 10분만 다시 시작하기"
    : "관련 작업 15분 타이머 맞추고 진행하기";
}

function shortGoal(goal: string) {
  return goal.length > 18 ? `${goal.slice(0, 18)}…` : goal;
}

function truncatePush(text: string) {
  return text.length > 40 ? `${text.slice(0, 39)}…` : text;
}

function toMessage(
  lines: { headline: string; opening: string; middle: string; close: string },
  action: string,
  notificationMessage: string,
): FutureMessage {
  return {
    headline: lines.headline,
    message: [lines.opening, "", lines.middle, "", lines.close].join("\n"),
    action,
    notificationMessage: truncatePush(notificationMessage),
  };
}

export function buildFallbackResult(input: CapsuleInput): CapsuleAIResult {
  const reading = buildReading(input);
  const kept = toMessage(
    toneKept(input.tone, input.reason, input.goal),
    defaultAction(input.goal, false),
    `${shortGoal(input.goal)} — 오늘의 연결이 미래야.`,
  );
  const missed = toMessage(
    toneMissed(input.tone, input.reason, input.goal),
    defaultAction(input.goal, true),
    `${shortGoal(input.goal)} — 끊어도, 다시 이을 수 있어.`,
  );

  return { ...kept, reading, missed };
}

export function ensureDualResult(
  result: CapsuleAIResult | (FutureMessage & {
    missed?: FutureMessage;
    reading?: FutureReading;
  }),
  input: CapsuleInput,
): CapsuleAIResult {
  const fallback = buildFallbackResult(input);
  const missed =
    result.missed?.headline && result.missed.message && result.missed.action
      ? result.missed
      : fallback.missed;
  const reading =
    result.reading?.coreDesire &&
    result.reading.likelyFriction &&
    result.reading.stakeIfSkipped &&
    result.reading.personaLabel
      ? result.reading
      : fallback.reading;

  return {
    headline: result.headline || fallback.headline,
    message: result.message || fallback.message,
    action: result.action || fallback.action,
    notificationMessage: result.notificationMessage || fallback.notificationMessage,
    reading,
    missed,
  };
}
