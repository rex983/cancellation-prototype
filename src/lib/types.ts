export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "awaiting_signature"
  | "signed"
  | "sfs"
  | "stm"
  | "delivered"
  | "cancelled"
  | "cancelled_cof";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "overpaid";

export type MfgStatus = "acknowledged" | "awaiting_reply" | "has_kickback";

export type CancellationType = "pre_stm" | "post_stm" | "window_72h";

export type RefundMethod =
  | "stripe"
  | "check"
  | "wire"
  | "ach"
  | "card_terminal"
  | "other";

export type CancellationStatus =
  | "awaiting_customer"
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
  // Post-STM email-flow tracking
  formSentAt?: string;
  formReturnedAt?: string;
  formReturnedBy?: string;
  outcome?: "refund" | "cof";
  cofId?: string;
};

export type CreditOnFile = {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  notes: string;
  createdAt: string;
  createdBy: string;
  cancellationId: string;
  status: "active" | "applied" | "expired";
};

export const FORMSTACK_CANCELLATION_URL =
  "https://bigbuildingsdirect.formstack.com/forms/big_buildings_direct";

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
  "Manufacturer denial",
  "Permit denial",
  "Customer change of heart",
  "Other",
];

export const WINDOW_72H_REASONS = [
  "72 hour cancellation",
  "No contract signed",
];
