import Link from "next/link";

export function SiteHeader({ showCapsule = true }: { showCapsule?: boolean }) {
  return (
    <header className="page-shell flex items-center justify-between py-7">
      <Link
        href="/"
        className="font-display text-[1.4rem] leading-none tracking-[-0.04em] text-ink transition-opacity hover:opacity-70"
      >
        FROM.ME
      </Link>
      {showCapsule ? (
        <Link
          href="/capsule"
          className="text-[13px] tracking-[0.04em] text-mute transition-colors hover:text-ink"
        >
          내 타임캡슐
        </Link>
      ) : (
        <span className="text-[13px] tracking-[0.04em] text-mute">보관함</span>
      )}
    </header>
  );
}
