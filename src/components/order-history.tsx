import {
  FileText,
  CreditCard,
  Mail,
  Inbox,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Wallet,
  Ban,
  Circle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CANCEL_TYPE_LABEL,
  REFUND_METHOD_LABEL,
  formatCurrency,
} from "@/lib/format";
import type { Cancellation, CreditOnFile, Order } from "@/lib/types";

type Tone = "default" | "blue" | "green" | "amber" | "red" | "violet";

type Event = {
  at: string;
  icon: LucideIcon;
  tone: Tone;
  title: string;
  detail?: string;
  actor?: string;
  reference?: string;
};

const TONE_BG: Record<Tone, string> = {
  default: "bg-muted text-foreground",
  blue: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  red: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
};

function formatStamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildEvents(
  order: Order,
  cancellations: Cancellation[],
  credits: CreditOnFile[],
): Event[] {
  const events: Event[] = [];

  events.push({
    at: `${order.date}T00:00:00Z`,
    icon: FileText,
    tone: "default",
    title: "Order created",
    detail: `${order.customerName} · ${formatCurrency(order.total)}`,
  });

  for (const p of order.stripePayments ?? []) {
    events.push({
      at: p.createdAt,
      icon: CreditCard,
      tone: p.status === "succeeded" ? "green" : "amber",
      title: `${p.description ?? "Payment"} captured`,
      detail: `${formatCurrency(p.amount)} · ${p.status}`,
      reference: p.id,
    });
  }

  for (const c of cancellations) {
    events.push({
      at: c.requestedAt,
      icon: Inbox,
      tone: "amber",
      title: `Cancellation requested · ${CANCEL_TYPE_LABEL[c.type]}`,
      detail: c.reason,
      actor: c.requestedBy,
    });
    if (c.formSentAt) {
      events.push({
        at: c.formSentAt,
        icon: Mail,
        tone: "blue",
        title: "Cancellation form sent to customer",
        detail: `To ${order.customerEmail}`,
        actor: c.requestedBy,
      });
    }
    if (c.formReturnedAt) {
      events.push({
        at: c.formReturnedAt,
        icon: Inbox,
        tone: "blue",
        title: "Customer returned signed form",
        actor: c.formReturnedBy,
      });
    }
    if (c.decidedAt && c.status === "denied") {
      events.push({
        at: c.decidedAt,
        icon: XCircle,
        tone: "red",
        title: "Cancellation denied",
        detail: c.decisionNotes,
        actor: c.decidedBy,
      });
    } else if (c.decidedAt && c.status === "approved") {
      events.push({
        at: c.decidedAt,
        icon: CheckCircle2,
        tone: "green",
        title: "Cancellation approved",
        detail: c.decisionNotes,
        actor: c.decidedBy,
      });
    }
    if (c.refundedAt && c.outcome === "refund") {
      events.push({
        at: c.refundedAt,
        icon: RotateCcw,
        tone: "violet",
        title: `Refund issued${c.refundMethod ? ` · ${REFUND_METHOD_LABEL[c.refundMethod]}` : ""}`,
        detail: c.refundedAmount
          ? formatCurrency(c.refundedAmount)
          : undefined,
        actor: c.refundedBy,
        reference: c.refundReference,
      });
    }
    if (c.status === "completed" && c.outcome === "cof") {
      // Use cof creation time from the credit record for accuracy
      const cof = credits.find((cr) => cr.id === c.cofId);
      if (cof) {
        events.push({
          at: cof.createdAt,
          icon: Wallet,
          tone: "violet",
          title: "Credit on File created",
          detail: formatCurrency(cof.amount),
          actor: cof.createdBy,
          reference: cof.id,
        });
      }
    }
  }

  if (order.status === "cancelled") {
    const trigger =
      cancellations.find((c) => c.refundedAt) ??
      cancellations.find((c) => c.decidedAt);
    events.push({
      at: trigger?.refundedAt ?? trigger?.decidedAt ?? `${order.date}T00:00:00Z`,
      icon: Ban,
      tone: "red",
      title: "Order marked Cancelled",
    });
  } else if (order.status === "cancelled_cof") {
    const trigger = cancellations.find((c) => c.outcome === "cof");
    events.push({
      at: trigger?.refundedAt ?? `${order.date}T00:00:00Z`,
      icon: Ban,
      tone: "violet",
      title: "Order marked Cancelled (COF)",
    });
  }

  return events.sort((a, b) => a.at.localeCompare(b.at));
}

export function OrderHistory({
  order,
  cancellations,
  credits,
}: {
  order: Order;
  cancellations: Cancellation[];
  credits: CreditOnFile[];
}) {
  const events = buildEvents(order, cancellations, credits);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order history</CardTitle>
        <CardDescription>
          Chronological timeline of every step recorded against this order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground">No events yet.</div>
        ) : (
          <ol className="relative space-y-5 pl-7">
            <span
              className="absolute left-3 top-1 bottom-1 w-px bg-border"
              aria-hidden
            />
            {events.map((e, i) => {
              const Icon = e.icon ?? Circle;
              return (
                <li key={i} className="relative">
                  <span
                    className={`absolute -left-7 top-0 h-6 w-6 rounded-full grid place-items-center ring-4 ring-background ${TONE_BG[e.tone]}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="text-sm">
                    <div className="font-medium">{e.title}</div>
                    {e.detail && (
                      <div className="text-muted-foreground mt-0.5">
                        {e.detail}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span className="tabular-nums">{formatStamp(e.at)}</span>
                      {e.actor && <span>· {e.actor}</span>}
                      {e.reference && (
                        <code className="font-mono text-[11px]">
                          {e.reference}
                        </code>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
