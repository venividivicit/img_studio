import type { ReactNode } from "react";

type PulsingBorderBoxProps = {
  children?: ReactNode;
  className?: string;
};

export function PulsingBorderBox({
  children,
  className = "",
}: PulsingBorderBoxProps) {
  return (
    <div className={`relative rounded-2xl p-[3px] ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        aria-hidden
      >
        <div className="absolute inset-[-50%] animate-border-glow">
          <div className="h-full w-full bg-[conic-gradient(from_0deg,transparent_0deg_300deg,rgba(99,102,241,0.25)_310deg,#6366f1_330deg,#a78bfa_345deg,#e879f9_355deg,transparent_360deg)]" />
        </div>
      </div>
      <div className="relative rounded-[13px] border border-zinc-800/80 bg-zinc-900 px-10 py-12 shadow-xl shadow-black/40">
        {children}
      </div>
    </div>
  );
}
