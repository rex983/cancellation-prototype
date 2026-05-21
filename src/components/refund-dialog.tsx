"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { processStripeRefund } from "@/app/actions";
import { formatCurrency } from "@/lib/format";
import type { Cancellation, Order } from "@/lib/types";

type Props = {
  cancellation: Cancellation;
  order: Order;
  trigger: React.ReactNode;
};

export function RefundDialog({ cancellation, order, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(cancellation.refundAmount.toFixed(2));
  const [confirmAmount, setConfirmAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  const successfulPayments = (order.stripePayments ?? []).filter(
    (p) => p.status === "succeeded",
  );
  const capturedTotal = successfulPayments.reduce((s, p) => s + p.amount, 0);

  const amountsMatch =
    amount.trim() !== "" &&
    confirmAmount.trim() !== "" &&
    Number(amount) === Number(confirmAmount);

  function handleSubmit(formData: FormData) {
    if (!amountsMatch) {
      toast.error("Amounts don't match");
      return;
    }
    formData.set("id", cancellation.id);
    startTransition(async () => {
      try {
        await processStripeRefund(formData);
        toast.success(`Refunded ${formatCurrency(Number(amount))}`);
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Refund failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Refund via Stripe</DialogTitle>
          <DialogDescription>
            Order #{order.orderNumber} · {order.customerName}. Type the refund
            amount twice to confirm.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order total</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(order.total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit paid</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(order.depositPaid)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2">
              <span className="text-muted-foreground">
                Captured on Stripe (refundable)
              </span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(capturedTotal)}
              </span>
            </div>
          </div>

          {successfulPayments.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Payments to refund against
              </div>
              <ul className="rounded-md border bg-card/40 divide-y divide-border/60 font-mono">
                {successfulPayments.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <span className="truncate">{p.id}</span>
                    <span className="tabular-nums">
                      {formatCurrency(p.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="refundedBy">Reviewer name</Label>
            <Input
              id="refundedBy"
              name="refundedBy"
              placeholder="Your name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Refund amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmAmount">Confirm amount</Label>
              <Input
                id="confirmAmount"
                name="confirmAmount"
                type="number"
                step="0.01"
                min="0"
                value={confirmAmount}
                onChange={(e) => setConfirmAmount(e.target.value)}
                required
              />
            </div>
          </div>
          {confirmAmount.trim() !== "" && !amountsMatch && (
            <p className="text-xs text-rose-500">
              Amounts don&apos;t match.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !amountsMatch}>
              {isPending
                ? "Processing..."
                : `Refund ${amount ? formatCurrency(Number(amount)) : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
