import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listCancellations, listOrders } from "@/lib/store";
import { PRE_STM_STATUSES, POST_STM_STATUSES } from "@/lib/types";

export default function Home() {
  const orders = listOrders();
  const cancellations = listCancellations();

  const preCount = orders.filter((o) => PRE_STM_STATUSES.includes(o.status)).length;
  const postCount = orders.filter((o) => POST_STM_STATUSES.includes(o.status)).length;
  const pendingReview = cancellations.filter((c) => c.status === "pending_review").length;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Order Cancellation Workflow</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Prototype for the two cancellation paths at Big Buildings Direct. Sales reps
          handle cancellations <em>before</em> an order is Sent To Manufacturer (STM). The
          BST team handles cancellations <em>after</em> STM, where manufacturer fees and
          restocking apply.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/sales">
          <Card className="h-full hover:border-primary transition">
            <CardHeader>
              <CardTitle>Sales — Pre-STM</CardTitle>
              <CardDescription>
                Cancel orders that have not yet been sent to the manufacturer. Full
                deposit refund.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{preCount}</div>
              <div className="text-sm text-muted-foreground">eligible orders</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/bst">
          <Card className="h-full hover:border-primary transition">
            <CardHeader>
              <CardTitle>BST — Post-STM</CardTitle>
              <CardDescription>
                Cancel orders already with manufacturer. Subject to manufacturer cancellation
                fees and restocking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{postCount}</div>
              <div className="text-sm text-muted-foreground">eligible orders</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/cancellations">
          <Card className="h-full hover:border-primary transition">
            <CardHeader>
              <CardTitle>Review Queue</CardTitle>
              <CardDescription>
                All cancellation requests across both flows. Approve, deny, or mark complete.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{pendingReview}</div>
              <div className="text-sm text-muted-foreground">awaiting review</div>
            </CardContent>
          </Card>
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">How it works</h2>
        <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
          <li>A sales rep or BST member opens an order from the appropriate queue.</li>
          <li>
            They submit a cancellation request with a reason and notes. Post-STM
            requests also capture manufacturer fees and restocking.
          </li>
          <li>
            The request lands in the review queue. A manager approves or denies it.
          </li>
          <li>
            Approved requests mark the order as <strong>cancelled</strong> and lock in
            the refund amount.
          </li>
        </ol>
      </section>
    </div>
  );
}
