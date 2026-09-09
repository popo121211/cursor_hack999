"use client";

interface PushToastProps {
  visible: boolean;
  body: string;
  onOpen?: () => void;
  onDismiss?: () => void;
}

export function PushToast({ visible, body, onOpen, onDismiss }: PushToastProps) {
  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-3 z-50 w-[min(92vw,380px)] -translate-x-1/2 transition-all duration-500 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-6 opacity-0"
      }`}
      aria-hidden={!visible}
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={onOpen}
        className="w-full rounded-2xl border border-black/5 bg-white/95 p-3.5 text-left shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur"
      >
        <div className="mb-1 flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium tracking-[0.16em] text-ink">
            FROM.ME
          </span>
          <span className="text-[11px] text-mute">지금</span>
        </div>
        <p className="text-[13px] font-medium text-ink">
          미래의 나에게서 메시지가 도착했습니다.
        </p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-mute">{body}</p>
      </button>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-2 w-full text-center text-xs text-mute"
        >
          닫기
        </button>
      ) : null}
    </div>
  );
}
