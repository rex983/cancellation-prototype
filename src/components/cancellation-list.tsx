import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DecisionDialog } from "@/components/decision-dialog";
import {
  CANCEL_STATUS_LABEL,
  CANCEL_STATUS_VARIANT,
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

export function CancellationList({ cancellations, orders, empty, canDecide = false }: Props) {
  if (cancellations.length === 0) {
    return (
      <div className="rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
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
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">
                    <Link
                      href={`/orders/${order.id}`}
                      className="hover:underline"
                    >
                      {order.orderNumber}
                    </Link>{" "}
                    <span className="text-muted-foreground font-normal">
                      — {order.customerName}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {order.width}×{order.length}×{order.height} {order.manufacturer} &middot;{" "}
                    Requested {formatDate(c.requestedAt)} by {c.requestedBy}
                  </CardDescription>
                </div>
                <Badge variant={CANCEL_STATUS_VARIANT[c.status]}>
                  {CANCEL_STATUS_LABEL[c.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Reason" value={c.reason} />
                <Field
                  label="Refund"
                  value={formatCurrency(c.refundAmount)}
                />
                {c.type === "post_stm" && (
                  <Field
                    label="Mfr fee / Restock"
                    value={`${formatCurrency(c.manufacturerFee ?? 0)} / ${formatCurrency(c.restockingFee ?? 0)}`}
                  />
                )}
              </div>
              {c.notes && (
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Notes
                  </div>
                  <div>{c.notes}</div>
                </div>
              )}
              {c.decisionNotes && (
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
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
              {canDecide && c.status === "pending_review" && (
                <div className="flex gap-2 pt-2">
                  <DecisionDialog
                    cancellationId={c.id}
                    decision="approve"
                    trigger={<Button size="sm">Approve</Button>}
                  />
                  <DecisionDialog
                    cancellationId={c.id}
                    decision="deny"
                    trigger={
                      <Button size="sm" variant="outline">
                        Deny
                      </Button>
                    }
                  />
                </div>
              )}
              {canDecide && c.status === "approved" && (
                <div className="flex gap-2 pt-2">
                  <DecisionDialog
                    cancellationId={c.id}
                    decision="complete"
                    trigger={
                      <Button size="sm" variant="secondary">
                        Mark Complete
                      </Button>
                    }
                  />
                </div>
              )}
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
      <div className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
