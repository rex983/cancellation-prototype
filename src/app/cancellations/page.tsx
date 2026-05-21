import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CancellationList } from "@/components/cancellation-list";
import { AccessDenied } from "@/components/access-denied";
import { listCancellations, listOrders } from "@/lib/store";
import { canReview } from "@/lib/roles";
import { getRole } from "@/lib/roles.server";

export default async function CancellationsPage() {
  const role = await getRole();
  if (!canReview(role)) return <AccessDenied role={role} />;

  const all = listCancellations();
  const orders = new Map(listOrders().map((o) => [o.id, o]));

  const preStm = all.filter((c) => c.type === "pre_stm");
  const postStm = all.filter((c) => c.type === "post_stm");
  const window72h = all.filter((c) => c.type === "window_72h");

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cancellation Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approve to mark the order cancelled, or deny to return it to its prior state.
        </p>
      </div>
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
          <TabsTrigger value="pre">Pre-STM ({preStm.length})</TabsTrigger>
          <TabsTrigger value="post">Post-STM ({postStm.length})</TabsTrigger>
          <TabsTrigger value="window">72-Hour ({window72h.length})</TabsTrigger>
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
        <TabsContent value="window" className="mt-4">
          <CancellationList
            cancellations={window72h}
            orders={orders}
            empty="No 72-hour cancellation requests yet."
            canDecide
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
