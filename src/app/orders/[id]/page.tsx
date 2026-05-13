import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderSummary } from "@/components/order-summary";
import { PreStmForm } from "@/components/pre-stm-form";
import { PostStmForm } from "@/components/post-stm-form";
import { getCancellationForOrder, getOrder } from "@/lib/store";
import {
  PRE_STM_STATUSES,
  POST_STM_STATUSES,
} from "@/lib/types";
import {
  CANCEL_STATUS_LABEL,
  CANCEL_STATUS_VARIANT,
  CANCEL_TYPE_LABEL,
  formatCurrency,
  formatDate,
} from "@/lib/format";

export default async function OrderPage(props: PageProps<"/orders/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const flow = (Array.isArray(sp.flow) ? sp.flow[0] : sp.flow) ?? "";

  const order = getOrder(id);
  if (!order) notFound();

  const existing = getCancellationForOrder(order.id);
  const isPre = PRE_STM_STATUSES.includes(order.status);
  const isPost = POST_STM_STATUSES.includes(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={flow === "post" ? "/bst" : flow === "pre" ? "/sales" : "/"}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </Link>
      </div>
      <OrderSummary order={order} />

      {existing ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cancellation in progress</CardTitle>
                <CardDescription>
                  {CANCEL_TYPE_LABEL[existing.type]} &middot; requested{" "}
                  {formatDate(existing.requestedAt)} by {existing.requestedBy}
                </CardDescription>
              </div>
              <Badge variant={CANCEL_STATUS_VARIANT[existing.status]}>
                {CANCEL_STATUS_LABEL[existing.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Reason: </span>
              {existing.reason}
            </div>
            {existing.notes && (
              <div>
                <span className="text-muted-foreground">Notes: </span>
                {existing.notes}
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Refund: </span>
              <span className="font-medium">{formatCurrency(existing.refundAmount)}</span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/cancellations">View in review queue →</Link>
            </Button>
          </CardContent>
        </Card>
      ) : order.status === "cancelled" ? (
        <Card>
          <CardHeader>
            <CardTitle>Order is cancelled</CardTitle>
            <CardDescription>No further action available.</CardDescription>
          </CardHeader>
        </Card>
      ) : isPre ? (
        <PreStmForm order={order} />
      ) : isPost ? (
        <PostStmForm order={order} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Not eligible for cancellation</CardTitle>
            <CardDescription>
              This order is {order.status.replace(/_/g, " ")} — cancellation flow not
              available in this prototype.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
