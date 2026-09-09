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
        <p className="section-label animate-fade-up">Archive</p>
        <h1 className="animate-fade-up delay-1 font-display mt-3 text-[2.55rem] leading-[1.08]">
          내 타임캡슐
        </h1>
        <p className="animate-fade-up delay-2 mt-4 text-[15px] text-mute">
          이 기기에 저장된 최근 메시지입니다.
        </p>

        {!mounted ? (
          <p className="mt-12 text-sm text-mute">불러오는 중…</p>
        ) : capsules.length === 0 ? (
          <div className="animate-soft-in mt-10 section-rule">
            <p className="text-[15px] text-ink">아직 저장된 타임캡슐이 없어요.</p>
            <Link href="/create" className="btn-primary mt-7 max-w-xs">
              시작하기
            </Link>
          </div>
        ) : (
          <ul className="mt-9 space-y-4">
            {capsules.map((c, i) => (
              <li
                key={c.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 5) * 0.06}s` }}
              >
                <Link
                  href={`/result/${c.id}`}
                  className="letter-sheet block transition duration-200 hover:-translate-y-0.5"
                >
                  <p className="text-[15px] font-medium text-ink">{c.input.goal}</p>
                  <p className="mt-2 line-clamp-2 font-display text-[1.15rem] leading-snug text-ink/85">
                    {c.result.headline}
                  </p>
                  <p className="mt-4 text-xs tracking-[0.04em] text-mute">
                    {c.input.targetDate}
                    {c.promiseAccepted ? " · 약속함" : ""}
                    {c.hasVoiceMemo ? " · 음성" : ""}
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
