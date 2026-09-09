import Link from "next/link";

export function SiteHeader({ showCapsule = true }: { showCapsule?: boolean }) {
  return (
    <header className="mx-auto flex w-full max-w-lg items-center justify-between px-5 py-5">
      <Link href="/" className="text-[15px] font-medium text-ink">
        FROM.ME
      </Link>
      {showCapsule ? (
        <Link
          href="/capsule"
          className="text-sm text-mute transition-opacity hover:opacity-70"
        >
          내 타임캡슐
        </Link>
      ) : (
        <span className="text-sm text-mute">보관함</span>
      )}
    </header>
  );
}
