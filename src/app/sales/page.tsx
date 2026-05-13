import { OrderTable } from "@/components/order-table";
import { AccessDenied } from "@/components/access-denied";
import { listOrders } from "@/lib/store";
import { PRE_STM_STATUSES } from "@/lib/types";
import { canSeeSales } from "@/lib/roles";
import { getRole } from "@/lib/roles.server";

export default async function SalesPage() {
  const role = await getRole();
  if (!canSeeSales(role)) return <AccessDenied role={role} />;

  const orders = listOrders().filter((o) => PRE_STM_STATUSES.includes(o.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales — Pre-STM Cancellations</h1>
        <p className="text-muted-foreground mt-1">
          Orders that haven&apos;t been sent to the manufacturer yet. Sales reps can
          request cancellations directly from here.
        </p>
      </div>
      <OrderTable
        orders={orders}
        ctaLabel="Request Cancel"
        ctaHref={(id) => `/orders/${id}?flow=pre`}
        empty="No pre-STM orders available."
      />
    </div>
  );
}
