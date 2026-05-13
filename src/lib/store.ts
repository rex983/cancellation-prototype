import type { Cancellation, Order, OrderStatus } from "./types";
import { SEED_ORDERS } from "./seed";

type StoreShape = {
  orders: Map<string, Order>;
  cancellations: Map<string, Cancellation>;
};

const globalForStore = globalThis as unknown as { __cancelStore?: StoreShape };

function init(): StoreShape {
  const orders = new Map<string, Order>();
  for (const o of SEED_ORDERS) orders.set(o.id, { ...o });
  return { orders, cancellations: new Map() };
}

const store: StoreShape = globalForStore.__cancelStore ?? init();
globalForStore.__cancelStore = store;

export function listOrders(): Order[] {
  return Array.from(store.orders.values()).sort((a, b) =>
    a.orderNumber.localeCompare(b.orderNumber),
  );
}

export function getOrder(id: string): Order | undefined {
  return store.orders.get(id);
}

export function updateOrderStatus(id: string, status: OrderStatus): void {
  const o = store.orders.get(id);
  if (!o) return;
  store.orders.set(id, { ...o, status });
}

export function listCancellations(): Cancellation[] {
  return Array.from(store.cancellations.values()).sort((a, b) =>
    b.requestedAt.localeCompare(a.requestedAt),
  );
}

export function getCancellation(id: string): Cancellation | undefined {
  return store.cancellations.get(id);
}

export function getCancellationForOrder(orderId: string): Cancellation | undefined {
  for (const c of store.cancellations.values()) {
    if (c.orderId === orderId && c.status !== "denied") return c;
  }
  return undefined;
}

export function createCancellation(c: Cancellation): Cancellation {
  store.cancellations.set(c.id, c);
  return c;
}

export function updateCancellation(
  id: string,
  patch: Partial<Cancellation>,
): Cancellation | undefined {
  const c = store.cancellations.get(id);
  if (!c) return undefined;
  const next = { ...c, ...patch };
  store.cancellations.set(id, next);
  return next;
}

export function resetStore(): void {
  globalForStore.__cancelStore = init();
}
