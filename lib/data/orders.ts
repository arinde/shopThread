import type { SupabaseClient } from "@supabase/supabase-js";
import type { Order, OrderItem } from "@/lib/supabase/types";

export async function listOrdersForStore(
  supabase: SupabaseClient,
  storeId: string
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Order[];
}

export async function getOrderWithItems(
  supabase: SupabaseClient,
  orderId: string
): Promise<{ order: Order; items: OrderItem[] } | null> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) throw orderError;
  if (!order) return null;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) throw itemsError;

  return { order: order as Order, items: items as OrderItem[] };
}
