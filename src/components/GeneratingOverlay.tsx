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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#f4f4f2]/96 px-8">
      <div className="w-full max-w-sm text-center">
        <p className="mb-6 text-sm text-mute">FROM.ME</p>
        <p
          key={index}
          className="animate-fade-up text-xl font-medium leading-relaxed text-ink sm:text-2xl"
        >
          {STEPS[index]}
        </p>
        <div className="mx-auto mt-10 h-px w-24 overflow-hidden bg-line">
          <div className="h-full w-1/2 animate-progress bg-ink" />
        </div>
      </div>
    </div>
  );
}
