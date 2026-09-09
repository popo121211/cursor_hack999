"use client";

import { useEffect, useRef, useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import {
  isMediaRecorderSupported,
  pickRecorderMimeType,
} from "@/lib/voiceStore";

const MAX_SECONDS = 45;
const MAX_FILE_BYTES = 3 * 1024 * 1024;

interface VoiceMemoRecorderProps {
  value: Blob | null;
  onChange: (blob: Blob | null) => void;
}

function micErrorMessage(err: unknown): string {
  const name =
    err && typeof err === "object" && "name" in err
      ? String((err as { name: string }).name)
      : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "마이크 권한을 허용해주세요. 주소창 왼쪽 자물쇠 → 마이크 허용.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "마이크를 찾지 못했어요. 아래에서 오디오 파일을 첨부할 수 있어요.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "마이크를 다른 앱이 쓰고 있을 수 있어요. 닫고 다시 시도해주세요.";
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "보안 연결(https 또는 localhost)에서만 녹음할 수 있어요.";
  }
  return "녹음을 시작하지 못했어요. 오디오 파일 첨부로 대신할 수 있어요.";
}

export function VoiceMemoRecorder({ value, onChange }: VoiceMemoRecorderProps) {
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mediaRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setSupported(isMediaRecorderSupported());
  }, []);

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
    if (!supported) {
      setError("이 브라우저는 마이크 녹음을 지원하지 않아요. 파일을 첨부해주세요.");
      return;
    }
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
      recorder.onerror = () => {
        setError("녹음 중 오류가 났어요. 다시 시도하거나 파일을 첨부해주세요.");
        finishRecording();
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
        } else {
          setError("녹음된 소리가 비어 있어요. 다시 녹음하거나 파일을 첨부해주세요.");
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
    } catch (err) {
      setError(micErrorMessage(err));
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onPickFile(file: File | null) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("audio/") && !/\.(webm|mp3|m4a|wav|ogg|aac)$/i.test(file.name)) {
      setError("오디오 파일만 첨부할 수 있어요. (webm, mp3, wav 등)");
      return;
    }
    if (file.size === 0) {
      setError("빈 파일이에요. 다른 오디오를 선택해주세요.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("파일이 너무 커요. 3MB 이하로 첨부해주세요.");
      return;
    }
    const blob = file.slice(0, file.size, file.type || "audio/webm");
    setPreviewFromBlob(blob);
    onChange(blob);
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
          <PrimaryButton
            type="button"
            onClick={start}
            disabled={!mounted || !supported}
          >
            {value ? "다시 녹음" : "녹음 시작"}
          </PrimaryButton>
        )}
        <SecondaryButton type="button" onClick={clear} disabled={!value && !recording}>
          삭제
        </SecondaryButton>
      </div>

      <div className="mt-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.webm,.mp3,.m4a,.wav,.ogg,.aac"
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />
        <SecondaryButton
          type="button"
          disabled={recording}
          onClick={() => fileInputRef.current?.click()}
        >
          오디오 파일 첨부
        </SecondaryButton>
        <p className="mt-2 text-xs text-mute">
          마이크가 없거나 권한이 안 되면 녹음 파일로 대신 남길 수 있어요.
        </p>
      </div>

      {mounted && !supported ? (
        <p className="mt-2 text-xs text-mute">
          이 브라우저는 마이크 녹음을 지원하지 않아요. Chrome + 파일 첨부를 권장합니다.
        </p>
      ) : null}

      {preview ? (
        <audio className="mt-3 w-full" controls src={preview} preload="metadata" />
      ) : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
