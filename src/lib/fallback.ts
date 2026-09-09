import { CapsuleAIResult, CapsuleInput, FutureMessage, Tone } from "./types";

function toneKept(tone: Tone, reason: string, goal: string) {
  switch (tone) {
    case "gentle":
      return {
        headline: "그때의 이유, 아직 여기 있어.",
        opening: `처음 네가 "${goal}"을(를) 적었을 때, 그 마음 꽤 진지했잖아.`,
        middle: `"${reason}"라는 말이 아직도 나를 붙잡고 있어.`,
        close: "완벽한 하루는 필요 없어. 아주 작은 한 걸음이면 돼.",
      };
    case "spicy":
      return {
        headline: "변명은 나중에 하고, 오늘은 한 번만.",
        opening: `"${goal}" 적어놓고 또 미룰 생각이지?`,
        middle: `네가 직접 쓴 이유야. "${reason}" — 이건 꽤 간절했잖아.`,
        close: "거창할 필요 없어. 오늘 할 수 있는 것만 해.",
      };
    case "realistic":
    default:
      return {
        headline: "목표보다 먼저, 이유를 다시 보자.",
        opening: `네가 세운 목표는 "${goal}"이야.`,
        middle: `그리고 이유는 분명했어. "${reason}"`,
        close: "감정은 흔들려도, 오늘의 작은 행동은 선택할 수 있어.",
      };
  }
}

function toneMissed(tone: Tone, reason: string, goal: string) {
  switch (tone) {
    case "gentle":
      return {
        headline: "놓쳤어도, 끝은 아니야.",
        opening: `솔직히 말할게. "${goal}"을(를) 향해 가지 못한 날들이 쌓였어.`,
        middle: `그래도 "${reason}" — 그 이유를 아직 기억하고 있어. 그래서 다시 기회가 있어.`,
        close: "오늘을 놓쳤다고 미래 전체가 닫히진 않아. 지금 다시 열면 돼.",
      };
    case "spicy":
      return {
        headline: "미룬 나야. 근데 아직 문은 열려 있어.",
        opening: `그래, "${goal}" — 또 미뤘지. 그 결과가 지금의 나야.`,
        middle: `근데 네가 적어둔 "${reason}"는 아직 안 사라졌어. 자책만 하지 마. 기회는 다시 오면 잡아.`,
        close: "실패 버전이라고 끝은 아니야. 오늘 한 번만 다시 시작해.",
      };
    case "realistic":
    default:
      return {
        headline: "실패해도, 다음 선택은 남아 있다.",
        opening: `오늘의 선택을 미룬 결과로, "${goal}"에서 멀어진 미래가 왔어.`,
        middle: `그래도 네가 남긴 이유 — "${reason}" — 때문에 아직 되돌릴 여지가 있어.`,
        close: "자책은 짧게. 다음 작은 행동이 새로운 분기점이 돼.",
      };
  }
}

function defaultAction(goal: string, missed: boolean): string {
  const g = goal.toLowerCase();
  if (g.includes("토익") || g.includes("영어") || g.includes("toeic")) {
    return missed
      ? "미룬 만큼, 지금 영단어 10개만이라도 표시해두기"
      : "영단어 20개를 소리 내어 읽고 표시해두기";
  }
  if (g.includes("운동") || g.includes("헬스") || g.includes("다이어트")) {
    return missed
      ? "운동복만 입고 집 앞에서 5분 걷기"
      : "운동복으로 갈아입고 10분만 걷기";
  }
  if (g.includes("자소서") || g.includes("취업") || g.includes("면접")) {
    return missed
      ? "닫아둔 자소서 파일을 열고 한 줄만 고치기"
      : "자기소개서 첫 문장 하나만 작성하기";
  }
  if (g.includes("공모전") || g.includes("해커톤") || g.includes("발표")) {
    return missed
      ? "발표 노트를 다시 열고 핵심 문장 1개만 고치기"
      : "발표에서 꼭 말할 핵심 문장 1개를 적어보기";
  }
  return missed
    ? "미룬 목표 관련 일을 오늘 10분만 다시 시작하기"
    : "목표와 관련된 일을 오늘 15분만 타이머 맞춰 진행하기";
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
  keptExtra: string,
): FutureMessage {
  return {
    headline: lines.headline,
    message: [
      lines.opening,
      "",
      lines.middle,
      "",
      lines.close,
      "",
      keptExtra,
    ].join("\n"),
    action,
    notificationMessage: truncatePush(notificationMessage),
  };
}

/** API 실패 시에도 발표/체험이 가능하도록 입력 기반 템플릿 생성 */
export function buildFallbackResult(input: CapsuleInput): CapsuleAIResult {
  const keptLines = toneKept(input.tone, input.reason, input.goal);
  const missedLines = toneMissed(input.tone, input.reason, input.goal);
  const keptAction = defaultAction(input.goal, false);
  const missedAction = defaultAction(input.goal, true);

  const kept = toMessage(
    keptLines,
    keptAction,
    `${shortGoal(input.goal)} — 오늘 한 걸음만.`,
    "미래의 나는 네가 오늘 시작해준 덕분에 여기까지 올 수 있었어.",
  );

  const missed = toMessage(
    missedLines,
    missedAction,
    `${shortGoal(input.goal)} — 놓쳐도, 기회는 남아 있어.`,
    "실패 버전의 나야. 그래도 지금 다시 선택하면, 이야기는 아직 바뀌어.",
  );

  return {
    ...kept,
    missed,
  };
}

/** 예전 저장본에 missed가 없을 때 보정 */
export function ensureDualResult(
  result: CapsuleAIResult | (FutureMessage & { missed?: FutureMessage }),
  input: CapsuleInput,
): CapsuleAIResult {
  if (result.missed?.headline && result.missed.message && result.missed.action) {
    return result as CapsuleAIResult;
  }
  const fallback = buildFallbackResult(input);
  return {
    headline: result.headline,
    message: result.message,
    action: result.action,
    notificationMessage: result.notificationMessage,
    missed: fallback.missed,
  };
}
