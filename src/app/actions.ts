"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCancellation,
  getCancellationForOrder,
  getOrder,
  listCancellations,
  updateCancellation,
  updateOrderStatus,
} from "@/lib/store";
import {
  PRE_STM_STATUSES,
  POST_STM_STATUSES,
  type CancellationType,
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
  const manufacturerFee = Number(formData.get("manufacturerFee") ?? 0);
  const restockingFee = Number(formData.get("restockingFee") ?? 0);

  const role = await getRole();
  if (type === "pre_stm" && !canRequestPre(role)) {
    throw new Error("Your role can't submit a pre-STM cancellation");
  }
  if (type === "post_stm" && !canRequestPost(role)) {
    throw new Error("Your role can't submit a post-STM cancellation");
  }

  const order = getOrder(orderId);
  if (!order) throw new Error("Order not found");
  if (getCancellationForOrder(orderId)) {
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

  let refundAmount = order.depositPaid;
  if (type === "post_stm") {
    refundAmount = Math.max(
      0,
      order.depositPaid - (manufacturerFee || 0) - (restockingFee || 0),
    );
  }

  const id = makeId("cnc");
  createCancellation({
    id,
    orderId,
    type,
    status: "pending_review",
    reason,
    notes,
    requestedBy: requestedBy || (type === "pre_stm" ? "Sales Rep" : "BST Member"),
    requestedAt: new Date().toISOString(),
    refundAmount,
    manufacturerFee: type === "post_stm" ? manufacturerFee : undefined,
    restockingFee: type === "post_stm" ? restockingFee : undefined,
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

  const cancellations = listCancellations();
  const target = cancellations.find((c) => c.id === id);
  if (!target) throw new Error("Cancellation not found");

  if (decision === "approve") {
    updateCancellation(id, {
      status: "approved",
      decidedAt: new Date().toISOString(),
      decidedBy,
      decisionNotes,
    });
    updateOrderStatus(target.orderId, "cancelled");
  } else if (decision === "deny") {
    updateCancellation(id, {
      status: "denied",
      decidedAt: new Date().toISOString(),
      decidedBy,
      decisionNotes,
    });
  } else if (decision === "complete") {
    updateCancellation(id, {
      status: "completed",
      decisionNotes: decisionNotes || target.decisionNotes,
    });
  }

  revalidatePath("/cancellations");
  revalidatePath("/sales");
  revalidatePath("/bst");
}
