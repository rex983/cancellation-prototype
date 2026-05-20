"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Truck,
  Ban,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/roles";
import { canReview, canSeeBst, canSeeSales } from "@/lib/roles";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  show: (role: Role) => boolean;
};

export function Sidebar({
  role,
  pendingCancellations,
}: {
  role: Role;
  pendingCancellations: number;
}) {
  const pathname = usePathname();

  const items: Item[] = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: () => true,
    },
    {
      href: "/sales",
      label: "Pre-STM Orders",
      icon: FileText,
      show: canSeeSales,
    },
    {
      href: "/bst",
      label: "Post-STM Orders",
      icon: Truck,
      show: canSeeBst,
    },
    {
      href: "/cancellations",
      label: "Cancellations",
      icon: Ban,
      count: pendingCancellations || undefined,
      show: canReview,
    },
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r bg-card/40">
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <div className="h-9 w-9 rounded-md grid place-items-center font-bold text-white bg-[var(--brand)]">
          BBD
        </div>
        <div className="leading-tight">
          <div className="font-bold text-sm">
            BIG <span className="text-[var(--brand)]">BUILDINGS</span>
          </div>
          <div className="text-[10px] tracking-[0.2em] text-muted-foreground">
            DIRECT
          </div>
        </div>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {items
          .filter((i) => i.show(role))
          .map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.count ? (
                  <span className="h-5 min-w-5 px-1.5 inline-flex items-center justify-center text-[10px] rounded-full bg-[var(--brand)] text-white font-semibold">
                    {item.count}
                  </span>
                ) : null}
              </Link>
            );
          })}
      </nav>
      <div className="px-4 py-3 border-t text-[10px] text-muted-foreground">
        Prototype · state resets on redeploy
      </div>
    </aside>
  );
}
