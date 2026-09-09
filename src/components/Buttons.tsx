import { ReactNode } from "react";

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-6 text-[15px] font-medium text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
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
      className={`inline-flex h-12 w-full items-center justify-center rounded-full border border-line bg-transparent px-6 text-[15px] font-medium text-ink transition hover:bg-black/[0.03] disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
