import { OrderTable } from "@/components/order-table";
import { AccessDenied } from "@/components/access-denied";
import { StatusTabs, type StatusTab } from "@/components/status-tabs";
import { SearchBar } from "@/components/search-bar";
import { listOrders } from "@/lib/store";
import { POST_STM_STATUSES } from "@/lib/types";
import { canSeeBst } from "@/lib/roles";
import { getRole } from "@/lib/roles.server";

function matches(o: { orderNumber: string; customerName: string; customerEmail: string; salesRep: string; manufacturer: string }, q: string): boolean {
  const needle = q.toLowerCase();
  return [o.orderNumber, o.customerName, o.customerEmail, o.salesRep, o.manufacturer]
    .some((v) => v.toLowerCase().includes(needle));
}

export default async function BstPage(props: PageProps<"/bst">) {
  const role = await getRole();
  if (!canSeeBst(role)) return <AccessDenied role={role} />;

  const sp = await props.searchParams;
  const mfgFilter = Array.isArray(sp.mfg) ? sp.mfg[0] : sp.mfg;
  const q = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim();

  const allPost = (await listOrders()).filter((o) =>
    POST_STM_STATUSES.includes(o.status),
  );
  const byMfg = mfgFilter
    ? allPost.filter((o) => o.mfgStatus === mfgFilter)
    : allPost;
  const filtered = q ? byMfg.filter((o) => matches(o, q)) : byMfg;

  const counts = {
    all: allPost.length,
    acknowledged: allPost.filter((o) => o.mfgStatus === "acknowledged").length,
    awaiting_reply: allPost.filter((o) => o.mfgStatus === "awaiting_reply").length,
    has_kickback: allPost.filter((o) => o.mfgStatus === "has_kickback").length,
  };

  const tabs: StatusTab[] = [
    { label: "All mfg", count: counts.all, href: "/bst", active: !mfgFilter },
    {
      label: "Acknowledged",
      count: counts.acknowledged,
      href: "/bst?mfg=acknowledged",
      active: mfgFilter === "acknowledged",
    },
    {
      label: "Awaiting reply",
      count: counts.awaiting_reply,
      href: "/bst?mfg=awaiting_reply",
      active: mfgFilter === "awaiting_reply",
    },
    {
      label: "Has kickback",
      count: counts.has_kickback,
      href: "/bst?mfg=has_kickback",
      active: mfgFilter === "has_kickback",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Post-STM Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Showing {filtered.length} of {allPost.length} orders with the manufacturer
        </p>
      </div>
      <SearchBar placeholder="Search order #, customer, sales rep, manufacturer..." />
      <StatusTabs tabs={tabs} />
      <OrderTable
        orders={filtered}
        hrefFor={(id) => `/orders/${id}?flow=post`}
        empty="No orders match this filter."
      />
    </div>
  );
}
