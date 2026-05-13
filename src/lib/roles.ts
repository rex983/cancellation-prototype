export type Role = "admin" | "manager" | "sales" | "bst";

export const ROLES: Role[] = ["admin", "manager", "sales", "bst"];

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  sales: "Sales Rep",
  bst: "BST",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  admin: "Full access — every queue and every action.",
  manager: "Reviews and decides cancellation requests across both flows.",
  sales: "Requests pre-STM cancellations on their own orders.",
  bst: "Requests post-STM cancellations.",
};

export const ROLE_COOKIE = "bbd_role";
export const DEFAULT_ROLE: Role = "admin";

export function canSeeSales(role: Role): boolean {
  return role === "admin" || role === "manager" || role === "sales";
}

export function canSeeBst(role: Role): boolean {
  return role === "admin" || role === "manager" || role === "bst";
}

export function canRequestPre(role: Role): boolean {
  return role === "admin" || role === "sales";
}

export function canRequestPost(role: Role): boolean {
  return role === "admin" || role === "bst";
}

export function canReview(role: Role): boolean {
  return role === "admin" || role === "manager";
}
