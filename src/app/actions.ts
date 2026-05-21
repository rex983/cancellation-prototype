"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCancellation,
  getCancellation,
  getCancellationForOrder,
  getOrder,
  updateCancellation,
  updateOrderStatus,
} from "@/lib/store";
import {
  PRE_STM_STATUSES,
  POST_STM_STATUSES,
  type CancellationType,
  type RefundMethod,
} from "@/lib/types";
import {
  ROLES,
  ROLE_COOKIE,
  canRequestPost,
  canRequestPre,
  canReview,
  type Role,
} from "@/lib/roles";
import { getRole } from "@/lib/roles.server";

export async function setRole(role: Role) {
  if (!(ROLES as string[]).includes(role)) return;
  const store = await cookies();
  store.set(ROLE_COOKIE, role, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export async function submitCancellation(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const type = String(formData.get("type") ?? "") as CancellationType;
  const reason = String(formData.get("reason") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const requestedBy = String(formData.get("requestedBy") ?? "");

  const role = await getRole();
  if (type === "pre_stm" && !canRequestPre(role)) {
    throw new Error("Your role can't submit a pre-STM cancellation");
  }
  if (type === "post_stm" && !canRequestPost(role)) {
    throw new Error("Your role can't submit a post-STM cancellation");
  }
  if (type === "window_72h" && !canRequestPre(role)) {
    throw new Error("Only sales reps can submit a 72-hour cancellation");
  }

  const order = await getOrder(orderId);
  if (!order) throw new Error("Order not found");
  if (order.status === "cancelled") {
    throw new Error("Order is already cancelled");
  }
  if (await getCancellationForOrder(orderId)) {
    throw new Error("Active cancellation already exists for this order");
  }

  const isPre = PRE_STM_STATUSES.includes(order.status);
  const isPost = POST_STM_STATUSES.includes(order.status);

  if (type === "pre_stm" && !isPre) {
    throw new Error("Order is past STM — use BST flow");
  }
  if (type === "post_stm" && !isPost) {
    throw new Error("Order is not post-STM");
  }
  if (type === "window_72h" && !isPre) {
    throw new Error("72-hour cancellation only applies to pre-STM orders");
  }

  const id = makeId("cnc");
  await createCancellation({
    id,
    orderId,
    type,
    status: "pending_review",
    reason,
    notes,
    requestedBy: requestedBy || (type === "pre_stm" ? "Sales Rep" : "BST Member"),
    requestedAt: new Date().toISOString(),
    refundAmount: order.depositPaid,
  });

  revalidatePath("/sales");
  revalidatePath("/bst");
  revalidatePath("/cancellations");
  revalidatePath(`/orders/${orderId}`);
  redirect("/cancellations");
}

export async function decideCancellation(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const decisionNotes = String(formData.get("decisionNotes") ?? "");
  const decidedBy = String(formData.get("decidedBy") ?? "Reviewer");

  const role = await getRole();
  if (!canReview(role)) {
    throw new Error("Your role can't review cancellations");
  }

  const target = await getCancellation(id);
  if (!target) throw new Error("Cancellation not found");

  if (decision === "approve") {
    await updateCancellation(id, {
      status: "approved",
      decidedAt: new Date().toISOString(),
      decidedBy,
      decisionNotes,
    });
    await updateOrderStatus(target.orderId, "cancelled");
  } else if (decision === "deny") {
    await updateCancellation(id, {
      status: "denied",
      decidedAt: new Date().toISOString(),
      decidedBy,
      decisionNotes,
    });
  } else if (decision === "complete") {
    const refundMethodRaw = String(formData.get("refundMethod") ?? "");
    const refundReference = String(formData.get("refundReference") ?? "");
    const validMethods: RefundMethod[] = [
      "stripe",
      "check",
      "ach",
      "card_terminal",
      "other",
    ];
    const refundMethod = validMethods.includes(refundMethodRaw as RefundMethod)
      ? (refundMethodRaw as RefundMethod)
      : undefined;
    await updateCancellation(id, {
      status: "completed",
      decisionNotes: decisionNotes || target.decisionNotes,
      refundMethod: refundMethod ?? target.refundMethod,
      refundReference: refundReference || target.refundReference,
    });
  }

  revalidatePath("/cancellations");
  revalidatePath("/sales");
  revalidatePath("/bst");
}

export async function processStripeRefund(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const amount = Number(formData.get("amount"));
  const confirmAmount = Number(formData.get("confirmAmount"));
  const refundedBy = String(formData.get("refundedBy") ?? "");

  const role = await getRole();
  if (!canReview(role)) {
    throw new Error("Your role can't process refunds");
  }
  if (!refundedBy) {
    throw new Error("Reviewer name is required");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Refund amount must be greater than zero");
  }
  if (amount !== confirmAmount) {
    throw new Error("Amounts don't match — re-enter the confirmation amount");
  }

  const target = await getCancellation(id);
  if (!target) throw new Error("Cancellation not found");
  if (target.status === "completed") {
    throw new Error("Cancellation is already completed");
  }
  if (target.status === "denied") {
    throw new Error("Cancellation was denied — can't refund");
  }

  const order = await getOrder(target.orderId);
  if (!order) throw new Error("Order not found");
  const captured = (order.stripePayments ?? [])
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount, 0);
  if (amount > captured) {
    throw new Error(
      `Refund (${amount.toFixed(2)}) exceeds captured Stripe payments (${captured.toFixed(2)})`,
    );
  }

  const stripeRefundId = `re_3M${order.orderNumber}${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  const now = new Date().toISOString();

  const wasPending = target.status === "pending_review";
  await updateCancellation(id, {
    status: "completed",
    refundMethod: "stripe",
    refundReference: stripeRefundId,
    refundedAmount: amount,
    refundedAt: now,
    refundedBy,
    decidedAt: target.decidedAt ?? now,
    decidedBy: target.decidedBy ?? refundedBy,
    decisionNotes: target.decisionNotes,
  });
  if (wasPending) {
    await updateOrderStatus(target.orderId, "cancelled");
  }

  revalidatePath("/cancellations");
  revalidatePath("/sales");
  revalidatePath("/bst");
  revalidatePath(`/orders/${target.orderId}`);
}
