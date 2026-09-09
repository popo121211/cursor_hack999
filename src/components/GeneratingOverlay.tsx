"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "당신의 목표를 읽고 있어요.",
  "그 목표가 중요한 이유를 이해하는 중…",
  "미래의 당신을 만나러 가는 중…",
  "연결되었습니다.",
];

export function GeneratingOverlay({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;

    const id = window.setInterval(() => {
      setIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 900);

    return () => window.clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#FAFAFA]/95 px-8 backdrop-blur-[2px]">
      <div className="w-full max-w-sm text-center">
        <p className="mb-8 text-[13px] tracking-[0.2em] text-mute">FROM.ME</p>
        <p
          key={index}
          className="animate-fade-up text-xl font-medium leading-relaxed text-ink sm:text-2xl"
        >
          {STEPS[index]}
        </p>
        <div className="mx-auto mt-10 h-[2px] w-24 overflow-hidden bg-line">
          <div className="h-full w-1/2 animate-progress bg-ink" />
        </div>
      </div>
    </div>
  );
}
