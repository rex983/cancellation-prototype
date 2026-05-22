import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CancellationList } from "@/components/cancellation-list";
import { CreditsList } from "@/components/credits-list";
import { AccessDenied } from "@/components/access-denied";
import { SearchBar } from "@/components/search-bar";
import { listCancellations, listCredits, listOrders } from "@/lib/store";
import { canReview } from "@/lib/roles";
import { getRole } from "@/lib/roles.server";
import type { Cancellation, CreditOnFile, Order } from "@/lib/types";

function cancellationMatches(c: Cancellation, order: Order | undefined, q: string): boolean {
  const n = q.toLowerCase();
  const fields = [
    order?.orderNumber,
    order?.customerName,
    order?.customerEmail,
    c.reason,
    c.notes,
    c.requestedBy,
  ];
  return fields.some((v) => (v ?? "").toLowerCase().includes(n));
}

function creditMatches(c: CreditOnFile, q: string): boolean {
  const n = q.toLowerCase();
  return [c.orderNumber, c.customerName, c.customerEmail, c.notes, c.createdBy]
    .some((v) => (v ?? "").toLowerCase().includes(n));
}

export default async function CancellationsPage(
  props: PageProps<"/cancellations">,
) {
  const role = await getRole();
  if (!canReview(role)) return <AccessDenied role={role} />;

  const sp = await props.searchParams;
  const q = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim();

  const [rawAll, allOrders, rawCredits] = await Promise.all([
    listCancellations(),
    listOrders(),
    listCredits(),
  ]);
  const orders = new Map(allOrders.map((o) => [o.id, o]));
  const all = q
    ? rawAll.filter((c) => cancellationMatches(c, orders.get(c.orderId), q))
    : rawAll;
  const credits = q
    ? rawCredits.filter((c) => creditMatches(c, q))
    : rawCredits;

  const preStm = all.filter(
    (c) => c.type === "pre_stm" || c.type === "window_72h",
  );
  const postStm = all.filter((c) => c.type === "post_stm");

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cancellation Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approve to mark the order cancelled, or deny to return it to its prior state.
        </p>
      </div>
      <SearchBar placeholder="Search order #, customer, reason, notes..." />
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
          <TabsTrigger value="pre">Pre-STM ({preStm.length})</TabsTrigger>
          <TabsTrigger value="post">Post-STM ({postStm.length})</TabsTrigger>
          <TabsTrigger value="cof">Credit on File ({credits.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <CancellationList
            cancellations={all}
            orders={orders}
            empty="No cancellation requests yet."
            canDecide
          />
        </TabsContent>
        <TabsContent value="pre" className="mt-4">
          <CancellationList
            cancellations={preStm}
            orders={orders}
            empty="No pre-STM cancellation requests yet."
            canDecide
          />
        </TabsContent>
        <TabsContent value="post" className="mt-4">
          <CancellationList
            cancellations={postStm}
            orders={orders}
            empty="No post-STM cancellation requests yet."
            canDecide
          />
        </TabsContent>
        <TabsContent value="cof" className="mt-4">
          <CreditsList credits={credits} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
