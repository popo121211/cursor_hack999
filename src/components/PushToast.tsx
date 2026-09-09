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
        className={`w-full border border-black/5 bg-white/95 p-4 text-left shadow-[0_18px_40px_rgba(18,21,27,0.12)] backdrop-blur-md ${
          visible ? "animate-soft-in" : ""
        }`}
      >
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="font-display text-[15px] text-ink">FROM.ME</span>
          <span className="text-[11px] tracking-[0.06em] text-mute">지금</span>
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
