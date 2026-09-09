"use client";

import { useEffect, useState } from "react";
import { SecondaryButton } from "@/components/Buttons";
import { getVoiceMemo } from "@/lib/voiceStore";

interface VoiceMemoPlayerProps {
  memoId: string;
  label?: string;
  autoPlayToken?: number;
}

export function VoiceMemoPlayer({
  memoId,
  label = "지금의 내가 남긴 음성",
  autoPlayToken = 0,
}: VoiceMemoPlayerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const blob = await getVoiceMemo(memoId);
        if (!active) return;
        if (!blob) {
          setMissing(true);
          setUrl(null);
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setMissing(false);
        setUrl(objectUrl);
      } catch {
        if (active) {
          setMissing(true);
          setUrl(null);
        }
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [memoId]);

  useEffect(() => {
    if (!autoPlayToken || !url) return;
    const audio = document.getElementById(`voice-memo-${memoId}`) as HTMLAudioElement | null;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [autoPlayToken, url, memoId]);

  if (missing) {
    return (
      <p className="mt-2 text-sm text-mute">저장된 음성이 없습니다.</p>
    );
  }

  if (!url) {
    return <p className="mt-2 text-sm text-mute">음성을 불러오는 중…</p>;
  }

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="mt-1 text-xs text-mute">타임캡슐에 남겨둔 내 목소리입니다.</p>
      <audio
        id={`voice-memo-${memoId}`}
        className="mt-3 w-full"
        controls
        src={url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <div className="mt-3">
        <SecondaryButton
          type="button"
          onClick={() => {
            const audio = document.getElementById(
              `voice-memo-${memoId}`,
            ) as HTMLAudioElement | null;
            if (!audio) return;
            if (playing) {
              audio.pause();
              return;
            }
            void audio.play();
          }}
        >
          {playing ? "일시정지" : "음성 재생하기"}
        </SecondaryButton>
      </div>
    </div>
  );
}
