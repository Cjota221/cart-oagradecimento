import { ReactNode, SVGProps } from "react";

type IconName =
  | "arrow-left"
  | "arrow-right"
  | "briefcase"
  | "check"
  | "clock"
  | "copy-check"
  | "grid"
  | "lock"
  | "package"
  | "printer"
  | "ruler"
  | "settings"
  | "sparkle"
  | "store"
  | "success"
  | "upload"
  | "x";

type Props = SVGProps<SVGSVGElement> & {
  name: IconName;
};

const paths: Record<IconName, ReactNode> = {
  "arrow-left": <path d="m15 18-6-6 6-6M9 12h12" />,
  "arrow-right": <path d="M5 12h14m-6-6 6 6-6 6" />,
  briefcase: (
    <>
      <path d="M10 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
      <path d="M4 8h20v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <path d="M4 13h20" />
    </>
  ),
  check: <path d="m5 13 4 4L19 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </>
  ),
  "copy-check": (
    <>
      <path d="M8 8h10a2 2 0 0 1 2 2v10H10a2 2 0 0 1-2-2Z" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4h9a2 2 0 0 1 2 2v1" />
      <path d="m12 14 2 2 4-5" />
    </>
  ),
  grid: (
    <>
      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" />
    </>
  ),
  package: (
    <>
      <path d="m4 8 8-4 8 4-8 4Z" />
      <path d="M4 8v8l8 4 8-4V8" />
      <path d="M12 12v8" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V4h10v5" />
      <path d="M7 18H5a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-2" />
      <path d="M7 14h10v7H7z" />
      <path d="M18 12h.01" />
    </>
  ),
  ruler: (
    <>
      <path d="M4 17 17 4l3 3L7 20z" />
      <path d="m14 7 3 3M11 10l2 2M8 13l3 3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3 9.8 9.8 3 12l6.8 2.2L12 21l2.2-6.8L21 12l-6.8-2.2Z" />
      <path d="M19 3v4M21 5h-4" />
    </>
  ),
  store: (
    <>
      <path d="M4 10h16l-1-5H5z" />
      <path d="M6 10v10h12V10" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  success: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </>
  ),
  x: <path d="M6 6 18 18M18 6 6 18" />,
};

export default function Icon({ name, className = "", ...props }: Props) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
