import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { RefundDialog } from "@/components/refund-dialog";
import { FormReturnedDialog } from "@/components/form-returned-dialog";
import { COFDialog } from "@/components/cof-dialog";
import {
  CANCEL_STATUS_LABEL,
  CANCEL_STATUS_TONE,
  CANCEL_TYPE_LABEL,
  REFUND_METHOD_LABEL,
  formatCurrency,
  formatDate,
} from "@/lib/format";
import type { Cancellation, Order } from "@/lib/types";

type Props = {
  cancellations: Cancellation[];
  orders: Map<string, Order>;
  empty: string;
  canDecide?: boolean;
};

export function CancellationList({
  cancellations,
  orders,
  empty,
  canDecide = false,
}: Props) {
  if (cancellations.length === 0) {
    return (
      <div className="rounded-md border bg-card/40 p-8 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {cancellations.map((c) => {
        const order = orders.get(c.orderId);
        if (!order) return null;
        return (
          <Card key={c.id} className="bg-card/40">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">
                    <Link
                      href={`/orders/${order.id}`}
                      className="hover:underline"
                    >
                      Order #{order.orderNumber}
                    </Link>{" "}
                    <span className="text-muted-foreground font-normal">
                      — {order.customerName}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {order.manufacturer} &middot; {formatCurrency(order.total)} &middot;{" "}
                    Requested {formatDate(c.requestedAt)} by {c.requestedBy}
                  </CardDescription>
                </div>
                <StatusBadge tone={CANCEL_STATUS_TONE[c.status]}>
                  {CANCEL_STATUS_LABEL[c.status]}
                </StatusBadge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Type" value={CANCEL_TYPE_LABEL[c.type]} />
                <Field label="Reason" value={c.reason} />
                <Field label="Refund" value={formatCurrency(c.refundAmount)} />
              </div>
              {c.refundMethod && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field
                    label="Refund method"
                    value={REFUND_METHOD_LABEL[c.refundMethod]}
                  />
                  {c.refundReference && (
                    <Field label="Reference" value={c.refundReference} />
                  )}
                </div>
              )}
              <div className="rounded-md border bg-muted/30 p-3 space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Stripe IDs
                </div>
                {order.stripeCustomerId ? (
                  <div className="flex items-baseline gap-2 text-xs">
                    <span className="text-muted-foreground w-20 shrink-0">
                      Customer
                    </span>
                    <code className="font-mono break-all">
                      {order.stripeCustomerId}
                    </code>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No Stripe customer on file
                  </div>
                )}
                {(order.stripePayments ?? []).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-baseline gap-2 text-xs"
                  >
                    <span className="text-muted-foreground w-20 shrink-0">
                      {p.description ?? "Payment"}
                    </span>
                    <code className="font-mono break-all">{p.id}</code>
                    {p.chargeId && (
                      <code className="font-mono break-all text-muted-foreground">
                        / {p.chargeId}
                      </code>
                    )}
                    <span className="ml-auto tabular-nums font-medium shrink-0">
                      {formatCurrency(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
              {c.notes && (
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Notes
                  </div>
                  <div>{c.notes}</div>
                </div>
              )}
              {c.decisionNotes && (
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Decision Notes
                  </div>
                  <div>{c.decisionNotes}</div>
                  {c.decidedBy && c.decidedAt && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {c.decidedBy} &middot; {formatDate(c.decidedAt)}
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {canDecide && c.status === "awaiting_customer" && (
                  <FormReturnedDialog
                    cancellationId={c.id}
                    trigger={<Button size="sm">Mark Form Returned</Button>}
                  />
                )}
                {canDecide &&
                  c.status !== "completed" &&
                  c.status !== "denied" &&
                  c.status !== "awaiting_customer" && (
                    <>
                      <RefundDialog
                        cancellation={c}
                        order={order}
                        trigger={<Button size="sm">Full Refund</Button>}
                      />
                      {c.type === "post_stm" && (
                        <COFDialog
                          cancellation={c}
                          order={order}
                          trigger={
                            <Button size="sm" variant="secondary">
                              Credit on File
                            </Button>
                          }
                        />
                      )}
                    </>
                  )}
                <Button asChild variant="ghost" size="sm" className="ml-auto">
                  <Link href={`/orders/${order.id}`}>
                    View order details
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
