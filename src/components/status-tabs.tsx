import Link from "next/link";
import { cn } from "@/lib/utils";

export type StatusTab = {
  label: string;
  count: number;
  href: string;
  active: boolean;
};

export function StatusTabs({ tabs }: { tabs: StatusTab[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          scroll={false}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition",
            t.active
              ? "border-[var(--brand)]/60 bg-[var(--brand)]/10 text-foreground"
              : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:bg-accent/40",
          )}
        >
          <span>{t.label}</span>
          <span
            className={cn(
              "text-[10px] tabular-nums",
              t.active ? "text-[var(--brand)] font-semibold" : "",
            )}
          >
            {t.count}
          </span>
        </Link>
      ))}
    </div>
  );
}
