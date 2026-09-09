"use client";

import { useEffect, useRef, useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import {
  isMediaRecorderSupported,
  pickRecorderMimeType,
} from "@/lib/voiceStore";

const MAX_SECONDS = 45;

interface VoiceMemoRecorderProps {
  value: Blob | null;
  onChange: (blob: Blob | null) => void;
}

export function VoiceMemoRecorder({ value, onChange }: VoiceMemoRecorderProps) {
  const [supported] = useState(() => isMediaRecorderSupported());
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const mediaRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  function setPreviewFromBlob(blob: Blob | null) {
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    }
    if (!blob) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(blob);
    previewUrl.current = url;
    setPreview(url);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      try {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.onstop = null;
          recorderRef.current.stop();
        }
      } catch {
        // ignore
      }
      mediaRef.current?.getTracks().forEach((t) => t.stop());
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    };
  }, []);

  function clearTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopTracks() {
    mediaRef.current?.getTracks().forEach((t) => t.stop());
    mediaRef.current = null;
  }

  function finishRecording() {
    clearTimer();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        setRecording(false);
        stopTracks();
      }
    } else {
      setRecording(false);
      stopTracks();
    }
  }

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = stream;
      chunksRef.current = [];
      const mimeType = pickRecorderMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        stopTracks();
        setRecording(false);
        clearTimer();
        if (blob.size > 0) {
          setPreviewFromBlob(blob);
          onChange(blob);
        }
      };

      recorder.start(250);
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next >= MAX_SECONDS) finishRecording();
          return next;
        });
      }, 1000);
    } catch {
      setError("마이크 권한을 허용해주세요.");
      stopTracks();
      setRecording(false);
    }
  }

  function clear() {
    clearTimer();
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }
    } catch {
      // ignore
    }
    stopTracks();
    setRecording(false);
    setSeconds(0);
    setError(null);
    setPreviewFromBlob(null);
    onChange(null);
  }

  if (!supported) {
    return (
      <p className="mt-2 text-xs text-mute">
        이 환경에서는 음성 녹음을 지원하지 않아요. Chrome을 권장합니다.
      </p>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink">지금 녹음 · 나중에 재생</p>
        <p className="text-xs text-mute">
          {recording
            ? `${seconds}s / ${MAX_SECONDS}s`
            : value
              ? "저장됨 · 결과에서 재생"
              : `최대 ${MAX_SECONDS}초`}
        </p>
      </div>
      <p className="mt-1 text-xs text-mute">
        원하는 말을 자유롭게 녹음하세요. 타임캡슐을 열 때 다시 들을 수 있어요.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {recording ? (
          <PrimaryButton type="button" onClick={finishRecording}>
            녹음 중지
          </PrimaryButton>
        ) : (
          <PrimaryButton type="button" onClick={start}>
            {value ? "다시 녹음" : "녹음 시작"}
          </PrimaryButton>
        )}
        <SecondaryButton type="button" onClick={clear} disabled={!value && !recording}>
          삭제
        </SecondaryButton>
      </div>

      {preview ? (
        <audio className="mt-3 w-full" controls src={preview} preload="metadata" />
      ) : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
