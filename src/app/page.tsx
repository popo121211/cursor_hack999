"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  const [teaser, setTeaser] = useState<"kept" | "missed">("kept");

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 pb-16 pt-4">
        <p className="animate-fade-up text-sm text-mute">타임캡슐</p>

        <h1 className="animate-fade-up font-display mt-4 text-[2.7rem] leading-[1.15] text-ink sm:text-5xl">
          FROM.ME
        </h1>

        <p className="animate-fade-up mt-6 max-w-[20rem] text-[1.2rem] leading-snug text-ink">
          오늘의 선택이
          <br />
          미래의 나를 가른다.
        </p>

        <p className="animate-fade-up mt-4 max-w-sm text-[15px] leading-relaxed text-mute">
          목표와 이유를 남기면, 지킨 나와 미룬 나의 목소리가 돌아옵니다.
        </p>

        <div className="animate-fade-up mt-9">
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
          <div className="mt-5 border-l-2 border-ink/20 pl-4">
            <p key={teaser} className="animate-fade-up text-[15px] leading-relaxed text-ink">
              {teaser === "kept"
                ? "오늘의 네가 빠지면, 이 장면도 없다."
                : "비워둔 날의 나야. 그래도 다시 이을 수는 있어."}
            </p>
          </div>
        </div>

        <div className="animate-fade-up mt-10">
          <Link
            href="/create"
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-ink px-6 text-[15px] font-medium text-white transition hover:opacity-90"
          >
            시작하기
          </Link>
        </div>
      </main>
    </div>
  );
}
