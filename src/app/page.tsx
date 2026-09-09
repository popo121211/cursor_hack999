"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  const [teaser, setTeaser] = useState<"kept" | "missed">("kept");

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      <div className="hero-orb animate-breathe left-[-20%] top-[12%] h-56 w-56" />
      <div className="hero-orb right-[-18%] top-[38%] h-72 w-72 opacity-70" />

      <SiteHeader />

      <main className="page-shell relative flex flex-1 flex-col justify-center pb-20 pt-6">
        <p className="animate-fade-up section-label">Time capsule</p>

        <h1 className="animate-fade-up font-display mt-5 text-[3.4rem] leading-[1.05] text-ink sm:text-[4.2rem]">
          FROM.ME
        </h1>

        <p className="animate-fade-up mt-7 max-w-[18rem] text-[1.35rem] leading-snug text-ink-soft">
          오늘의 선택이
          <br />
          미래의 나를 가른다.
        </p>

        <p className="animate-fade-up mt-4 max-w-sm text-[15px] leading-relaxed text-mute">
          지금의 목소리를 녹음해 두고, 나중에 다시 듣게 합니다.
        </p>

        <div className="animate-soft-in mt-10 letter-sheet">
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
            className="animate-fade-up mt-5 font-display text-[1.2rem] leading-relaxed text-ink"
          >
            {teaser === "kept"
              ? "오늘의 네가 빠지면, 이 장면도 없다."
              : "비워둔 날의 나야. 그래도 다시 이을 수는 있어."}
          </p>
        </div>

        <div className="animate-fade-up mt-8">
          <Link
            href="/create"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-ink px-6 text-[15px] font-medium text-white transition hover:bg-[#2a303a]"
          >
            시작하기
          </Link>
        </div>
      </main>
    </div>
  );
}
