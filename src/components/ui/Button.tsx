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
    primary: "bg-[#FF5028] hover:bg-[#C83A18] text-white font-bold tracking-[-0.01em]",
    accent: "bg-[#FF5028] hover:bg-[#C83A18] text-white font-bold tracking-[-0.01em]",
    secondary: "bg-[#FFF1EE] hover:bg-[#FFE2DA] text-[#FF5028] font-semibold border border-[#FFD2C7]",
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
