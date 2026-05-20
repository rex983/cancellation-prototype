import type {
  OrderStatus,
  PaymentStatus,
  MfgStatus,
  CancellationStatus,
  CancellationType,
} from "./types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
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

export function formatShortDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export type BadgeTone =
  | "green"
  | "blue"
  | "amber"
  | "red"
  | "violet"
  | "muted";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  draft: "Draft",
  pending_payment: "Pending Payment",
  awaiting_signature: "Awaiting Signature",
  signed: "Signed",
  sfs: "SFS",
  stm: "STM",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_SHORT: Record<OrderStatus, string> = {
  draft: "DRAFT",
  pending_payment: "PEND",
  awaiting_signature: "AWS",
  signed: "SIGNED",
  sfs: "SFS",
  stm: "STM",
  delivered: "DLVRD",
  cancelled: "CXLD",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  draft: "muted",
  pending_payment: "amber",
  awaiting_signature: "amber",
  signed: "green",
  sfs: "blue",
  stm: "green",
  delivered: "violet",
  cancelled: "red",
};

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  unpaid: "UNPAID",
  partial: "PARTIAL",
  paid: "PAID",
  overpaid: "OVERPAID",
};

export const PAYMENT_TONE: Record<PaymentStatus, BadgeTone> = {
  unpaid: "muted",
  partial: "amber",
  paid: "green",
  overpaid: "blue",
};

export const MFG_LABEL: Record<MfgStatus, string> = {
  acknowledged: "ACKNOWLEDGED",
  awaiting_reply: "AWAITING REPLY",
  has_kickback: "HAS KICKBACK",
};

export const MFG_TONE: Record<MfgStatus, BadgeTone> = {
  acknowledged: "green",
  awaiting_reply: "amber",
  has_kickback: "red",
};

export const CANCEL_STATUS_LABEL: Record<CancellationStatus, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  denied: "Denied",
  completed: "Completed",
};

export const CANCEL_STATUS_TONE: Record<CancellationStatus, BadgeTone> = {
  pending_review: "amber",
  approved: "green",
  denied: "red",
  completed: "violet",
};

export const CANCEL_TYPE_LABEL: Record<CancellationType, string> = {
  pre_stm: "Pre-STM (Sales)",
  post_stm: "Post-STM (BST)",
};
