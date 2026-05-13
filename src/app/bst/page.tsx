import { OrderTable } from "@/components/order-table";
import { listOrders } from "@/lib/store";
import { POST_STM_STATUSES } from "@/lib/types";

export default function BstPage() {
  const orders = listOrders().filter((o) => POST_STM_STATUSES.includes(o.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">BST — Post-STM Cancellations</h1>
        <p className="text-muted-foreground mt-1">
          Orders already with the manufacturer. Cancellations may incur manufacturer
          fees and restocking — capture both before submitting.
        </p>
      </div>
      <OrderTable
        orders={orders}
        ctaLabel="Request Cancel"
        ctaHref={(id) => `/orders/${id}?flow=post`}
        empty="No post-STM orders available."
      />
    </div>
  );
}
