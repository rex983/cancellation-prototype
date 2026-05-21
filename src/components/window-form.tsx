"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { submitCancellation } from "@/app/actions";
import { WINDOW_72H_REASONS } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import type { Order } from "@/lib/types";

export function WindowForm({ order }: { order: Order }) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (!reason) {
      toast.error("Please choose a reason");
      return;
    }
    formData.set("reason", reason);
    formData.set("type", "window_72h");
    formData.set("orderId", order.id);
    startTransition(async () => {
      try {
        await submitCancellation(formData);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Submission failed");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>72-Hour Cancellation Request</CardTitle>
        <CardDescription>
          Sales rep flow for pre-STM orders. Submits to the 72-hour queue for
          manager approval and refund processing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requestedBy">Sales Rep Name</Label>
            <Input
              id="requestedBy"
              name="requestedBy"
              defaultValue={order.salesRep}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Choose a reason..." />
              </SelectTrigger>
              <SelectContent>
                {WINDOW_72H_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Any context for the manager reviewing the refund..."
            />
          </div>
          <div className="rounded-md border bg-muted/40 p-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order total</span>
              <span className="font-medium">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit paid</span>
              <span className="font-medium">
                {formatCurrency(order.depositPaid)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2 mt-2">
              <span className="text-muted-foreground">Refund to customer</span>
              <span className="font-semibold">
                {formatCurrency(order.depositPaid)}
              </span>
            </div>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit 72-Hour Cancellation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
