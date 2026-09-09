"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "이유를 압축하고 있어요",
  "작심삼일 지점을 찾고 있어요",
  "두 갈래의 미래를 쓰는 중",
  "연결됐어요",
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#dfe5ec]/86 px-8 backdrop-blur-md">
      <div className="letter-sheet w-full max-w-sm text-center">
        <p className="mb-6 font-display text-lg tracking-[-0.03em] text-ink">FROM.ME</p>
        <p
          key={index}
          className="animate-fade-up font-display text-[1.45rem] leading-relaxed text-ink sm:text-[1.65rem]"
        >
          {STEPS[index]}
        </p>
        <div className="mx-auto mt-11 h-px w-32 overflow-hidden bg-line">
          <div className="h-full w-1/2 animate-progress bg-ink" />
        </div>
      </div>
    </div>
  );
}
