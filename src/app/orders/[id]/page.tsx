import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderSummary } from "@/components/order-summary";
import { OrderStripeCard } from "@/components/order-stripe-card";
import { PostStmForm } from "@/components/post-stm-form";
import { WindowForm } from "@/components/window-form";
import { RefundDialog } from "@/components/refund-dialog";
import { getCancellationForOrder, getOrder } from "@/lib/store";
import {
  PRE_STM_STATUSES,
  POST_STM_STATUSES,
} from "@/lib/types";
import {
  CANCEL_STATUS_LABEL,
  CANCEL_STATUS_TONE,
  CANCEL_TYPE_LABEL,
  REFUND_METHOD_LABEL,
  formatCurrency,
  formatDate,
} from "@/lib/format";
import {
  ROLE_LABEL,
  canRequestPost,
  canRequestPre,
  canReview,
} from "@/lib/roles";
import { getRole } from "@/lib/roles.server";

export default async function OrderPage(props: PageProps<"/orders/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const flow = (Array.isArray(sp.flow) ? sp.flow[0] : sp.flow) ?? "";

  const order = await getOrder(id);
  if (!order) notFound();

  const role = await getRole();
  const existing = await getCancellationForOrder(order.id);
  const isPre = PRE_STM_STATUSES.includes(order.status);
  const isPost = POST_STM_STATUSES.includes(order.status);
  const allowedPre = canRequestPre(role);
  const allowedPost = canRequestPost(role);
  const showPreFlow = isPre && allowedPre;
  const showPostForm = isPost && allowedPost;

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
      <OrderStripeCard order={order} />

      {existing ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Cancellation in progress</CardTitle>
                <CardDescription>
                  {CANCEL_TYPE_LABEL[existing.type]} &middot; requested{" "}
                  {formatDate(existing.requestedAt)} by {existing.requestedBy}
                </CardDescription>
              </div>
              <StatusBadge tone={CANCEL_STATUS_TONE[existing.status]}>
                {CANCEL_STATUS_LABEL[existing.status]}
              </StatusBadge>
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
              <span className="text-muted-foreground">Proposed refund: </span>
              <span className="font-medium">
                {formatCurrency(existing.refundAmount)}
              </span>
            </div>
            {existing.refundedAmount !== undefined && (
              <div>
                <span className="text-muted-foreground">Refunded: </span>
                <span className="font-medium">
                  {formatCurrency(existing.refundedAmount)}
                </span>
                {existing.refundMethod && (
                  <span className="text-muted-foreground">
                    {" "}
                    via {REFUND_METHOD_LABEL[existing.refundMethod]}
                  </span>
                )}
                {existing.refundReference && (
                  <>
                    {" "}
                    <code className="rounded bg-muted/60 px-1.5 py-0.5 text-[11px] font-mono">
                      {existing.refundReference}
                    </code>
                  </>
                )}
                {existing.refundedAt && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {formatDate(existing.refundedAt)}
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {canReview(role) && existing.status === "approved" && (
                <RefundDialog
                  cancellation={existing}
                  order={order}
                  trigger={<Button size="sm">Refund via Stripe</Button>}
                />
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/cancellations">View in review queue →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : order.status === "cancelled" ? (
        <Card>
          <CardHeader>
            <CardTitle>Order is cancelled</CardTitle>
            <CardDescription>No further action available.</CardDescription>
          </CardHeader>
        </Card>
      ) : showPreFlow ? (
        <WindowForm order={order} />
      ) : showPostForm ? (
        <PostStmForm order={order} />
      ) : isPre || isPost ? (
        <Card>
          <CardHeader>
            <CardTitle>Read-only view</CardTitle>
            <CardDescription>
              You&apos;re viewing as <strong>{ROLE_LABEL[role]}</strong>, which can&apos;t
              request a {isPre ? "pre-STM" : "post-STM"} cancellation. Switch roles via
              &ldquo;View as&rdquo; to submit.
            </CardDescription>
          </CardHeader>
        </Card>
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
