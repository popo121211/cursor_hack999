"use client";

import { Tone } from "./types";

export type SpeechStatus = "idle" | "speaking" | "unsupported";

function pickKoreanVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const ko =
    voices.find((v) => v.lang.toLowerCase().startsWith("ko") && /female|woman|yuna|sunhi|google/i.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("ko")) ||
    voices.find((v) => /korean|한국어/i.test(v.name));
  return ko ?? null;
}

function toneParams(tone: Tone) {
  switch (tone) {
    case "gentle":
      return { rate: 0.92, pitch: 1.05 };
    case "spicy":
      return { rate: 1.05, pitch: 1.0 };
    case "realistic":
    default:
      return { rate: 0.98, pitch: 1.0 };
  }
}

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function buildSpeakText(parts: {
  headline: string;
  message: string;
  action: string;
}) {
  const message = parts.message.replace(/\n{2,}/g, ". ").replace(/\n/g, " ").trim();
  return `${parts.headline}. ${message} 오늘의 행동. ${parts.action}`;
}

/** 브라우저 내장 TTS. 키 없이 실제 음성 재생. */
export function speakFutureSelf(options: {
  text: string;
  tone: Tone;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}): () => void {
  if (!isSpeechSupported()) {
    options.onError?.();
    return () => {};
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(options.text);
  utter.lang = "ko-KR";
  const { rate, pitch } = toneParams(options.tone);
  utter.rate = rate;
  utter.pitch = pitch;

  const voice = pickKoreanVoice();
  if (voice) utter.voice = voice;

  // 일부 브라우저는 voices가 늦게 로드됨
  const assignVoiceAndSpeak = () => {
    const v = pickKoreanVoice();
    if (v) utter.voice = v;
    options.onStart?.();
    synth.speak(utter);
  };

  utter.onend = () => options.onEnd?.();
  utter.onerror = () => {
    options.onError?.();
    options.onEnd?.();
  };

  if (synth.getVoices().length === 0) {
    const once = () => {
      synth.removeEventListener("voiceschanged", once);
      assignVoiceAndSpeak();
    };
    synth.addEventListener("voiceschanged", once);
    // fallback if event never fires
    window.setTimeout(() => {
      synth.removeEventListener("voiceschanged", once);
      if (!synth.speaking) assignVoiceAndSpeak();
    }, 400);
  } else {
    assignVoiceAndSpeak();
  }

  return () => {
    synth.cancel();
  };
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
