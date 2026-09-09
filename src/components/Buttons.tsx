import { ReactNode } from "react";

export function PrimaryButton({
  children,
  className = "",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button type={type} className={`btn-primary ${className}`} {...props}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button type={type} className={`btn-secondary ${className}`} {...props}>
      {children}
    </button>
  );
}
