import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem, Store } from "@/lib/supabase/types";

/**
 * Looks up an order by its (unguessable) id for the public order-status page.
 * Uses the service-role client because orders/order_items have no public RLS
 * policy — the UUID itself is the only "credential" here, by design.
 */
export async function getPublicOrder(
  orderId: string
): Promise<{ order: Order; items: OrderItem[]; store: Store } | null> {
  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order) return null;

  const [{ data: items, error: itemsError }, { data: store, error: storeError }] = await Promise.all([
    admin.from("order_items").select("*").eq("order_id", orderId),
    admin.from("stores").select("*").eq("id", order.store_id).maybeSingle(),
  ]);
  if (itemsError) throw itemsError;
  if (storeError) throw storeError;
  if (!store) return null;

  return { order: order as Order, items: (items ?? []) as OrderItem[], store: store as Store };
}
