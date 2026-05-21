"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCancellation,
  createCredit,
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

export async function sendCancellationForm(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const requestedBy = String(formData.get("requestedBy") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const role = await getRole();
  if (!canRequestPost(role)) {
    throw new Error("Only BST can send the cancellation request form");
  }
  if (!requestedBy.trim()) {
    throw new Error("BST member name is required");
  }

  const order = await getOrder(orderId);
  if (!order) throw new Error("Order not found");
  if (order.status === "cancelled" || order.status === "cancelled_cof") {
    throw new Error("Order is already cancelled");
  }
  if (!POST_STM_STATUSES.includes(order.status)) {
    throw new Error("Order is not post-STM");
  }
  if (await getCancellationForOrder(orderId)) {
    throw new Error("Active cancellation already exists for this order");
  }

  const id = makeId("cnc");
  const now = new Date().toISOString();
  await createCancellation({
    id,
    orderId,
    type: "post_stm",
    status: "awaiting_customer",
    reason: "Customer cancellation request",
    notes,
    requestedBy,
    requestedAt: now,
    refundAmount: order.depositPaid,
    formSentAt: now,
  });

  revalidatePath("/bst");
  revalidatePath("/cancellations");
  revalidatePath(`/orders/${orderId}`);
  redirect("/cancellations");
}

export async function markFormReturned(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const formReturnedBy = String(formData.get("formReturnedBy") ?? "");

  const role = await getRole();
  if (!canRequestPost(role) && !canReview(role)) {
    throw new Error("Your role can't mark forms returned");
  }
  if (!formReturnedBy.trim()) {
    throw new Error("Your name is required");
  }

  const target = await getCancellation(id);
  if (!target) throw new Error("Cancellation not found");
  if (target.status !== "awaiting_customer") {
    throw new Error("This cancellation isn't awaiting a customer signature");
  }

  await updateCancellation(id, {
    status: "pending_review",
    formReturnedAt: new Date().toISOString(),
    formReturnedBy,
  });

  revalidatePath("/cancellations");
  revalidatePath(`/orders/${target.orderId}`);
}

export async function convertToCOF(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const amount = Number(formData.get("amount"));
  const confirmAmount = Number(formData.get("confirmAmount"));
  const createdBy = String(formData.get("createdBy") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const role = await getRole();
  if (!canReview(role)) {
    throw new Error("Your role can't convert to Credit on File");
  }
  if (!createdBy.trim()) {
    throw new Error("Reviewer name is required");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Credit amount must be greater than zero");
  }
  if (amount !== confirmAmount) {
    throw new Error("Amounts don't match — re-enter the confirmation amount");
  }

  const target = await getCancellation(id);
  if (!target) throw new Error("Cancellation not found");
  if (target.status === "completed" || target.status === "denied") {
    throw new Error("Cancellation is already closed");
  }

  const order = await getOrder(target.orderId);
  if (!order) throw new Error("Order not found");

  const now = new Date().toISOString();
  const cofId = makeId("cof");
  await createCredit({
    id: cofId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    amount,
    notes,
    createdAt: now,
    createdBy,
    cancellationId: target.id,
    status: "active",
  });
  await updateCancellation(id, {
    status: "completed",
    outcome: "cof",
    cofId,
    decidedAt: target.decidedAt ?? now,
    decidedBy: target.decidedBy ?? createdBy,
    refundedAmount: amount,
    refundedAt: now,
    refundedBy: createdBy,
    decisionNotes: notes || target.decisionNotes,
  });
  await updateOrderStatus(order.id, "cancelled_cof");

  revalidatePath("/cancellations");
  revalidatePath("/cof");
  revalidatePath("/bst");
  revalidatePath(`/orders/${order.id}`);
}

export async function processRefund(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const amount = Number(formData.get("amount"));
  const confirmAmount = Number(formData.get("confirmAmount"));
  const refundedBy = String(formData.get("refundedBy") ?? "");
  const refundMethodRaw = String(formData.get("refundMethod") ?? "stripe");
  const refundReferenceInput = String(
    formData.get("refundReference") ?? "",
  ).trim();

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

  const validMethods: RefundMethod[] = [
    "stripe",
    "check",
    "wire",
    "ach",
    "card_terminal",
    "other",
  ];
  if (!validMethods.includes(refundMethodRaw as RefundMethod)) {
    throw new Error("Invalid refund method");
  }
  const refundMethod = refundMethodRaw as RefundMethod;
  if (refundMethod !== "stripe" && !refundReferenceInput) {
    throw new Error("Reference is required for non-Stripe refunds");
  }

  const target = await getCancellation(id);
  if (!target) throw new Error("Cancellation not found");
  if (target.status === "completed") {
    throw new Error("Cancellation is already completed");
  }
  if (target.status === "denied") {
    throw new Error("Cancellation was denied — can't refund");
  }
  if (target.status === "awaiting_customer") {
    throw new Error(
      "Customer hasn't returned the signed form yet — mark it returned first",
    );
  }

  const order = await getOrder(target.orderId);
  if (!order) throw new Error("Order not found");

  if (refundMethod === "stripe") {
    const captured = (order.stripePayments ?? [])
      .filter((p) => p.status === "succeeded")
      .reduce((sum, p) => sum + p.amount, 0);
    if (amount > captured) {
      throw new Error(
        `Refund (${amount.toFixed(2)}) exceeds captured Stripe payments (${captured.toFixed(2)})`,
      );
    }
  }

  const refundReference =
    refundMethod === "stripe"
      ? refundReferenceInput ||
        `re_3M${order.orderNumber}${Math.random().toString(36).slice(2, 10)}`
      : refundReferenceInput;
  const now = new Date().toISOString();

  const needsOrderCancel = target.status !== "approved" || order.status !== "cancelled";
  await updateCancellation(id, {
    status: "completed",
    outcome: "refund",
    refundMethod,
    refundReference,
    refundedAmount: amount,
    refundedAt: now,
    refundedBy,
    decidedAt: target.decidedAt ?? now,
    decidedBy: target.decidedBy ?? refundedBy,
    decisionNotes: target.decisionNotes,
  });
  if (needsOrderCancel) {
    await updateOrderStatus(target.orderId, "cancelled");
  }

  revalidatePath("/cancellations");
  revalidatePath("/sales");
  revalidatePath("/bst");
  revalidatePath(`/orders/${target.orderId}`);
}
