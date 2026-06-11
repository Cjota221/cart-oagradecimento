import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { mono?: boolean };

export default function Input({ className = "", mono = false, ...props }: Props) {
  return (
    <input
      style={{
        fontFamily: mono
          ? "var(--font-dm-mono), monospace"
          : "var(--font-dm-sans), sans-serif",
      }}
      className={`w-full rounded-lg border border-[#E6E2DC] bg-white px-3 py-2.5 text-sm text-[#16120E] outline-none focus:border-[#1847CC] focus:border-[1.5px] ${className}`}
      {...props}
    />
  );
}
