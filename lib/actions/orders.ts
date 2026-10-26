"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const statusSchema = z.enum(["new", "confirmed", "paid", "dispatched", "delivered", "cancelled"]);

export async function updateOrderStatus(orderId: string, status: string) {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) {
    throw new Error("Invalid order status");
  }

  const supabase = await createClient();
  // RLS (`store owner updates own orders`) ensures this only affects orders
  // belonging to the signed-in vendor's store.
  const { error } = await supabase.from("orders").update({ status: parsed.data }).eq("id", orderId);
  if (error) throw error;

  revalidatePath("/dashboard");
}
