"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { stopSpeaking } from "@/lib/speech";
import { isSttSupported, startKoreanDictation } from "@/lib/stt";

function normalizeForMatch(text: string) {
  return text
    .toLowerCase()
    .replace(/["""''`´]/g, "")
    .replace(/[.,!?;:~…—\-_/\\()[\]{}]/g, "")
    .replace(/\s+/g, "");
}

/** 원문에서 지금까지 읽은 글자 수(정규화 기준)를 추정 */
function estimateReadChars(script: string, spoken: string) {
  const s = normalizeForMatch(script);
  const t = normalizeForMatch(spoken);
  if (!s || !t) return 0;

  let best = 0;
  const max = Math.min(s.length, t.length);
  for (let len = max; len >= Math.min(4, max); len -= 1) {
    if (s.startsWith(t.slice(0, len)) || t.includes(s.slice(0, len))) {
      best = len;
      break;
    }
  }
  // map normalized length back roughly onto original script index
  if (best <= 0) return 0;
  let counted = 0;
  for (let i = 0; i < script.length; i += 1) {
    const ch = script[i];
    if (normalizeForMatch(ch)) counted += 1;
    if (counted >= best) return i + 1;
  }
  return script.length;
}

interface SelfReadAloudProps {
  title?: string;
  script: string;
  savedTranscript?: string | null;
  onSave?: (transcript: string) => void;
}

export function SelfReadAloud({
  title = "내가 직접 읽어보기",
  script,
  savedTranscript,
  onSave,
}: SelfReadAloudProps) {
  const [supported] = useState(() => isSttSupported());
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState(savedTranscript ?? "");
  const [interim, setInterim] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const finalRef = useRef(savedTranscript ?? "");

  useEffect(() => {
    return () => stopRef.current?.();
  }, []);

  const spoken = `${finalText}${interim ? ` ${interim}` : ""}`.trim();
  const readUntil = useMemo(
    () => estimateReadChars(script, spoken),
    [script, spoken],
  );
  const progress = script.length
    ? Math.min(100, Math.round((readUntil / script.length) * 100))
    : 0;

  function stop() {
    stopRef.current?.();
    stopRef.current = null;
    setListening(false);
    setInterim("");
  }

  function start() {
    if (!supported) {
      setHint("Chrome에서 마이크를 사용할 수 있어요.");
      return;
    }
    stopSpeaking();
    setHint("편지를 소리 내어 읽어주세요. 읽은 내용이 아래에 나타납니다.");
    setListening(true);
    stopRef.current = startKoreanDictation({
      onInterim: (text) => setInterim(text),
      onFinal: (text) => {
        const next = `${finalRef.current} ${text}`.replace(/\s+/g, " ").trim();
        finalRef.current = next;
        setFinalText(next);
        setInterim("");
      },
      onError: (message) => {
        setHint(message);
        setListening(false);
      },
      onEnd: () => {
        setListening(false);
        setInterim("");
      },
    });
  }

  function toggle() {
    if (listening) stop();
    else start();
  }

  function reset() {
    stop();
    finalRef.current = "";
    setFinalText("");
    setInterim("");
    setHint(null);
  }

  function save() {
    const text = finalRef.current.trim();
    if (!text) {
      setHint("아직 읽은 내용이 없어요.");
      return;
    }
    onSave?.(text);
    setHint("읽은 내용을 타임캡슐에 저장했어요.");
    stop();
  }

  if (!supported) {
    return (
      <div className="mt-6 border-t border-line/70 pt-5">
        <p className="text-sm text-mute">
          이 환경에서는 직접 읽기(음성 인식)를 쓸 수 없어요.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-line/70 pt-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="mt-1 text-xs text-mute">
            AI 음성이 아니라, 내 목소리로 읽고 읽은 문장을 남깁니다.
          </p>
        </div>
        <span className="text-xs text-mute">{progress}%</span>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-line/70">
        <div
          className="h-full bg-ink transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="letter-body mt-4 rounded-xl bg-white/55 px-3 py-3 text-[15px] leading-[1.85] text-ink/90">
        <span className="bg-ink/10 text-ink">{script.slice(0, readUntil)}</span>
        <span className="text-mute">{script.slice(readUntil)}</span>
      </div>

      <div className="mt-4">
        <p className="text-xs text-mute">내가 읽은 것</p>
        <div className="mt-2 min-h-[4.5rem] rounded-xl border border-line bg-white/70 px-3 py-3 text-[14px] leading-relaxed text-ink">
          {spoken ? (
            <>
              <span>{finalText}</span>
              {interim ? <span className="text-mute"> {interim}</span> : null}
            </>
          ) : (
            <span className="text-mute">여기에 읽은 문장이 실시간으로 표시됩니다.</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <PrimaryButton type="button" onClick={toggle} aria-pressed={listening}>
          {listening ? "읽기 중지" : "읽기 시작"}
        </PrimaryButton>
        <SecondaryButton type="button" onClick={save} disabled={!finalText.trim()}>
          읽은 것 저장
        </SecondaryButton>
      </div>
      <button
        type="button"
        onClick={reset}
        className="mt-3 w-full text-center text-xs text-mute underline-offset-4 hover:underline"
      >
        다시 읽기
      </button>
      {hint ? <p className="mt-2 text-center text-xs text-mute">{hint}</p> : null}
      {savedTranscript && !listening ? (
        <p className="mt-2 text-center text-xs text-mute">이전에 저장한 읽기가 있습니다.</p>
      ) : null}
    </div>
  );
}
