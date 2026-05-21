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
import { markFormReturned } from "@/app/actions";

type Props = {
  cancellationId: string;
  trigger: React.ReactNode;
};

export function FormReturnedDialog({ cancellationId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("id", cancellationId);
    startTransition(async () => {
      try {
        await markFormReturned(formData);
        toast.success("Marked as returned — moved to review");
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark cancellation form returned</DialogTitle>
          <DialogDescription>
            Confirms the customer has signed and returned the Formstack
            cancellation request. This moves the request to BST review for the
            refund-vs-COF decision.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="formReturnedBy">Your name</Label>
            <Input
              id="formReturnedBy"
              name="formReturnedBy"
              placeholder="BST member confirming receipt"
              required
            />
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Mark Returned"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
