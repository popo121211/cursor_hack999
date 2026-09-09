"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { PushToast } from "@/components/PushToast";
import { VoicePlayer } from "@/components/VoicePlayer";
import { ensureDualResult } from "@/lib/fallback";
import { useCapsule } from "@/lib/hooks";
import { updateCapsule } from "@/lib/storage";
import { FuturePath, pickFutureMessage } from "@/lib/types";

export default function ResultPage() {
  const params = useParams<{ id: string }>();
  const capsule = useCapsule(params.id);
  const [path, setPath] = useState<FuturePath>("kept");
  const [toastVisible, setToastVisible] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const letterRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const dual = useMemo(() => {
    if (!capsule) return null;
    return ensureDualResult(capsule.result, capsule.input);
  }, [capsule]);

  const active = dual ? pickFutureMessage(dual, path) : null;

  function acceptPromise() {
    if (!capsule || capsule.promiseAccepted) return;
    updateCapsule(capsule.id, { promiseAccepted: true });
  }

  function startNotificationDemo() {
    if (scheduling || !active) return;
    setScheduling(true);
    setToastVisible(false);
    timerRef.current = window.setTimeout(() => {
      setToastVisible(true);
      setScheduling(false);
    }, 5000);
  }

  function openFromToast() {
    setToastVisible(false);
    letterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function switchPath(next: FuturePath) {
    setPath(next);
    setToastVisible(false);
  }

  if (!capsule || !dual || !active) {
    return (
      <div className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-5 py-16 text-center">
          <h1 className="font-display text-3xl">타임캡슐을 찾을 수 없어요</h1>
          <p className="mt-3 text-mute">이 기기에서 만든 메시지만 다시 볼 수 있어요.</p>
          <Link
            href="/create"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-white"
          >
            새로 만들기
          </Link>
        </main>
      </div>
    );
  }

  const { input } = capsule;
  const isMissed = path === "missed";

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <PushToast
        visible={toastVisible}
        body={active.notificationMessage}
        onOpen={openFromToast}
        onDismiss={() => setToastVisible(false)}
      />

      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-20 pt-2">
        <p className="animate-fade-up text-[13px] tracking-[0.18em] text-mute">ARRIVED</p>
        <h1 className="animate-fade-up font-display mt-3 text-3xl leading-tight">
          미래의 나에게서
          <br />
          메시지가 도착했습니다.
        </h1>
        <p className="animate-fade-up mt-3 text-[15px] leading-relaxed text-mute">
          오늘의 네가 없으면, 그 미래도 없습니다.
        </p>

        <div className="animate-fade-up mt-8 grid grid-cols-2 gap-2 rounded-full border border-line bg-white p-1">
          <button
            type="button"
            onClick={() => switchPath("kept")}
            className={`h-10 rounded-full text-sm font-medium transition ${
              !isMissed ? "bg-ink text-white" : "text-mute hover:text-ink"
            }`}
          >
            오늘을 지킨 나
          </button>
          <button
            type="button"
            onClick={() => switchPath("missed")}
            className={`h-10 rounded-full text-sm font-medium transition ${
              isMissed ? "bg-ink text-white" : "text-mute hover:text-ink"
            }`}
          >
            오늘을 미룬 나
          </button>
        </div>

        <article
          ref={letterRef}
          key={path}
          className="animate-fade-up mt-10 border-t border-line pt-8"
        >
          <p className="text-[13px] tracking-[0.16em] text-mute">
            {isMissed ? "FROM. 놓친 미래의 나" : "FROM. 지킨 미래의 나"}
          </p>
          {isMissed ? (
            <p className="mt-3 text-sm leading-relaxed text-mute">
              실패 버전이지만, 끝은 아닙니다. 다시 기회가 남아 있습니다.
            </p>
          ) : null}
          <h2 className="font-display mt-4 text-[1.75rem] leading-snug text-ink">
            {active.headline}
          </h2>
          <p className="letter-body mt-6 text-[16px] leading-[1.85] text-ink/90">
            {active.message}
          </p>
          <VoicePlayer
            key={`voice-${path}`}
            headline={active.headline}
            message={active.message}
            action={active.action}
            tone={input.tone}
            listenLabel={
              isMissed ? "놓친 미래의 나 목소리로 듣기" : "지킨 미래의 나 목소리로 듣기"
            }
          />
        </article>

        <section className="mt-10 border-t border-line pt-6">
          <p className="text-sm text-mute">이 메시지가 기억하는 너의 이유</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">“{input.reason}”</p>
        </section>

        <section className="mt-10 border-t border-line pt-6">
          <p className="text-[13px] tracking-[0.14em] text-mute">
            {isMissed ? "SECOND CHANCE" : "TODAY"}
          </p>
          <h3 className="mt-2 text-lg font-medium">
            {isMissed
              ? "놓친 미래의 나가 다시 주는 기회"
              : "미래의 내가 부탁한 오늘의 행동"}
          </h3>
          <p className="mt-3 text-[16px] leading-relaxed text-ink">{active.action}</p>

          <div className="mt-5">
            <PrimaryButton onClick={acceptPromise} disabled={capsule.promiseAccepted}>
              {capsule.promiseAccepted
                ? "약속했어요 ✓"
                : isMissed
                  ? "다시 기회 잡을게"
                  : "오늘 할게"}
            </PrimaryButton>
            {capsule.promiseAccepted ? (
              <p className="mt-3 text-center text-sm text-mute">미래의 내가 기억할게요.</p>
            ) : null}
          </div>
        </section>

        <section className="mt-10 border-t border-line pt-6">
          <h3 className="text-lg font-medium">미래 메시지 도착 체험하기</h3>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            약 5초 뒤, 지금 보고 있는 {isMissed ? "놓친" : "지킨"} 미래의 나 알림이 도착합니다.
          </p>
          <div className="mt-5">
            <SecondaryButton onClick={startNotificationDemo} disabled={scheduling}>
              {scheduling ? "도착 대기 중…" : "미래 메시지 도착 체험하기"}
            </SecondaryButton>
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/create"
            className="inline-flex h-12 items-center justify-center rounded-full border border-line text-[15px] transition hover:bg-black/[0.03]"
          >
            다시 만들기
          </Link>
          <Link
            href="/capsule"
            className="text-center text-sm text-mute underline-offset-4 hover:underline"
          >
            저장된 타임캡슐 보기
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-mute">
          {input.goal} · {input.targetDate} · {input.tone}
        </p>
      </main>
    </div>
  );
}
