"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  const [teaser, setTeaser] = useState<"kept" | "missed">("kept");

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 pb-16 pt-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] bg-[radial-gradient(ellipse_at_top,_rgba(0,0,0,0.04),_transparent_60%)]" />

        <p className="animate-fade-up text-[13px] tracking-[0.22em] text-mute">
          FUTURE SELF MESSAGE
        </p>

        <h1 className="animate-fade-up font-display mt-6 text-[2.65rem] leading-[1.12] tracking-tight text-ink sm:text-5xl">
          FROM.ME
        </h1>

        <p className="animate-fade-up mt-6 max-w-[22rem] text-[1.15rem] leading-relaxed text-ink/90">
          오늘의 선택이,
          <br />
          미래의 나를 가른다.
        </p>

        <p className="animate-fade-up mt-4 max-w-sm text-[15px] leading-relaxed text-mute">
          오늘의 네가 없으면, 그 미래도 없습니다.
        </p>

        <div className="animate-fade-up mt-8">
          <div className="grid grid-cols-2 gap-2 rounded-full border border-line bg-white p-1">
            <button
              type="button"
              onClick={() => setTeaser("kept")}
              className={`h-9 rounded-full text-sm transition ${
                teaser === "kept" ? "bg-ink text-white" : "text-mute"
              }`}
            >
              지킨 나
            </button>
            <button
              type="button"
              onClick={() => setTeaser("missed")}
              className={`h-9 rounded-full text-sm transition ${
                teaser === "missed" ? "bg-ink text-white" : "text-mute"
              }`}
            >
              미룬 나
            </button>
          </div>
          <p key={teaser} className="animate-fade-up mt-4 text-[15px] leading-relaxed text-ink/90">
            {teaser === "kept"
              ? "“오늘의 네가 없었으면, 지금의 이 아침도 없어.”"
              : "“놓친 미래야. 그래도 지금 다시 선택하면 열려.”"}
          </p>
        </div>

        <div className="animate-fade-up mt-10">
          <Link
            href="/create"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-6 text-[15px] font-medium text-white transition hover:opacity-90"
          >
            미래의 나 만나기
          </Link>
        </div>
      </main>
    </div>
  );
}
