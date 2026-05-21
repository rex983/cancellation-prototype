import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { CreditOnFile } from "@/lib/types";

type Props = {
  credits: CreditOnFile[];
};

export function CreditsList({ credits }: Props) {
  const active = credits.filter((c) => c.status === "active");
  const totalActive = active.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat label="Total credits" value={credits.length.toString()} />
        <Stat label="Active" value={active.length.toString()} />
        <Stat label="Active total" value={formatCurrency(totalActive)} />
      </div>

      {credits.length === 0 ? (
        <div className="rounded-md border bg-card/40 p-10 text-center text-sm text-muted-foreground">
          <Wallet className="h-6 w-6 mx-auto mb-3 opacity-50" />
          No credits on file yet. They&apos;ll appear here once a post-STM
          cancellation is converted to COF.
        </div>
      ) : (
        <div className="space-y-3">
          {credits.map((c) => (
            <Card key={c.id} className="bg-card/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">
                      {c.customerName}{" "}
                      <span className="text-muted-foreground font-normal">
                        — {c.customerEmail}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      From order{" "}
                      <Link
                        href={`/orders/${c.orderId}`}
                        className="hover:underline"
                      >
                        #{c.orderNumber}
                      </Link>{" "}
                      &middot; Created {formatDate(c.createdAt)} by {c.createdBy}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {c.status === "active"
                        ? "Available"
                        : c.status === "applied"
                          ? "Applied"
                          : "Expired"}
                    </div>
                    <div className="font-bold text-lg tabular-nums">
                      {formatCurrency(c.amount)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {c.notes && (
                <CardContent className="text-sm space-y-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Notes
                    </div>
                    <div>{c.notes}</div>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      href={`/orders/${c.orderId}`}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center"
                    >
                      View order details
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card/40 p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
