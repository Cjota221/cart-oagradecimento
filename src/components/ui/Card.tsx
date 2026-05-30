import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  className?: string;
}>;

export default function Card({ className = "", children }: Props) {
  return (
    <div
      className={`rounded-2xl border border-[#6c2eb9]/10 bg-white/90 p-4 shadow-[0_12px_35px_-24px_rgba(26,5,51,0.5)] ${className}`}
    >
      {children}
    </div>
  );
}
