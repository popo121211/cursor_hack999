"use client";

import { useEffect, useRef, useState } from "react";
import { isSttSupported, startKoreanDictation } from "@/lib/stt";

interface ReasonVoiceInputProps {
  value: string;
  onChange: (next: string, meta?: { fromVoice: boolean }) => void;
}

export function ReasonVoiceInput({ value, onChange }: ReasonVoiceInputProps) {
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const baseRef = useRef(value);

  useEffect(() => {
    setMounted(true);
    setSupported(isSttSupported());
  }, []);

  useEffect(() => {
    return () => stopRef.current?.();
  }, []);

  function stop() {
    stopRef.current?.();
    stopRef.current = null;
    setListening(false);
  }

  function toggle() {
    if (!supported) {
      setHint("Chrome에서 마이크 입력을 사용할 수 있어요.");
      return;
    }

    if (listening) {
      stop();
      setHint(null);
      return;
    }

    baseRef.current = value.trim();
    setHint("듣고 있어요. 이유를 말해보세요.");
    setListening(true);

    stopRef.current = startKoreanDictation({
      onInterim: (text) => {
        const merged = [baseRef.current, text].filter(Boolean).join(" ").trim();
        onChange(merged.slice(0, 200), { fromVoice: true });
      },
      onFinal: (text) => {
        const merged = [baseRef.current, text].filter(Boolean).join(" ").trim();
        baseRef.current = merged.slice(0, 200);
        onChange(baseRef.current, { fromVoice: true });
      },
      onError: (message) => {
        setHint(message);
        setListening(false);
      },
      onEnd: () => {
        setListening(false);
        setHint((prev) =>
          prev && prev.startsWith("듣고") ? "음성 입력을 반영했어요." : prev,
        );
      },
    });
  }

  if (!mounted) {
    return <div className="mt-2 h-5" aria-hidden />;
  }

  if (!supported) {
    return (
      <p className="mt-2 text-xs text-mute">
        이 환경에서는 음성 입력을 쓸 수 없어요. 텍스트로 적어주세요.
      </p>
    );
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggle}
        className={`text-sm underline underline-offset-4 transition ${
          listening ? "text-ink" : "text-mute hover:text-ink"
        }`}
      >
        {listening ? "말하기 중지" : "말로 이유 남기기"}
      </button>
      {hint ? <p className="mt-1 text-xs text-mute">{hint}</p> : null}
    </div>
  );
}
