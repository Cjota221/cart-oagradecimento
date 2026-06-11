import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ className?: string }>;

export default function Card({ className = "", children }: Props) {
  return (
    <div className={`rounded-xl border border-[#E6E2DC] bg-white p-5 ${className}`}>
      {children}
    </div>
  );
}
