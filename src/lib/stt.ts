"use client";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSttSupported() {
  return !!getRecognitionCtor();
}

export function startKoreanDictation(options: {
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}): () => void {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    options.onError?.("이 브라우저는 음성 입력을 지원하지 않아요. Chrome을 권장합니다.");
    return () => {};
  }

  const recognition = new Ctor();
  recognition.lang = "ko-KR";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let interim = "";
    let finals = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const piece = event.results[i][0]?.transcript ?? "";
      if (event.results[i].isFinal) finals += piece;
      else interim += piece;
    }
    if (interim) options.onInterim?.(interim);
    if (finals) options.onFinal?.(finals);
  };

  recognition.onerror = (event) => {
    if (event.error === "aborted" || event.error === "no-speech") return;
    options.onError?.(
      event.error === "not-allowed"
        ? "마이크 권한을 허용해주세요."
        : "음성 인식 중 문제가 생겼어요.",
    );
  };

  recognition.onend = () => options.onEnd?.();

  try {
    recognition.start();
  } catch {
    options.onError?.("음성 인식을 시작하지 못했어요.");
  }

  return () => {
    try {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    } catch {
      // ignore
    }
  };
}
