import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
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

        <p className="animate-fade-up mt-6 max-w-[20rem] text-[1.15rem] leading-relaxed text-ink/90">
          목표를 세운 순간,
          <br />
          미래의 내가 오늘을 남긴다.
        </p>

        <p className="animate-fade-up mt-4 max-w-sm text-[15px] leading-relaxed text-mute">
          포기하기 전에, 그때의 이유를 다시 듣게 해줍니다.
        </p>

        <div className="animate-fade-up mt-10">
          <Link
            href="/create"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-6 text-[15px] font-medium text-white transition hover:opacity-90"
          >
            미래의 나 만나기
          </Link>
        </div>

        <p className="animate-fade-up mt-8 text-[13px] leading-relaxed text-mute">
          AI Future Self · 음성으로 듣기 · 알림 체험
        </p>
      </main>
    </div>
  );
}
