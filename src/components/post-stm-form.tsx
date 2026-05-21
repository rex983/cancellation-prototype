"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { sendCancellationForm } from "@/app/actions";
import { FORMSTACK_CANCELLATION_URL } from "@/lib/types";
import type { Order } from "@/lib/types";

function buildMailto(order: Order): string {
  const subject = `Cancellation request form — Order #${order.orderNumber}`;
  const body = [
    `Hi ${order.customerName.split(" ")[0] ?? "there"},`,
    "",
    "We received your request to cancel your order. To process it we need you to fill out and submit our cancellation request form:",
    "",
    FORMSTACK_CANCELLATION_URL,
    "",
    `Reference: Order #${order.orderNumber}`,
    "",
    "Once we receive the signed form back, our team will review and follow up with next steps.",
    "",
    "Thank you,",
    "Big Buildings Direct — Customer Service",
  ].join("\n");
  return `mailto:${encodeURIComponent(order.customerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function PostStmForm({ order }: { order: Order }) {
  const [requestedBy, setRequestedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    if (!requestedBy.trim()) {
      toast.error("Enter your name first");
      return;
    }
    const mailto = buildMailto(order);
    window.open(mailto, "_blank");
    const formData = new FormData();
    formData.set("orderId", order.id);
    formData.set("requestedBy", requestedBy);
    formData.set("notes", notes);
    startTransition(async () => {
      try {
        await sendCancellationForm(formData);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Submission failed");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post-STM Cancellation (BST)</CardTitle>
        <CardDescription>
          Order is with the manufacturer. Send the customer the Formstack
          cancellation request form. Once they sign and return it, the request
          moves to review for refund-vs-COF decision.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requestedBy">BST Member Name</Label>
            <Input
              id="requestedBy"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              placeholder="e.g. Jordan Pace"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Internal notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Why is the customer cancelling? Any conversation history, mfg reference numbers, etc."
            />
          </div>
          <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
            <div className="font-medium text-foreground">Form link sent</div>
            <code className="block font-mono break-all">
              {FORMSTACK_CANCELLATION_URL}
            </code>
            <div className="text-muted-foreground">
              To: <span className="font-mono">{order.customerEmail}</span>
            </div>
          </div>
          <Button onClick={handleSend} disabled={isPending}>
            <Mail className="mr-2 h-4 w-4" />
            {isPending ? "Submitting..." : "Send Cancellation Request Form"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
