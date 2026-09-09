import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildFallbackResult } from "@/lib/fallback";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import { CapsuleAIResult, CapsuleInput, FutureMessage, Tone } from "@/lib/types";

export const runtime = "nodejs";

function isTone(v: unknown): v is Tone {
  return v === "gentle" || v === "realistic" || v === "spicy";
}

function validateInput(body: unknown): CapsuleInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.goal !== "string" || typeof b.reason !== "string") return null;
  if (typeof b.targetDate !== "string" || !isTone(b.tone)) return null;

  const goal = b.goal.trim();
  const reason = b.reason.trim();
  if (goal.length < 5 || goal.length > 80) return null;
  if (reason.length < 10 || reason.length > 200) return null;

  return {
    goal,
    reason,
    targetDate: b.targetDate,
    tone: b.tone,
    createdAt: typeof b.createdAt === "string" ? b.createdAt : new Date().toISOString(),
  };
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

function normalizeResult(raw: unknown, input: CapsuleInput): CapsuleAIResult {
  const fallback = buildFallbackResult(input);
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;

  const kept = readMessage(r, fallback);
  const missed = readMessage(r.missed, fallback.missed);

  return {
    ...kept,
    missed,
  };
}

export async function POST(req: Request) {
  let input: CapsuleInput | null = null;

  try {
    const body = await req.json();
    input = validateInput(body);
    if (!input) {
      return NextResponse.json({ error: "입력이 올바르지 않습니다." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        result: buildFallbackResult(input),
        fallback: true,
        reason: "missing_api_key",
      });
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(input) },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({
        result: buildFallbackResult(input),
        fallback: true,
        reason: "empty_response",
      });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({
        result: buildFallbackResult(input),
        fallback: true,
        reason: "invalid_json",
      });
    }

    return NextResponse.json({
      result: normalizeResult(parsed, input),
      fallback: false,
    });
  } catch (error) {
    console.error("[generate]", error);
    if (input) {
      return NextResponse.json({
        result: buildFallbackResult(input),
        fallback: true,
        reason: "exception",
      });
    }
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
