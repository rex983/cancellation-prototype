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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { decideCancellation } from "@/app/actions";
import { REFUND_METHOD_LABEL } from "@/lib/format";
import type { RefundMethod } from "@/lib/types";

type Props = {
  cancellationId: string;
  decision: "approve" | "deny" | "complete";
  trigger: React.ReactNode;
};

const COPY = {
  approve: {
    title: "Approve cancellation",
    description: "This marks the order as cancelled and locks in the refund amount.",
    confirm: "Approve",
  },
  deny: {
    title: "Deny cancellation",
    description: "The order returns to its prior state. Document why for the requester.",
    confirm: "Deny",
  },
  complete: {
    title: "Mark complete",
    description: "Refund has been processed externally — close out this cancellation.",
    confirm: "Mark Complete",
  },
} as const;

export function DecisionDialog({ cancellationId, decision, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [refundMethod, setRefundMethod] = useState<RefundMethod | "">("");
  const [isPending, startTransition] = useTransition();
  const copy = COPY[decision];

  function handleSubmit(formData: FormData) {
    if (decision === "complete" && !refundMethod) {
      toast.error("Please select a refund method");
      return;
    }
    formData.set("id", cancellationId);
    formData.set("decision", decision);
    if (decision === "complete" && refundMethod) {
      formData.set("refundMethod", refundMethod);
    }
    startTransition(async () => {
      try {
        await decideCancellation(formData);
        toast.success(`${copy.confirm} done`);
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  const methods: RefundMethod[] = [
    "stripe",
    "check",
    "ach",
    "card_terminal",
    "other",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decidedBy">Reviewer name</Label>
            <Input id="decidedBy" name="decidedBy" placeholder="Your name" required />
          </div>
          {decision === "complete" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="refundMethod">Refund method</Label>
                <Select
                  value={refundMethod}
                  onValueChange={(v) => setRefundMethod(v as RefundMethod)}
                >
                  <SelectTrigger id="refundMethod">
                    <SelectValue placeholder="How was the refund issued?" />
                  </SelectTrigger>
                  <SelectContent>
                    {methods.map((m) => (
                      <SelectItem key={m} value={m}>
                        {REFUND_METHOD_LABEL[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refundReference">
                  Reference (optional)
                </Label>
                <Input
                  id="refundReference"
                  name="refundReference"
                  placeholder="Stripe refund ID, check #, etc."
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="decisionNotes">Notes (optional)</Label>
            <Textarea id="decisionNotes" name="decisionNotes" rows={3} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={decision === "deny" ? "destructive" : "default"}
              disabled={isPending}
            >
              {isPending ? "Working..." : copy.confirm}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
