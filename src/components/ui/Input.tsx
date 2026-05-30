import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: Props) {
  return (
    <input
      className={`w-full rounded-xl border border-[#6c2eb9]/20 bg-white px-3 py-2 text-sm text-[#1a0533] outline-none focus:border-[#6c2eb9]/60 ${className}`}
      {...props}
    />
  );
}
