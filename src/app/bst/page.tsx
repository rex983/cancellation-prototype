import { OrderTable } from "@/components/order-table";
import { AccessDenied } from "@/components/access-denied";
import { listOrders } from "@/lib/store";
import { POST_STM_STATUSES } from "@/lib/types";
import { canSeeBst } from "@/lib/roles";
import { getRole } from "@/lib/roles.server";

export default async function BstPage() {
  const role = await getRole();
  if (!canSeeBst(role)) return <AccessDenied role={role} />;

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
