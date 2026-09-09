"use client";

import { useEffect, useRef, useState } from "react";
import { SecondaryButton } from "@/components/Buttons";
import {
  buildSpeakText,
  isSpeechSupported,
  speakFutureSelf,
  stopSpeaking,
} from "@/lib/speech";
import { Tone } from "@/lib/types";

interface VoicePlayerProps {
  headline: string;
  message: string;
  action: string;
  tone: Tone;
  listenLabel?: string;
}

export function VoicePlayer({
  headline,
  message,
  action,
  tone,
  listenLabel = "미래의 나 목소리로 듣기",
}: VoicePlayerProps) {
  const [supported] = useState(() => isSpeechSupported());
  const [speaking, setSpeaking] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopRef.current?.();
      stopSpeaking();
    };
  }, []);

  function toggle() {
    if (!supported) return;

    if (speaking) {
      stopRef.current?.();
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    const text = buildSpeakText({ headline, message, action });
    stopRef.current = speakFutureSelf({
      text,
      tone,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  if (!supported) {
    return (
      <p className="mt-4 text-sm text-mute">
        이 브라우저에서는 음성 재생을 지원하지 않아요. Chrome에서 열어보세요.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <SecondaryButton type="button" onClick={toggle} aria-pressed={speaking}>
        {speaking ? "음성 중지" : listenLabel}
      </SecondaryButton>
      <p className="mt-2 text-center text-xs text-mute">
        {speaking ? "읽고 있어요…" : "기기 음성으로 편지를 읽습니다"}
      </p>
    </div>
  );
}
