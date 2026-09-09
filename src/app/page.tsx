"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  const [teaser, setTeaser] = useState<"kept" | "missed">("kept");

  return (
    <div className="relative flex min-h-full flex-col overflow-x-hidden">
      <div className="hero-orb animate-breathe left-[-28%] top-[4%] h-72 w-72 opacity-80" />
      <div className="hero-orb animate-drift right-[-26%] top-[48%] h-96 w-96 opacity-55" />

      <SiteHeader />

      <main className="relative flex flex-1 flex-col">
        {/* 첫 화면: 브랜드 한 프레임 — 인위적 stage 박스 없음 */}
        <section className="page-shell relative pb-14 pt-10 sm:pt-14">
          <p className="animate-fade-up section-label">Time capsule</p>
          <h1 className="animate-fade-up delay-1 font-display mt-5 text-[3.5rem] leading-[0.98] tracking-[-0.04em] text-ink sm:text-[4.35rem]">
            FROM.ME
          </h1>
          <p className="animate-fade-up delay-2 mt-7 max-w-[17.5rem] text-[1.35rem] leading-snug text-ink-soft">
            오늘의 선택이
            <br />
            미래의 나를 가른다.
          </p>
          <p className="animate-fade-up delay-3 mt-4 max-w-sm text-[15px] leading-relaxed text-mute">
            지금의 목소리를 남겨 두면, 타임캡슐을 열 때 다시 듣게 됩니다.
          </p>
          <div className="animate-fade-up delay-4 mt-9 max-w-sm">
            <Link href="/create" className="btn-primary">
              시작하기
            </Link>
          </div>
        </section>

        <section className="page-shell border-t border-line/60 pb-24 pt-10">
          <p className="section-label">Two futures</p>
          <h2 className="font-display mt-3 text-[1.65rem] leading-snug text-ink">
            같은 오늘에서 갈라지는 두 나
          </h2>
          <div className="mt-5">
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
        </section>
      </main>
    </div>
  );
}
