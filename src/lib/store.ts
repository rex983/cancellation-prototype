import { createClient } from "@supabase/supabase-js";
import type {
  Cancellation,
  CreditOnFile,
  Order,
  OrderStatus,
} from "./types";
import { SEED_ORDERS, SEED_CANCELLATIONS } from "./seed";

const TABLE = "prototype_cancel_state";
const ROW_ID = "main";

type State = {
  orders: Order[];
  cancellations: Cancellation[];
  credits: CreditOnFile[];
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

function seedState(): State {
  return {
    orders: SEED_ORDERS.map((o) => ({ ...o })),
    cancellations: SEED_CANCELLATIONS.map((c) => ({ ...c })),
    credits: [],
  };
}

async function readState(): Promise<State> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("state")
    .eq("id", ROW_ID)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const seed = seedState();
    await writeState(seed);
    return seed;
  }
  const state = data.state as Partial<State>;
  // Backfill schema additions onto rows that were seeded before the field
  // existed (Stripe fields, credits[], etc.) without dropping live data.
  const seedById = new Map(SEED_ORDERS.map((o) => [o.id, o]));
  const enrichedOrders = (state.orders ?? []).map((o) => {
    if (o.stripePayments !== undefined) return o;
    const seed = seedById.get(o.id);
    if (!seed) return o;
    return {
      ...o,
      stripeCustomerId: seed.stripeCustomerId,
      stripePayments: seed.stripePayments,
    };
  });
  return {
    orders: enrichedOrders,
    cancellations: state.cancellations ?? [],
    credits: state.credits ?? [],
  };
}

async function writeState(state: State): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ id: ROW_ID, state, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function listOrders(): Promise<Order[]> {
  const state = await readState();
  return [...state.orders].sort((a, b) =>
    b.orderNumber.localeCompare(a.orderNumber),
  );
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const state = await readState();
  return state.orders.find((o) => o.id === id);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<void> {
  const state = await readState();
  await writeState({
    ...state,
    orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
  });
}

export async function listCancellations(): Promise<Cancellation[]> {
  const state = await readState();
  return [...state.cancellations].sort((a, b) =>
    b.requestedAt.localeCompare(a.requestedAt),
  );
}

export async function getCancellation(
  id: string,
): Promise<Cancellation | undefined> {
  const state = await readState();
  return state.cancellations.find((c) => c.id === id);
}

export async function getCancellationForOrder(
  orderId: string,
): Promise<Cancellation | undefined> {
  const state = await readState();
  return state.cancellations.find(
    (c) => c.orderId === orderId && c.status !== "denied",
  );
}

export async function createCancellation(
  c: Cancellation,
): Promise<Cancellation> {
  const state = await readState();
  await writeState({ ...state, cancellations: [...state.cancellations, c] });
  return c;
}

export async function updateCancellation(
  id: string,
  patch: Partial<Cancellation>,
): Promise<Cancellation | undefined> {
  const state = await readState();
  const target = state.cancellations.find((c) => c.id === id);
  if (!target) return undefined;
  const updated = { ...target, ...patch };
  await writeState({
    ...state,
    cancellations: state.cancellations.map((c) => (c.id === id ? updated : c)),
  });
  return updated;
}

export async function resetStore(): Promise<void> {
  await writeState(seedState());
}

export async function listCredits(): Promise<CreditOnFile[]> {
  const state = await readState();
  return [...state.credits].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function getCredit(id: string): Promise<CreditOnFile | undefined> {
  const state = await readState();
  return state.credits.find((c) => c.id === id);
}

export async function createCredit(c: CreditOnFile): Promise<CreditOnFile> {
  const state = await readState();
  await writeState({ ...state, credits: [...state.credits, c] });
  return c;
}
