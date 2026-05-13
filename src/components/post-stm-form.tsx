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
import { POST_STM_REASONS } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import type { Order } from "@/lib/types";

export function PostStmForm({ order }: { order: Order }) {
  const [reason, setReason] = useState("");
  const [mfrFee, setMfrFee] = useState(0);
  const [restockFee, setRestockFee] = useState(0);
  const [isPending, startTransition] = useTransition();

  const refund = Math.max(0, order.depositPaid - (mfrFee || 0) - (restockFee || 0));

  function handleSubmit(formData: FormData) {
    if (!reason) {
      toast.error("Please choose a reason");
      return;
    }
    formData.set("reason", reason);
    formData.set("type", "post_stm");
    formData.set("orderId", order.id);
    formData.set("manufacturerFee", String(mfrFee || 0));
    formData.set("restockingFee", String(restockFee || 0));
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
        <CardTitle>Request Cancellation (Post-STM)</CardTitle>
        <CardDescription>
          Order is already with the manufacturer. Capture manufacturer cancellation
          fee and any restocking before submitting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requestedBy">BST Member Name</Label>
            <Input
              id="requestedBy"
              name="requestedBy"
              placeholder="e.g. Jordan Pace"
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
                {POST_STM_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Include manufacturer reference numbers, conversations, etc."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mfrFee">Manufacturer Fee</Label>
              <Input
                id="mfrFee"
                type="number"
                inputMode="decimal"
                min={0}
                value={mfrFee || ""}
                onChange={(e) => setMfrFee(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restockFee">Restocking Fee</Label>
              <Input
                id="restockFee"
                type="number"
                inputMode="decimal"
                min={0}
                value={restockFee || ""}
                onChange={(e) => setRestockFee(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>
          <div className="rounded-md border bg-muted/40 p-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit paid</span>
              <span className="font-medium">{formatCurrency(order.depositPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Manufacturer fee</span>
              <span className="font-medium">-{formatCurrency(mfrFee || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Restocking fee</span>
              <span className="font-medium">-{formatCurrency(restockFee || 0)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-2">
              <span className="font-medium">Refund to customer</span>
              <span className="font-semibold">{formatCurrency(refund)}</span>
            </div>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Cancellation Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
