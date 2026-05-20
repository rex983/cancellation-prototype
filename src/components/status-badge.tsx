import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/format";

const TONE: Record<BadgeTone, string> = {
  green:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  blue: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  amber:
    "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  red: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  violet:
    "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-300",
  muted:
    "border-zinc-500/40 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide leading-none",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
