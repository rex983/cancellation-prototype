import Link from "next/link";
import { ArrowRight, Ban, FileText, Truck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listCancellations, listOrders } from "@/lib/store";
import { PRE_STM_STATUSES, POST_STM_STATUSES } from "@/lib/types";
import {
  ROLE_LABEL,
  canReview,
  canSeeBst,
  canSeeSales,
} from "@/lib/roles";
import { getRole } from "@/lib/roles.server";

export default async function Home() {
  const role = await getRole();
  const orders = listOrders();
  const cancellations = listCancellations();

  const preCount = orders.filter((o) => PRE_STM_STATUSES.includes(o.status)).length;
  const postCount = orders.filter((o) => POST_STM_STATUSES.includes(o.status)).length;
  const pendingReview = cancellations.filter((c) => c.status === "pending_review").length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Order cancellation workflow · viewing as <strong>{ROLE_LABEL[role]}</strong>.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {canSeeSales(role) && (
          <DashCard
            href="/sales"
            icon={<FileText className="h-4 w-4" />}
            title="Pre-STM Orders"
            description="Cancellations handled by sales reps before the order reaches the manufacturer."
            count={preCount}
            countLabel="eligible orders"
          />
        )}
        {canSeeBst(role) && (
          <DashCard
            href="/bst"
            icon={<Truck className="h-4 w-4" />}
            title="Post-STM Orders"
            description="BST-handled cancellations once the order is with the manufacturer."
            count={postCount}
            countLabel="eligible orders"
          />
        )}
        {canReview(role) && (
          <DashCard
            href="/cancellations"
            icon={<Ban className="h-4 w-4" />}
            title="Cancellation Review"
            description="Approve, deny, or close out cancellation requests."
            count={pendingReview}
            countLabel="awaiting review"
          />
        )}
      </section>

      <section className="rounded-lg border bg-card/40 p-6">
        <h2 className="text-sm font-semibold mb-3">How it works</h2>
        <ol className="list-decimal pl-6 space-y-1.5 text-sm text-muted-foreground">
          <li>Sales rep or BST member opens an order from their queue.</li>
          <li>They submit a cancellation request with a reason and notes.</li>
          <li>Manager or admin approves / denies in the review queue.</li>
          <li>Approved requests mark the order cancelled and lock in the refund.</li>
        </ol>
      </section>
    </div>
  );
}

function DashCard({
  href,
  icon,
  title,
  description,
  count,
  countLabel,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  countLabel: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full bg-card/40 hover:border-[var(--brand)]/60 transition">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              {icon}
              <span>{title}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--brand)] transition" />
          </div>
          <CardTitle className="text-3xl font-bold tabular-nums mt-2">
            {count}
          </CardTitle>
          <CardDescription className="text-xs">{countLabel}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {description}
        </CardContent>
      </Card>
    </Link>
  );
}
