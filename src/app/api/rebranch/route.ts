import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ensureDualResult } from "@/lib/fallback";
import {
  buildRebranchFallback,
  buildRebranchSystemPrompt,
  buildRebranchUserPrompt,
} from "@/lib/rebranch";
import {
  ActionOutcome,
  CapsuleAIResult,
  CapsuleInput,
  FutureMessage,
  FutureReading,
  Tone,
} from "@/lib/types";

export const runtime = "nodejs";

function isTone(v: unknown): v is Tone {
  return v === "gentle" || v === "realistic" || v === "spicy";
}

function isOutcome(v: unknown): v is ActionOutcome {
  return v === "done" || v === "skipped";
}

function readMessage(raw: unknown, fallback: FutureMessage): FutureMessage {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  const headline = typeof r.headline === "string" ? r.headline.trim() : "";
  const message = typeof r.message === "string" ? r.message.trim() : "";
  const action = typeof r.action === "string" ? r.action.trim() : "";
  let notificationMessage =
    typeof r.notificationMessage === "string" ? r.notificationMessage.trim() : "";
  if (!headline || !message || !action) return fallback;
  if (!notificationMessage) notificationMessage = fallback.notificationMessage;
  if (notificationMessage.length > 40) {
    notificationMessage = `${notificationMessage.slice(0, 39)}…`;
  }
  return { headline, message, action, notificationMessage };
}

function readReading(raw: unknown, fallback: FutureReading): FutureReading {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  const coreDesire = typeof r.coreDesire === "string" ? r.coreDesire.trim() : "";
  const likelyFriction =
    typeof r.likelyFriction === "string" ? r.likelyFriction.trim() : "";
  const stakeIfSkipped =
    typeof r.stakeIfSkipped === "string" ? r.stakeIfSkipped.trim() : "";
  const personaLabel =
    typeof r.personaLabel === "string" ? r.personaLabel.trim() : "";
  if (!coreDesire || !likelyFriction || !stakeIfSkipped || !personaLabel) {
    return fallback;
  }
  return { coreDesire, likelyFriction, stakeIfSkipped, personaLabel };
}

function normalize(
  raw: unknown,
  input: CapsuleInput,
  previous: CapsuleAIResult,
  outcome: ActionOutcome,
): CapsuleAIResult {
  const fallback = buildRebranchFallback({ input, previous, outcome });
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  const kept = readMessage(r, fallback);
  const missed = readMessage(r.missed, fallback.missed);
  const reading = readReading(r.reading, fallback.reading);
  const branchShift =
    typeof r.branchShift === "string" && r.branchShift.trim()
      ? r.branchShift.trim()
      : fallback.branchShift;

  return {
    ...kept,
    reading,
    missed,
    branchShift,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      input?: CapsuleInput;
      previous?: CapsuleAIResult;
      outcome?: ActionOutcome;
    };

    if (!body.input || !body.previous || !isOutcome(body.outcome)) {
      return NextResponse.json({ error: "입력이 올바르지 않습니다." }, { status: 400 });
    }
    if (!isTone(body.input.tone)) {
      return NextResponse.json({ error: "말투가 올바르지 않습니다." }, { status: 400 });
    }

    const input = body.input;
    const previous = ensureDualResult(body.previous, input);
    const outcome = body.outcome;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        result: buildRebranchFallback({ input, previous, outcome }),
        fallback: true,
        reason: "missing_api_key",
      });
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildRebranchSystemPrompt() },
        {
          role: "user",
          content: buildRebranchUserPrompt({ input, previous, outcome }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({
        result: buildRebranchFallback({ input, previous, outcome }),
        fallback: true,
        reason: "empty_response",
      });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({
        result: buildRebranchFallback({ input, previous, outcome }),
        fallback: true,
        reason: "invalid_json",
      });
    }

    return NextResponse.json({
      result: normalize(parsed, input, previous, outcome),
      fallback: false,
    });
  } catch (error) {
    console.error("[rebranch]", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
