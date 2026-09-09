import Link from "next/link";

export function SiteHeader({ showCapsule = true }: { showCapsule?: boolean }) {
  return (
    <header className="page-shell flex items-center justify-between py-6">
      <Link
        href="/"
        className="font-display text-[1.35rem] leading-none tracking-[-0.04em] text-ink"
      >
        FROM.ME
      </Link>
      {showCapsule ? (
        <Link
          href="/capsule"
          className="text-sm text-mute transition-colors hover:text-ink"
        >
          내 타임캡슐
        </Link>
      ) : (
        <span className="text-sm text-mute">보관함</span>
      )}
    </header>
  );
}
