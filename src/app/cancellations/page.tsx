import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CancellationList } from "@/components/cancellation-list";
import { listCancellations, listOrders } from "@/lib/store";

export default function CancellationsPage() {
  const all = listCancellations();
  const orders = new Map(listOrders().map((o) => [o.id, o]));

  const preStm = all.filter((c) => c.type === "pre_stm");
  const postStm = all.filter((c) => c.type === "post_stm");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cancellation Review Queue</h1>
        <p className="text-muted-foreground mt-1">
          All requested cancellations. Approve to mark the order cancelled, or deny to
          return it to its prior state.
        </p>
      </div>
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
          <TabsTrigger value="pre">Pre-STM ({preStm.length})</TabsTrigger>
          <TabsTrigger value="post">Post-STM ({postStm.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <CancellationList
            cancellations={all}
            orders={orders}
            empty="No cancellation requests yet."
          />
        </TabsContent>
        <TabsContent value="pre" className="mt-4">
          <CancellationList
            cancellations={preStm}
            orders={orders}
            empty="No pre-STM cancellation requests yet."
          />
        </TabsContent>
        <TabsContent value="post" className="mt-4">
          <CancellationList
            cancellations={postStm}
            orders={orders}
            empty="No post-STM cancellation requests yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
