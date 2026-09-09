import { CapsuleAIResult, CapsuleInput, Tone } from "./types";

function toneLines(tone: Tone, reason: string, goal: string) {
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

function defaultAction(goal: string): string {
  const g = goal.toLowerCase();
  if (g.includes("토익") || g.includes("영어") || g.includes("toeic")) {
    return "영단어 20개를 소리 내어 읽고 표시해두기";
  }
  if (g.includes("운동") || g.includes("헬스") || g.includes("다이어트")) {
    return "운동복으로 갈아입고 10분만 걷기";
  }
  if (g.includes("자소서") || g.includes("취업") || g.includes("면접")) {
    return "자기소개서 첫 문장 하나만 작성하기";
  }
  if (g.includes("공모전") || g.includes("해커톤") || g.includes("발표")) {
    return "발표에서 꼭 말할 핵심 문장 1개를 적어보기";
  }
  return "목표와 관련된 일을 오늘 15분만 타이머 맞춰 진행하기";
}

/** API 실패 시에도 발표/체험이 가능하도록 입력 기반 템플릿 생성 */
export function buildFallbackResult(input: CapsuleInput): CapsuleAIResult {
  const lines = toneLines(input.tone, input.reason, input.goal);
  const action = defaultAction(input.goal);

  return {
    headline: lines.headline,
    message: [
      lines.opening,
      "",
      lines.middle,
      "",
      "오늘 하기 싫은 마음도 이해해.",
      lines.close,
      "",
      "미래의 나는 네가 오늘 시작해준 덕분에 여기까지 올 수 있었어.",
    ].join("\n"),
    action,
    notificationMessage: truncatePush(`${shortGoal(input.goal)} — 오늘 한 걸음만.`),
  };
}

function shortGoal(goal: string) {
  return goal.length > 18 ? `${goal.slice(0, 18)}…` : goal;
}

function truncatePush(text: string) {
  return text.length > 40 ? `${text.slice(0, 39)}…` : text;
}
