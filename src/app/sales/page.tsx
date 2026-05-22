import { OrderTable } from "@/components/order-table";
import { AccessDenied } from "@/components/access-denied";
import { StatusTabs, type StatusTab } from "@/components/status-tabs";
import { SearchBar } from "@/components/search-bar";
import { listOrders } from "@/lib/store";
import { PRE_STM_STATUSES, type OrderStatus } from "@/lib/types";
import { canSeeSales } from "@/lib/roles";
import { getRole } from "@/lib/roles.server";

function matches(o: { orderNumber: string; customerName: string; customerEmail: string; salesRep: string; manufacturer: string }, q: string): boolean {
  const needle = q.toLowerCase();
  return [o.orderNumber, o.customerName, o.customerEmail, o.salesRep, o.manufacturer]
    .some((v) => v.toLowerCase().includes(needle));
}

const PRE_TABS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All Pre-STM" },
  { key: "draft", label: "Drafts" },
  { key: "pending_payment", label: "Pending payment" },
  { key: "awaiting_signature", label: "Awaiting signature" },
  { key: "signed", label: "Signed" },
  { key: "sfs", label: "SFS" },
];

export default async function SalesPage(props: PageProps<"/sales">) {
  const role = await getRole();
  if (!canSeeSales(role)) return <AccessDenied role={role} />;

  const sp = await props.searchParams;
  const filter = (Array.isArray(sp.status) ? sp.status[0] : sp.status) ?? "all";
  const q = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim();

  const allPre = (await listOrders()).filter((o) =>
    PRE_STM_STATUSES.includes(o.status),
  );
  const byStatus =
    filter === "all" ? allPre : allPre.filter((o) => o.status === filter);
  const filtered = q ? byStatus.filter((o) => matches(o, q)) : byStatus;

  const tabs: StatusTab[] = PRE_TABS.map((t) => ({
    label: t.label,
    count:
      t.key === "all"
        ? allPre.length
        : allPre.filter((o) => o.status === t.key).length,
    href: t.key === "all" ? "/sales" : `/sales?status=${t.key}`,
    active: filter === t.key,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pre-STM Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Showing {filtered.length} of {allPre.length} orders eligible for sales-led
          cancellation
        </p>
      </div>
      <SearchBar placeholder="Search order #, customer, sales rep, manufacturer..." />
      <StatusTabs tabs={tabs} />
      <OrderTable
        orders={filtered}
        hrefFor={(id) => `/orders/${id}?flow=pre`}
        empty="No orders match this filter."
      />
    </div>
  );
}
