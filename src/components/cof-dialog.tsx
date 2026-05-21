"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { convertToCOF } from "@/app/actions";
import { formatCurrency } from "@/lib/format";
import type { Cancellation, Order } from "@/lib/types";

type Props = {
  cancellation: Cancellation;
  order: Order;
  trigger: React.ReactNode;
};

export function COFDialog({ cancellation, order, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(order.depositPaid.toFixed(2));
  const [confirmAmount, setConfirmAmount] = useState("");
  const [isPending, startTransition] = useTransition();

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
        await convertToCOF(formData);
        toast.success(
          `Credit on File created for ${formatCurrency(Number(amount))}`,
        );
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Convert to Credit on File</DialogTitle>
          <DialogDescription>
            Instead of refunding to the customer&apos;s payment method, this
            keeps the funds on file as a credit they can apply to a future
            order. The order will be marked <strong>Cancelled (COF)</strong>.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order #</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="createdBy">Reviewer name</Label>
            <Input
              id="createdBy"
              name="createdBy"
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Why COF instead of refund? Anything BST should remember when the customer comes back…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Credit amount</Label>
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
            <p className="text-xs text-rose-500">Amounts don&apos;t match.</p>
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
                ? "Creating..."
                : `Create COF for ${amount ? formatCurrency(Number(amount)) : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
