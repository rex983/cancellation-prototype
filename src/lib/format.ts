import type { OrderStatus, CancellationStatus, CancellationType } from "./types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  deposit_pending: "Deposit Pending",
  deposit_paid: "Deposit Paid",
  engineering: "Engineering",
  sent_to_manufacturer: "Sent to Manufacturer",
  in_production: "In Production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_VARIANT: Record<
  OrderStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  deposit_pending: "outline",
  deposit_paid: "secondary",
  engineering: "secondary",
  sent_to_manufacturer: "default",
  in_production: "default",
  shipped: "default",
  delivered: "secondary",
  cancelled: "destructive",
};

export const CANCEL_STATUS_LABEL: Record<CancellationStatus, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  denied: "Denied",
  completed: "Completed",
};

export const CANCEL_STATUS_VARIANT: Record<
  CancellationStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending_review: "outline",
  approved: "default",
  denied: "destructive",
  completed: "secondary",
};

export const CANCEL_TYPE_LABEL: Record<CancellationType, string> = {
  pre_stm: "Pre-STM (Sales)",
  post_stm: "Post-STM (BST)",
};
