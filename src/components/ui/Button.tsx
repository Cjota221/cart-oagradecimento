import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";

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
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm transition font-jakarta";
  const styles = {
    primary: "bg-[#1847CC] hover:bg-[#1038A8] text-white font-bold tracking-[-0.01em]",
    accent: "bg-[#F55028] hover:bg-[#D93D18] text-white font-bold tracking-[-0.01em]",
    secondary: "bg-[#EEF2FC] hover:bg-[#D8E3FA] text-[#1847CC] font-semibold border border-[#C8D4F8]",
    ghost: "bg-transparent text-[#9A948D] font-medium border border-[#E6E2DC] hover:bg-[#F5F3EF]",
  };

  return (
    <button
      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
