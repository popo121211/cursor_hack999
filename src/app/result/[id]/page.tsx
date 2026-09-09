"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { PushToast } from "@/components/PushToast";
import { VoicePlayer } from "@/components/VoicePlayer";
import { VoiceMemoPlayer } from "@/components/VoiceMemoPlayer";
import { ensureDualResult } from "@/lib/fallback";
import { useCapsule, useHasMounted } from "@/lib/hooks";
import { updateCapsule } from "@/lib/storage";
import {
  ActionOutcome,
  CapsuleAIResult,
  FuturePath,
  TONE_OPTIONS,
  pickFutureMessage,
} from "@/lib/types";

export default function ResultPage() {
  const params = useParams<{ id: string }>();
  const mounted = useHasMounted();
  const capsule = useCapsule(params.id);
  const [path, setPath] = useState<FuturePath>("kept");
  const [toastVisible, setToastVisible] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [promiseFlash, setPromiseFlash] = useState(false);
  const [rebranching, setRebranching] = useState(false);
  const [rebranchError, setRebranchError] = useState<string | null>(null);
  const [voicePlayToken, setVoicePlayToken] = useState(0);
  const letterRef = useRef<HTMLElement>(null);
  const notifyRef = useRef<HTMLElement>(null);
  const branchRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const dual = useMemo(() => {
    if (!capsule) return null;
    return ensureDualResult(capsule.result, capsule.input);
  }, [capsule]);

  const active = dual ? pickFutureMessage(dual, path) : null;
  const toneLabel =
    TONE_OPTIONS.find((t) => t.value === capsule?.input.tone)?.label ??
    capsule?.input.tone;

  function clearNotifyTimers() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (tickRef.current) window.clearInterval(tickRef.current);
    timerRef.current = null;
    tickRef.current = null;
  }

  function acceptPromise() {
    if (!capsule || capsule.promiseAccepted) return;
    updateCapsule(capsule.id, { promiseAccepted: true });
    setPromiseFlash(true);
    window.setTimeout(() => {
      branchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
  }

  async function reportOutcome(outcome: ActionOutcome) {
    if (!capsule || !dual || rebranching) return;
    setRebranchError(null);
    setRebranching(true);

    try {
      const res = await fetch("/api/rebranch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: capsule.input,
          previous: dual,
          outcome,
        }),
      });
      const data = (await res.json()) as {
        result?: CapsuleAIResult;
        error?: string;
      };
      if (!res.ok || !data.result) {
        throw new Error(data.error || "재분기에 실패했습니다.");
      }

      const next = ensureDualResult(data.result, capsule.input);
      updateCapsule(capsule.id, {
        result: next,
        actionOutcome: outcome,
        promiseCompleted: outcome === "done",
      });
      setPath(outcome === "done" ? "kept" : "missed");
      window.setTimeout(() => {
        letterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err) {
      setRebranchError(err instanceof Error ? err.message : "다시 시도해주세요.");
    } finally {
      setRebranching(false);
    }
  }

  function startNotificationDemo() {
    if (countdown !== null || !active) return;
    setToastVisible(false);
    clearNotifyTimers();
    setCountdown(5);

    let left = 5;
    tickRef.current = window.setInterval(() => {
      left -= 1;
      if (left <= 0) {
        if (tickRef.current) window.clearInterval(tickRef.current);
        tickRef.current = null;
        return;
      }
      setCountdown(left);
    }, 1000);

    timerRef.current = window.setTimeout(() => {
      setCountdown(null);
      setToastVisible(true);
      clearNotifyTimers();
    }, 5000);
  }

  function openFromToast() {
    setToastVisible(false);
    letterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (capsule?.hasVoiceMemo) {
      setVoicePlayToken((n) => n + 1);
    }
  }

  function switchPath(next: FuturePath) {
    setPath(next);
    setToastVisible(false);
    setCountdown(null);
    clearNotifyTimers();
  }

  if (!mounted) {
    return (
      <div className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="page-shell flex-1 py-16">
          <p className="text-sm text-mute">불러오는 중…</p>
        </main>
      </div>
    );
  }

  if (!capsule || !dual || !active) {
    return (
      <div className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="page-shell flex-1 py-16 text-center">
          <h1 className="font-display text-3xl">타임캡슐을 찾을 수 없어요</h1>
          <p className="mt-3 text-mute">이 기기에서 만든 메시지만 다시 볼 수 있어요.</p>
          <Link
            href="/create"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-ink px-6 text-white"
          >
            새로 만들기
          </Link>
        </main>
      </div>
    );
  }

  const { input } = capsule;
  const { reading } = dual;
  const isMissed = path === "missed";
  const scheduling = countdown !== null;
  const alreadyBranched = !!capsule.actionOutcome;

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <PushToast
        visible={toastVisible}
        body={active.notificationMessage}
        onOpen={openFromToast}
        onDismiss={() => setToastVisible(false)}
      />

      <main className="page-shell flex-1 pb-24 pt-2">
        <p className="animate-fade-up section-label">{reading.personaLabel}</p>
        <h1 className="animate-fade-up font-display mt-3 text-[2.35rem] leading-tight">
          편지가 도착했습니다
        </h1>
        <p className="animate-fade-up mt-3 text-[15px] leading-relaxed text-mute">
          오늘의 네가 없으면, 그 미래도 없습니다.
        </p>
        {input.reasonFromVoice ? (
          <p className="animate-fade-up mt-2 text-xs text-mute">이 이유는 음성으로 남겼습니다.</p>
        ) : null}

        {dual.branchShift ? (
          <p className="animate-fade-up mt-5 letter-sheet py-4 text-[15px] leading-relaxed text-ink">
            {dual.branchShift}
          </p>
        ) : null}

        <section className="animate-soft-in mt-7 letter-sheet">
          <p className="text-sm font-medium text-ink">먼저 읽힌 것</p>
          <dl className="mt-4 space-y-4 text-[14px] leading-relaxed">
            <div>
              <dt className="text-mute">진짜 바람</dt>
              <dd className="mt-1 text-ink">{reading.coreDesire}</dd>
            </div>
            <div>
              <dt className="text-mute">흔들리기 쉬운 지점</dt>
              <dd className="mt-1 text-ink">{reading.likelyFriction}</dd>
            </div>
            <div>
              <dt className="text-mute">오늘을 비우면</dt>
              <dd className="mt-1 text-ink">{reading.stakeIfSkipped}</dd>
            </div>
          </dl>
        </section>

        <div className="animate-fade-up mt-8 path-tabs">
          <button
            type="button"
            className="path-tab"
            data-active={!isMissed}
            onClick={() => switchPath("kept")}
          >
            지킨 나
          </button>
          <button
            type="button"
            className="path-tab"
            data-active={isMissed}
            onClick={() => switchPath("missed")}
          >
            미룬 나
          </button>
        </div>

        <article
          ref={letterRef}
          key={`${path}-${capsule.updatedAt}`}
          className="animate-soft-in mt-5 letter-sheet letter-sheet-lg"
        >
          <p className="text-sm text-mute">{isMissed ? "미룬 쪽의 나" : "이은 쪽의 나"}</p>
          {isMissed ? (
            <p className="mt-2 text-sm leading-relaxed text-mute">
              실패로 끝난 버전이 아닙니다. 다시 이을 여지는 남아 있습니다.
            </p>
          ) : null}
          <h2 className="font-display mt-4 text-[1.85rem] leading-snug text-ink">
            {active.headline}
          </h2>
          <p className="letter-body mt-5 text-[16px] leading-[1.9] text-ink/90">
            {active.message}
          </p>
          <div className="mt-4">
            <VoicePlayer
              key={`voice-${path}-${capsule.updatedAt}`}
              headline={active.headline}
              message={active.message}
              action={active.action}
              tone={input.tone}
              listenLabel="기계 음성으로 듣기"
            />
          </div>
        </article>

        <section className="mt-6 letter-sheet">
          <p className="text-sm text-mute">FROM. 지금의 나</p>
          <h3 className="mt-2 font-display text-[1.35rem]">미래에 직접 남긴 말</h3>
          {input.letterToFuture?.trim() ? (
            <p className="letter-body mt-3 text-[16px] leading-[1.9] text-ink">
              {input.letterToFuture}
            </p>
          ) : (
            <p className="mt-3 text-sm text-mute">직접 남긴 메시지가 없습니다.</p>
          )}
          {capsule.hasVoiceMemo ? (
            <div className="mt-5 border-t border-line/70 pt-4">
              <VoiceMemoPlayer
                memoId={capsule.id}
                label="예전에 녹음해 둔 내 목소리"
                autoPlayToken={voicePlayToken}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-mute">
              음성 메모가 없습니다. 만들 때 녹음하면 여기서 다시 들을 수 있어요.
            </p>
          )}
        </section>

        <section className="mt-6 letter-sheet">
          <p className="text-sm text-mute">처음에 적어둔 이유</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">“{input.reason}”</p>
        </section>

        <section className="mt-6 letter-sheet">
          <h3 className="font-display text-[1.35rem]">
            {isMissed ? "다시 이을 행동" : "오늘의 행동"}
          </h3>
          <p className="mt-3 text-[16px] leading-relaxed text-ink">{active.action}</p>

          <div className="mt-5">
            <PrimaryButton onClick={acceptPromise} disabled={capsule.promiseAccepted}>
              {capsule.promiseAccepted
                ? "약속함"
                : isMissed
                  ? "다시 이을게"
                  : "오늘 할게"}
            </PrimaryButton>
            {capsule.promiseAccepted ? (
              <p className="mt-3 text-center text-sm text-mute">
                약속이 남았습니다. 아래에서 실제 결과로 미래를 다시 갈라보세요.
                {promiseFlash ? "" : ""}
              </p>
            ) : null}
          </div>
        </section>

        <section ref={branchRef} className="mt-6 letter-sheet">
          <h3 className="font-display text-[1.35rem]">행동 결과로 미래 다시 가르기</h3>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            오늘 행동을 했는지에 따라 AI가 메시지·행동 난이도·기울기를 다시 계산합니다.
          </p>

          {alreadyBranched ? (
            <p className="mt-4 text-[15px] text-ink">
              반영됨: {capsule.actionOutcome === "done" ? "해낸 쪽" : "미룬 쪽"}
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <PrimaryButton
                onClick={() => reportOutcome("done")}
                disabled={!capsule.promiseAccepted || rebranching}
              >
                {rebranching ? "계산 중…" : "오늘 했다"}
              </PrimaryButton>
              <SecondaryButton
                onClick={() => reportOutcome("skipped")}
                disabled={!capsule.promiseAccepted || rebranching}
              >
                {rebranching ? "계산 중…" : "못 했다"}
              </SecondaryButton>
            </div>
          )}
          {!capsule.promiseAccepted ? (
            <p className="mt-3 text-xs text-mute">먼저 약속을 남긴 뒤 결과를 선택하세요.</p>
          ) : null}
          {rebranchError ? <p className="mt-3 text-sm text-red-600">{rebranchError}</p> : null}
        </section>

        <section
          ref={notifyRef}
          className={`mt-6 letter-sheet transition ${promiseFlash ? "ring-1 ring-ink/10" : ""}`}
        >
          <h3 className="font-display text-[1.35rem]">알림 도착 체험</h3>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            5초 뒤 알림이 도착합니다. 알림을 열면
            {capsule.hasVoiceMemo ? " 남긴 음성도 함께 재생됩니다." : " 편지로 이동합니다."}
          </p>
          {scheduling ? (
            <p className="mt-4 text-center font-display text-5xl text-ink">{countdown}</p>
          ) : null}
          <div className="mt-5">
            <SecondaryButton onClick={startNotificationDemo} disabled={scheduling}>
              {scheduling ? "도착 대기 중…" : "알림 체험하기"}
            </SecondaryButton>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/create"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-line bg-white/50 text-[15px] transition hover:bg-white"
          >
            다시 만들기
          </Link>
          <Link
            href="/capsule"
            className="text-center text-sm text-mute underline-offset-4 hover:underline"
          >
            저장된 타임캡슐
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-mute">
          {input.goal} · {input.targetDate} · {toneLabel}
        </p>
      </main>
    </div>
  );
}
