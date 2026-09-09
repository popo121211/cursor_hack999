"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { useCapsules } from "@/lib/hooks";

export default function CapsuleListPage() {
  const capsules = useCapsules();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader showCapsule={false} />
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-16 pt-2">
        <p className="text-[13px] tracking-[0.18em] text-mute">CAPSULES</p>
        <h1 className="font-display mt-3 text-3xl">내 타임캡슐</h1>
        <p className="mt-3 text-[15px] text-mute">이 기기에 저장된 최근 메시지입니다.</p>

        {capsules.length === 0 ? (
          <div className="mt-12">
            <p className="text-[15px] text-ink">아직 저장된 타임캡슐이 없어요.</p>
            <Link
              href="/create"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-white"
            >
              미래의 나 만나기
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {capsules.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/result/${c.id}`}
                  className="block rounded-2xl border border-line bg-white px-4 py-4 transition hover:border-ink/30"
                >
                  <p className="text-[15px] font-medium text-ink">{c.input.goal}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-mute">{c.result.headline}</p>
                  <p className="mt-3 text-xs text-mute">
                    {c.input.targetDate}
                    {c.promiseAccepted ? " · 약속함" : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
