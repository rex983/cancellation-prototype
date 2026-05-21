import { CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate, type BadgeTone } from "@/lib/format";
import type { Order, StripePaymentStatus } from "@/lib/types";

const STRIPE_STATUS_TONE: Record<StripePaymentStatus, BadgeTone> = {
  succeeded: "green",
  pending: "amber",
  failed: "red",
  refunded: "violet",
};

const STRIPE_STATUS_LABEL: Record<StripePaymentStatus, string> = {
  succeeded: "SUCCEEDED",
  pending: "PENDING",
  failed: "FAILED",
  refunded: "REFUNDED",
};

export function OrderStripeCard({ order }: { order: Order }) {
  const payments = order.stripePayments ?? [];
  const total = payments
    .filter((p) => p.status === "succeeded" || p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Stripe payments
            </CardTitle>
            <CardDescription>
              {order.stripeCustomerId ? (
                <>
                  Customer{" "}
                  <code className="rounded bg-muted/60 px-1.5 py-0.5 text-[11px] font-mono">
                    {order.stripeCustomerId}
                  </code>
                </>
              ) : (
                "No Stripe customer on file"
              )}
            </CardDescription>
          </div>
          <div className="text-right text-sm">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Captured
            </div>
            <div className="font-semibold tabular-nums">
              {formatCurrency(total)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="rounded-md border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            No Stripe payments recorded for this order.
          </div>
        ) : (
          <ul className="divide-y divide-border/60 text-sm">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium tabular-nums">
                      {formatCurrency(p.amount)}
                    </span>
                    <StatusBadge tone={STRIPE_STATUS_TONE[p.status]}>
                      {STRIPE_STATUS_LABEL[p.status]}
                    </StatusBadge>
                    {p.description && (
                      <span className="text-xs text-muted-foreground">
                        · {p.description}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground font-mono">
                    <span>
                      <span className="opacity-60">PaymentIntent:</span> {p.id}
                    </span>
                    {p.chargeId && (
                      <span>
                        <span className="opacity-60">Charge:</span> {p.chargeId}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {formatDate(p.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
