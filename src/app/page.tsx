"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  const [teaser, setTeaser] = useState<"kept" | "missed">("kept");

  return (
    <div className="relative flex min-h-full flex-col overflow-x-hidden">
      <div className="hero-orb animate-breathe left-[-22%] top-[8%] h-64 w-64" />
      <div className="hero-orb animate-drift right-[-20%] top-[42%] h-80 w-80 opacity-70" />

      <SiteHeader />

      <main className="relative flex flex-1 flex-col">
        <section className="hero-stage page-shell pb-6 pt-6">
          <div className="hero-plane" aria-hidden />

          <div className="relative z-[1]">
            <h1 className="animate-fade-up font-display text-[3.6rem] leading-[0.98] text-ink sm:text-[4.4rem]">
              FROM.ME
            </h1>
            <p className="animate-fade-up delay-1 mt-8 max-w-[17.5rem] text-[1.4rem] leading-snug text-ink-soft">
              오늘의 선택이
              <br />
              미래의 나를 가른다.
            </p>
            <div className="animate-fade-up delay-2 mt-10">
              <Link href="/create" className="btn-primary">
                시작하기
              </Link>
            </div>
          </div>
        </section>

        <section className="page-shell pb-24 pt-2">
          <p className="section-label">Two futures</p>
          <h2 className="font-display mt-3 text-[1.7rem] leading-snug text-ink">
            같은 오늘에서 갈라지는 두 나
          </h2>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-mute">
            글과 목소리로 지금의 나를 남겨 두면, 타임캡슐을 열 때 다시 듣게 됩니다.
          </p>
          <div className="mt-4">
            <div className="path-tabs">
              <button
                type="button"
                className="path-tab"
                data-active={teaser === "kept"}
                onClick={() => setTeaser("kept")}
              >
                지킨 나
              </button>
              <button
                type="button"
                className="path-tab"
                data-active={teaser === "missed"}
                onClick={() => setTeaser("missed")}
              >
                미룬 나
              </button>
            </div>
            <p
              key={teaser}
              className="animate-fade-up mt-4 font-display text-[1.25rem] leading-relaxed text-ink"
            >
              {teaser === "kept"
                ? "오늘의 네가 빠지면, 이 장면도 없다."
                : "비워둔 날의 나야. 그래도 다시 이을 수는 있어."}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
