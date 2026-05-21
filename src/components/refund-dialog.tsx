"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { processRefund } from "@/app/actions";
import {
  REFUND_METHOD_LABEL,
  REFUND_REFERENCE_PLACEHOLDER,
  formatCurrency,
} from "@/lib/format";
import type { Cancellation, Order, RefundMethod } from "@/lib/types";

type Props = {
  cancellation: Cancellation;
  order: Order;
  trigger: React.ReactNode;
};

const METHODS: RefundMethod[] = [
  "stripe",
  "check",
  "wire",
  "ach",
  "card_terminal",
  "other",
];

export function RefundDialog({ cancellation, order, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<RefundMethod>("stripe");
  const [amount, setAmount] = useState(cancellation.refundAmount.toFixed(2));
  const [confirmAmount, setConfirmAmount] = useState("");
  const [reference, setReference] = useState("");
  const [isPending, startTransition] = useTransition();

  const successfulPayments = (order.stripePayments ?? []).filter(
    (p) => p.status === "succeeded",
  );
  const capturedTotal = successfulPayments.reduce((s, p) => s + p.amount, 0);

  const amountsMatch =
    amount.trim() !== "" &&
    confirmAmount.trim() !== "" &&
    Number(amount) === Number(confirmAmount);

  const referenceRequired = method !== "stripe";
  const referenceOk = !referenceRequired || reference.trim() !== "";
  const canSubmit = amountsMatch && referenceOk;

  function handleSubmit(formData: FormData) {
    if (!canSubmit) {
      toast.error(
        !amountsMatch ? "Amounts don't match" : "Reference is required",
      );
      return;
    }
    formData.set("id", cancellation.id);
    formData.set("refundMethod", method);
    startTransition(async () => {
      try {
        await processRefund(formData);
        toast.success(
          `Refunded ${formatCurrency(Number(amount))} via ${REFUND_METHOD_LABEL[method]}`,
        );
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
          <DialogTitle>Issue refund</DialogTitle>
          <DialogDescription>
            Order #{order.orderNumber} · {order.customerName}. Pick a method,
            then type the refund amount twice to confirm.
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

          <div className="space-y-2">
            <Label htmlFor="refundMethod">Refund method</Label>
            <Select
              value={method}
              onValueChange={(v) => setMethod(v as RefundMethod)}
            >
              <SelectTrigger id="refundMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {REFUND_METHOD_LABEL[m]}
                    {m === "stripe" && (
                      <span className="text-muted-foreground"> (default)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {method === "stripe" && successfulPayments.length > 0 && (
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
            <Label htmlFor="refundReference">
              Reference{" "}
              <span className="text-muted-foreground font-normal">
                {referenceRequired ? "(required)" : "(optional)"}
              </span>
            </Label>
            <Input
              id="refundReference"
              name="refundReference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={REFUND_REFERENCE_PLACEHOLDER[method]}
              required={referenceRequired}
            />
          </div>

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
            <Button type="submit" disabled={isPending || !canSubmit}>
              {isPending
                ? "Processing..."
                : `Refund ${amount ? formatCurrency(Number(amount)) : ""} via ${REFUND_METHOD_LABEL[method]}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
