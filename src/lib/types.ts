export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "awaiting_signature"
  | "signed"
  | "sfs"
  | "stm"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "overpaid";

export type MfgStatus = "acknowledged" | "awaiting_reply" | "has_kickback";

export type CancellationType = "pre_stm" | "post_stm" | "window_72h";

export type RefundMethod = "stripe" | "check" | "ach" | "card_terminal" | "other";

export type CancellationStatus =
  | "pending_review"
  | "approved"
  | "denied"
  | "completed";

export type Manufacturer =
  | "Safeguard"
  | "Best Choice"
  | "Eagle"
  | "TBS"
  | "American Steel"
  | "SBS";

export type StripePaymentStatus = "succeeded" | "pending" | "failed" | "refunded";

export type StripePayment = {
  id: string;
  chargeId?: string;
  amount: number;
  status: StripePaymentStatus;
  createdAt: string;
  description?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  salesRep: string;
  manufacturer: Manufacturer;
  total: number;
  payment: PaymentStatus;
  co?: number;
  ro?: number;
  status: OrderStatus;
  mfgStatus?: MfgStatus;
  depositPaid: number;
  stripeCustomerId?: string;
  stripePayments?: StripePayment[];
};

export type Cancellation = {
  id: string;
  orderId: string;
  type: CancellationType;
  status: CancellationStatus;
  reason: string;
  notes: string;
  requestedBy: string;
  requestedAt: string;
  refundAmount: number;
  decidedAt?: string;
  decidedBy?: string;
  decisionNotes?: string;
  refundMethod?: RefundMethod;
  refundReference?: string;
  refundedAmount?: number;
  refundedAt?: string;
  refundedBy?: string;
};

// Pre-STM = anything before "Sent to Manufacturer" — sales-rep territory.
// Post-STM = STM — BST territory.
export const PRE_STM_STATUSES: OrderStatus[] = [
  "draft",
  "pending_payment",
  "awaiting_signature",
  "signed",
  "sfs",
];

export const POST_STM_STATUSES: OrderStatus[] = ["stm"];

export const POST_STM_REASONS = [
  "Customer cancellation request",
  "Manufacturing delay / customer unwilling to wait",
  "Site issue (unbuildable / access problem)",
  "Engineering / spec change required",
  "Customer financial hardship",
  "Damaged in transit (re-order needed)",
  "Manufacturer unable to fulfill",
  "Other",
];

export const WINDOW_72H_REASONS = [
  "72 hour cancellation",
  "No contract signed",
];
