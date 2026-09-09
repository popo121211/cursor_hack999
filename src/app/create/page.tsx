"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { PrimaryButton } from "@/components/Buttons";
import { GeneratingOverlay } from "@/components/GeneratingOverlay";
import { ReasonVoiceInput } from "@/components/ReasonVoiceInput";
import { getDemoInput } from "@/lib/demo";
import { ensureDualResult } from "@/lib/fallback";
import { saveCapsule } from "@/lib/storage";
import { Capsule, CapsuleAIResult, CapsuleInput, TONE_OPTIONS, Tone } from "@/lib/types";

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export default function CreatePage() {
  const router = useRouter();
  const minDate = useMemo(() => todayISODate(), []);

  const [goal, setGoal] = useState("");
  const [reason, setReason] = useState("");
  const [letterToFuture, setLetterToFuture] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [tone, setTone] = useState<Tone>("realistic");
  const [reasonFromVoice, setReasonFromVoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function fillDemo() {
    const demo = getDemoInput();
    setGoal(demo.goal);
    setReason(demo.reason);
    setLetterToFuture(demo.letterToFuture ?? "");
    setTargetDate(demo.targetDate);
    setTone(demo.tone);
    setReasonFromVoice(false);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedGoal = goal.trim();
    const trimmedReason = reason.trim();
    const trimmedLetter = letterToFuture.trim();

    if (trimmedGoal.length < 5 || trimmedGoal.length > 80) {
      setError("목표는 5~80자로 적어주세요.");
      return;
    }
    if (trimmedReason.length < 10 || trimmedReason.length > 200) {
      setError("이유는 10~200자로 적어주세요.");
      return;
    }
    if (trimmedLetter.length < 10 || trimmedLetter.length > 300) {
      setError("미래의 나에게 남길 메시지는 10~300자로 적어주세요.");
      return;
    }
    if (!targetDate || targetDate < minDate) {
      setError("목표 날짜는 오늘 포함 이후로 선택해주세요.");
      return;
    }

    const input: CapsuleInput = {
      goal: trimmedGoal,
      reason: trimmedReason,
      letterToFuture: trimmedLetter,
      targetDate,
      tone,
      reasonFromVoice,
      createdAt: new Date().toISOString(),
    };

    setLoading(true);
    const started = Date.now();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = (await res.json()) as {
        result?: CapsuleAIResult;
        error?: string;
        fallback?: boolean;
      };

      if (!res.ok || !data.result) {
        throw new Error(data.error || "생성에 실패했습니다.");
      }

      const elapsed = Date.now() - started;
      if (elapsed < 2800) {
        await new Promise((r) => setTimeout(r, 2800 - elapsed));
      }

      const capsule: Capsule = {
        id: crypto.randomUUID(),
        input,
        result: ensureDualResult(data.result, input),
        promiseAccepted: false,
        updatedAt: new Date().toISOString(),
      };
      saveCapsule(capsule);
      setLoading(false);
      router.push(`/result/${capsule.id}`);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "잠시 후 다시 시도해주세요.");
    }
  }

  const goalLen = goal.trim().length;
  const reasonLen = reason.trim().length;
  const letterLen = letterToFuture.trim().length;

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      {loading ? <GeneratingOverlay key="generating" active /> : null}

      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-16 pt-2">
        <p className="text-sm text-mute">작성</p>
        <h1 className="font-display mt-3 text-3xl leading-tight text-ink">
          목표와 이유를
          <br />
          남겨주세요
        </h1>
        <p className="mt-3 text-[15px] text-mute">
          미래의 나에게 직접 전할 말도 함께 남기세요. 그다음 AI가 지킨 나 / 미룬 나
          편지를 만듭니다.
        </p>

        <button
          type="button"
          onClick={fillDemo}
          className="mt-5 text-left text-sm text-ink underline underline-offset-4 opacity-70 transition hover:opacity-100"
        >
          발표용 예시 채우기
        </button>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          심사/발표에서 바로 보여줄 목표·이유 프리셋입니다.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-8">
          <Field
            label="이루고 싶은 목표"
            hint="예: 내 이름으로 만든 첫 서비스를 끝까지 세상에 내놓기"
            counter={`${goalLen}/80 · 최소 5자`}
          >
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="field-input"
              placeholder="무엇을 이루고 싶나요?"
              maxLength={80}
              required
            />
          </Field>

          <Field
            label="왜 이루고 싶은가요?"
            hint="초심이 되는 이유를 구체적으로"
            counter={`${reasonLen}/200 · 최소 10자`}
          >
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonFromVoice(false);
              }}
              className="field-input min-h-[120px] resize-none"
              placeholder="이 목표가 중요한 이유를 적어주세요"
              maxLength={200}
              required
            />
            <ReasonVoiceInput
              value={reason}
              onChange={(next, meta) => {
                setReason(next);
                if (meta?.fromVoice) setReasonFromVoice(true);
              }}
            />
            {reasonFromVoice ? (
              <p className="mt-1 text-xs text-mute">음성으로 남긴 이유입니다.</p>
            ) : null}
          </Field>

          <Field
            label="미래의 나에게 직접 전할 말"
            hint="AI가 대신 쓰지 않는, 지금의 내 문장"
            counter={`${letterLen}/300 · 최소 10자`}
          >
            <textarea
              value={letterToFuture}
              onChange={(e) => setLetterToFuture(e.target.value)}
              className="field-input min-h-[140px] resize-none"
              placeholder="나중에 읽는 나에게. 오늘은…"
              maxLength={300}
              required
            />
          </Field>

          <Field label="목표 날짜" hint="오늘 포함, 이후 날짜">
            <input
              type="date"
              value={targetDate}
              min={minDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="field-input"
              required
            />
          </Field>

          <fieldset>
            <legend className="text-sm font-medium text-ink">듣고 싶은 말투</legend>
            <div className="mt-3 space-y-2">
              {TONE_OPTIONS.map((opt) => {
                const selected = tone === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start gap-3 border px-4 py-3 transition ${
                      selected ? "border-ink bg-paper" : "border-line bg-transparent hover:bg-paper/70"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tone"
                      value={opt.value}
                      checked={selected}
                      onChange={() => setTone(opt.value)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-[15px] font-medium text-ink">{opt.label}</span>
                      <span className="mt-0.5 block text-sm text-mute">{opt.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "해석 중…" : "편지 받기"}
          </PrimaryButton>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  hint,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{label}</span>
        {counter ? <span className="text-xs text-mute">{counter}</span> : null}
      </span>
      {hint ? <span className="mt-1 block text-sm text-mute">{hint}</span> : null}
      {children}
    </label>
  );
}
