import { ReactNode } from "react";

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`inline-flex h-12 w-full items-center justify-center rounded-xl bg-ink px-6 text-[15px] font-medium text-white transition enabled:hover:bg-ink-soft enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`inline-flex h-12 w-full items-center justify-center rounded-xl border border-line bg-white/50 px-6 text-[15px] font-medium text-ink backdrop-blur-sm transition hover:bg-white disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
