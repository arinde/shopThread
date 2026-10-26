"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceOrder } from "@/lib/pricing";

const cartLineSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid().nullable(),
  qty: z.number().int().positive(),
});

const checkoutSchema = z.object({
  storeSlug: z.string().min(1),
  customerName: z.string().trim().min(2, "Enter your name"),
  customerPhone: z.string().trim().min(7, "Enter a valid phone number"),
  fulfilment: z.enum(["delivery", "pickup"]),
  address: z.string().trim().optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  deliveryKobo: z.number().int().nonnegative(),
  lines: z.array(cartLineSchema).min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * Creates an order from the customer's cart. Prices are re-read from the
 * products/variants tables here — the client-submitted cart is never trusted
 * for pricing (see plan.md "Security").
 */
export async function createOrder(input: CheckoutInput) {
  const parsed = checkoutSchema.parse(input);
  const admin = createAdminClient();

  const { data: store, error: storeError } = await admin
    .from("stores")
    .select("id")
    .eq("slug", parsed.storeSlug)
    .maybeSingle();
  if (storeError) throw storeError;
  if (!store) throw new Error("Store not found");

  const productIds = [...new Set(parsed.lines.map((l) => l.productId))];
  const { data: products, error: productsError } = await admin
    .from("products")
    .select("id, name, price_kobo, active, store_id")
    .in("id", productIds);
  if (productsError) throw productsError;

  const variantIds = parsed.lines.map((l) => l.variantId).filter((id): id is string => !!id);
  const { data: variants, error: variantsError } =
    variantIds.length > 0
      ? await admin.from("product_variants").select("id, label, price_kobo, product_id").in("id", variantIds)
      : { data: [], error: null };
  if (variantsError) throw variantsError;

  const priceLines = parsed.lines.map((line) => {
    const product = products?.find((p) => p.id === line.productId);
    if (!product || !product.active || product.store_id !== store.id) {
      throw new Error("One of the items in your cart is no longer available.");
    }
    const variant = line.variantId ? variants?.find((v) => v.id === line.variantId) : null;
    const unitKobo = variant?.price_kobo ?? product.price_kobo;
    const name = variant ? `${product.name} (${variant.label})` : product.name;
    return { name, unitKobo, qty: line.qty, productId: line.productId, variantId: line.variantId };
  });

  const { subtotalKobo, deliveryKobo, totalKobo } = priceOrder({
    lines: priceLines,
    deliveryKobo: parsed.fulfilment === "delivery" ? parsed.deliveryKobo : 0,
  });

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      store_id: store.id,
      customer_name: parsed.customerName,
      customer_phone: parsed.customerPhone,
      fulfilment: parsed.fulfilment,
      address: parsed.fulfilment === "delivery" ? parsed.address || null : null,
      note: parsed.note || null,
      subtotal_kobo: subtotalKobo,
      delivery_kobo: deliveryKobo,
      total_kobo: totalKobo,
    })
    .select("id")
    .single();
  if (orderError) throw orderError;

  const { error: itemsError } = await admin.from("order_items").insert(
    priceLines.map((line) => ({
      order_id: order.id,
      product_id: line.productId,
      variant_id: line.variantId,
      name_snapshot: line.name,
      unit_kobo: line.unitKobo,
      qty: line.qty,
    }))
  );
  if (itemsError) throw itemsError;

  redirect(`/o/${order.id}`);
}
