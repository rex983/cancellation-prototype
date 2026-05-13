export type OrderStatus =
  | "deposit_pending"
  | "deposit_paid"
  | "engineering"
  | "sent_to_manufacturer"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled";

export type CancellationType = "pre_stm" | "post_stm";

export type CancellationStatus =
  | "pending_review"
  | "approved"
  | "denied"
  | "completed";

export type Manufacturer =
  | "ASC"
  | "PSB"
  | "QSB"
  | "Sunward"
  | "Renegade";

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  state: string;
  city: string;
  width: number;
  length: number;
  height: number;
  model: string;
  manufacturer: Manufacturer;
  manufacturerOrderNumber?: string;
  totalPrice: number;
  depositPaid: number;
  balanceDue: number;
  salesRep: string;
  region: string;
  status: OrderStatus;
  createdAt: string;
  stmDate?: string;
  scheduledDelivery?: string;
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
  manufacturerFee?: number;
  restockingFee?: number;
  decidedAt?: string;
  decidedBy?: string;
  decisionNotes?: string;
};

export const PRE_STM_STATUSES: OrderStatus[] = [
  "deposit_pending",
  "deposit_paid",
  "engineering",
];

export const POST_STM_STATUSES: OrderStatus[] = [
  "sent_to_manufacturer",
  "in_production",
  "shipped",
];

export const PRE_STM_REASONS = [
  "Customer changed mind",
  "Pricing concerns",
  "Found alternate provider",
  "Site not ready / permitting issue",
  "Financing fell through",
  "Customer non-responsive",
  "Duplicate order",
  "Other",
];

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
