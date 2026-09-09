"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { PrimaryButton } from "@/components/Buttons";
import { GeneratingOverlay } from "@/components/GeneratingOverlay";
import { ReasonVoiceInput } from "@/components/ReasonVoiceInput";
import { VoiceMemoRecorder } from "@/components/VoiceMemoRecorder";
import { getDemoInput } from "@/lib/demo";
import { ensureDualResult } from "@/lib/fallback";
import { saveCapsule } from "@/lib/storage";
import { saveVoiceMemo } from "@/lib/voiceStore";
import { Capsule, CapsuleAIResult, CapsuleInput, TONE_OPTIONS, Tone } from "@/lib/types";

function localISODate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CreatePage() {
  const router = useRouter();
  const [minDate, setMinDate] = useState(() => localISODate());

  const [goal, setGoal] = useState("");
  const [reason, setReason] = useState("");
  const [letterToFuture, setLetterToFuture] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [tone, setTone] = useState<Tone>("realistic");
  const [reasonFromVoice, setReasonFromVoice] = useState(false);
  const [voiceMemo, setVoiceMemo] = useState<Blob | null>(null);
  const [recorderKey, setRecorderKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMinDate(localISODate());
  }, []);

  function fillDemo() {
    const demo = getDemoInput();
    setGoal(demo.goal);
    setReason(demo.reason);
    setLetterToFuture(demo.letterToFuture ?? "");
    setTargetDate(demo.targetDate);
    setTone(demo.tone);
    setReasonFromVoice(false);
    setVoiceMemo(null);
    setRecorderKey((k) => k + 1);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedGoal = goal.trim();
    const trimmedReason = reason.trim();
    const trimmedLetter = letterToFuture.trim();
    const today = localISODate();

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
    if (!targetDate || targetDate < today) {
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

      const capsuleId = crypto.randomUUID();
      let hasVoiceMemo = false;
      if (voiceMemo && voiceMemo.size > 0) {
        try {
          await saveVoiceMemo(capsuleId, voiceMemo);
          hasVoiceMemo = true;
        } catch {
          // 편지는 저장하고, 음성만 실패했을 때 계속 진행
        }
      }

      const capsule: Capsule = {
        id: capsuleId,
        input,
        result: ensureDualResult(data.result, input),
        promiseAccepted: false,
        hasVoiceMemo,
        updatedAt: new Date().toISOString(),
      };
      if (!saveCapsule(capsule)) {
        throw new Error("이 브라우저에 저장할 수 없어요. 시크릿 모드를 끄고 다시 시도해주세요.");
      }
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

      <main className="page-shell flex-1 pb-20 pt-2">
        <p className="section-label animate-fade-up">Write</p>
        <h1 className="animate-fade-up delay-1 font-display mt-3 text-[2.55rem] leading-[1.08] text-ink">
          목표와 이유를
          <br />
          남겨주세요
        </h1>
        <p className="animate-fade-up delay-2 mt-4 max-w-md text-[15px] leading-relaxed text-mute">
          글과 목소리로, 지금의 나를 미래의 나에게 보냅니다.
        </p>

        <button
          type="button"
          onClick={fillDemo}
          className="animate-fade-up delay-3 mt-6 text-left text-sm text-accent underline underline-offset-[5px] transition hover:text-ink"
        >
          발표용 예시 채우기
        </button>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          심사/발표에서 바로 보여줄 목표·이유 프리셋입니다.
        </p>

        <form onSubmit={onSubmit} className="animate-soft-in write-surface mt-8">
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

          <Field
            label="음성 메모 (선택)"
            hint="지금 녹음한 목소리를 나중에 타임캡슐에서 재생합니다"
          >
            <VoiceMemoRecorder
              key={recorderKey}
              value={voiceMemo}
              onChange={setVoiceMemo}
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
                    className="tone-option"
                    data-active={selected}
                  >
                    <input
                      type="radio"
                      name="tone"
                      value={opt.value}
                      checked={selected}
                      onChange={() => setTone(opt.value)}
                      className="mt-1 accent-[var(--accent)]"
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
    <div className="write-field">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-ink">{label}</p>
        {counter ? <p className="text-xs text-mute">{counter}</p> : null}
      </div>
      {hint ? <p className="mt-1 text-sm text-mute">{hint}</p> : null}
      {children}
    </div>
  );
}
