import { CapsuleAIResult, CapsuleInput, FutureMessage, Tone } from "./types";

function toneKept(tone: Tone, reason: string, goal: string) {
  switch (tone) {
    case "gentle":
      return {
        headline: "네가 이어준 오늘이, 이 아침을 만들었어.",
        opening: `창가에 앉아 "${goal}"을(를) 향해 하루를 이어가는 나를 상상해봐. 손을 멈출 때마다, 처음부터 적었던 이유가 다시 올라와.`,
        middle: `"${reason}" — 그 문장 덕분에 나는 여기까지 왔어.`,
        close: "오늘의 네가 없었으면, 지금의 이 미래도 없어. 아주 작은 한 걸음이면 충분해.",
      };
    case "spicy":
      return {
        headline: "오늘의 너가 내 미래를 열었어.",
        opening: `"${goal}" 쪽으로 걸어온 날들의 끝에 서 있는 나야. 거창한 말은 필요 없고, 그냥 네가 오늘 안 도망친 덕분이야.`,
        middle: `네가 남긴 이유 기억해. "${reason}" — 이거, 꽤 절실했잖아.`,
        close: "오늘의 네가 빠지면 이 장면도 통째로 사라진다. 변명은 나중에 하고, 오늘 할 수 있는 것만 해.",
      };
    case "realistic":
    default:
      return {
        headline: "이 장면의 원인은, 오늘의 너야.",
        opening: `"${goal}"을(를) 향해 조용히 쌓아온 하루들. 그 결과가 지금의 나에게 남아 있어.`,
        middle: `중심엔 네가 적은 이유가 있어. "${reason}"`,
        close: "오늘의 네가 없었으면 이 미래도 없다. 감정은 흔들려도, 오늘의 작은 행동은 선택할 수 있어.",
      };
  }
}

function toneMissed(tone: Tone, reason: string, goal: string) {
  switch (tone) {
    case "gentle":
      return {
        headline: "놓친 미래야. 그래도 문은 다시 열려.",
        opening: `"${goal}"에서 한 발 멀어진 방, 켜지지 않은 화면, 미뤄둔 메모만 남아 있어.`,
        middle: `그래도 "${reason}" — 그 이유는 아직 지워지지 않았어. 오늘의 너를 다시 불러오면, 다른 미래가 다시 시작돼.`,
        close: "실패 버전이라고 끝은 아니야. 지금 다시 선택하면 돼.",
      };
    case "spicy":
      return {
        headline: "미룬 나야. 근데 스토리는 안 끝났어.",
        opening: `"${goal}" 적어놓고 오늘을 비운 결과, 여기까지 왔어. 멋지지 않은 미래지.`,
        middle: `그래도 네가 남긴 "${reason}"는 아직 살아 있어. 오늘의 너를 되살리면, 미래도 다시 갈라져.`,
        close: "자책만 하지 마. 지금 한 번만 다시 열어.",
      };
    case "realistic":
    default:
      return {
        headline: "멀어진 장면이지만, 다음 선택은 남아 있다.",
        opening: `오늘의 선택을 미룬 결과로, "${goal}"에서 멀어진 하루가 쌓인 미래야.`,
        middle: `그래도 네가 남긴 이유 — "${reason}" — 때문에 아직 되돌릴 여지가 있어. 오늘의 나를 다시 시작하면, 다른 미래가 열린다.`,
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
  if (
    g.includes("공모전") ||
    g.includes("해커톤") ||
    g.includes("발표") ||
    g.includes("서비스") ||
    g.includes("세상에")
  ) {
    return missed
      ? "닫아둔 작업 문서를 다시 열고 핵심 문장 1개만 고치기"
      : "지금 당장, 서비스에서 꼭 보여줄 핵심 문장 1개를 적어보기";
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
): FutureMessage {
  return {
    headline: lines.headline,
    message: [lines.opening, "", lines.middle, "", lines.close].join("\n"),
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
    `${shortGoal(input.goal)} — 오늘의 네가 이 미래야.`,
  );

  const missed = toMessage(
    missedLines,
    missedAction,
    `${shortGoal(input.goal)} — 놓쳐도, 기회는 남아 있어.`,
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
