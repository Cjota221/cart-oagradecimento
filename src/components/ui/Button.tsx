import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition";
  const styles =
    variant === "primary"
      ? "text-white shadow-[0_10px_30px_-12px_rgba(108,46,185,0.9)] bg-[linear-gradient(90deg,#6c2eb9,#e91e8c)] hover:brightness-110"
      : "border border-[#6c2eb9]/20 bg-white text-[#1a0533] hover:border-[#6c2eb9]/40";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
