"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { useCapsules, useHasMounted } from "@/lib/hooks";

export default function CapsuleListPage() {
  const mounted = useHasMounted();
  const capsules = useCapsules();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader showCapsule={false} />
      <main className="page-shell flex-1 pb-20 pt-2">
        <p className="section-label">Archive</p>
        <h1 className="font-display mt-3 text-[2.4rem]">내 타임캡슐</h1>
        <p className="mt-3 text-[15px] text-mute">이 기기에 저장된 최근 메시지입니다.</p>

        {!mounted ? (
          <p className="mt-12 text-sm text-mute">불러오는 중…</p>
        ) : capsules.length === 0 ? (
          <div className="mt-10 letter-sheet">
            <p className="text-[15px] text-ink">아직 저장된 타임캡슐이 없어요.</p>
            <Link
              href="/create"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-ink px-6 text-white"
            >
              시작하기
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {capsules.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/result/${c.id}`}
                  className="letter-sheet block transition hover:-translate-y-0.5"
                >
                  <p className="text-[15px] font-medium text-ink">{c.input.goal}</p>
                  <p className="mt-1 line-clamp-1 font-display text-[1.05rem] text-ink/80">
                    {c.result.headline}
                  </p>
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
