"use server";

import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStoreForOwner } from "@/lib/data/store";

const variantSchema = z.object({
  label: z.string().trim().min(1),
  priceKobo: z.number().int().nonnegative().nullable(),
  stock: z.number().int().nonnegative().nullable(),
});

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  priceNaira: z.coerce.number().positive(),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  stock: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

function parseVariantsFromForm(formData: FormData) {
  const labels = formData.getAll("variantLabel") as string[];
  const prices = formData.getAll("variantPrice") as string[];
  const stocks = formData.getAll("variantStock") as string[];

  const variants: z.infer<typeof variantSchema>[] = [];
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i]?.trim();
    if (!label) continue;
    const priceNaira = prices[i]?.trim();
    const stock = stocks[i]?.trim();
    variants.push(
      variantSchema.parse({
        label,
        priceKobo: priceNaira ? Math.round(Number.parseFloat(priceNaira) * 100) : null,
        stock: stock ? Number.parseInt(stock, 10) : null,
      })
    );
  }
  return variants;
}

async function requireStore() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const store = await getStoreForOwner(supabase, user.id);
  if (!store) throw new Error("Create your store first");

  return { supabase, store };
}

export async function createProduct(formData: FormData) {
  const { supabase, store } = await requireStore();

  const parsed = productSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    priceNaira: formData.get("priceNaira"),
    imageUrl: formData.get("imageUrl"),
    category: formData.get("category"),
    stock: formData.get("stock"),
    featured: formData.get("featured") === "on",
    active: formData.get("active") !== "off",
  });

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      store_id: store.id,
      name: parsed.name,
      description: parsed.description || null,
      price_kobo: Math.round(parsed.priceNaira * 100),
      images: parsed.imageUrl ? [parsed.imageUrl] : [],
      category: parsed.category || null,
      stock: parsed.stock === "" || parsed.stock === undefined ? null : parsed.stock,
      featured: parsed.featured ?? false,
      active: parsed.active ?? true,
    })
    .select("id")
    .single();

  if (error) throw error;

  const variants = parseVariantsFromForm(formData);
  if (variants.length > 0) {
    const { error: variantsError } = await supabase.from("product_variants").insert(
      variants.map((v) => ({
        product_id: product.id,
        label: v.label,
        price_kobo: v.priceKobo,
        stock: v.stock,
      }))
    );
    if (variantsError) throw variantsError;
  }

  revalidatePath("/dashboard/products");
  revalidateTag(`store-products:${store.id}`, "max");
  redirect("/dashboard/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const { supabase, store } = await requireStore();

  const parsed = productSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    priceNaira: formData.get("priceNaira"),
    imageUrl: formData.get("imageUrl"),
    category: formData.get("category"),
    stock: formData.get("stock"),
    featured: formData.get("featured") === "on",
    active: formData.get("active") !== "off",
  });

  // RLS ("store owner full access" on products) ensures this only ever
  // touches a product belonging to the signed-in vendor's own store.
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.name,
      description: parsed.description || null,
      price_kobo: Math.round(parsed.priceNaira * 100),
      images: parsed.imageUrl ? [parsed.imageUrl] : [],
      category: parsed.category || null,
      stock: parsed.stock === "" || parsed.stock === undefined ? null : parsed.stock,
      featured: parsed.featured ?? false,
      active: parsed.active ?? true,
    })
    .eq("id", productId);

  if (error) throw error;

  const { error: deleteError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw deleteError;

  const variants = parseVariantsFromForm(formData);
  if (variants.length > 0) {
    const { error: variantsError } = await supabase.from("product_variants").insert(
      variants.map((v) => ({
        product_id: productId,
        label: v.label,
        price_kobo: v.priceKobo,
        stock: v.stock,
      }))
    );
    if (variantsError) throw variantsError;
  }

  revalidatePath("/dashboard/products");
  revalidateTag(`store-products:${store.id}`, "max");
  revalidateTag(`product:${productId}`, "max");
  redirect("/dashboard/products");
}

export async function deleteProduct(productId: string) {
  const { supabase, store } = await requireStore();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
  revalidatePath("/dashboard/products");
  revalidateTag(`store-products:${store.id}`, "max");
  revalidateTag(`product:${productId}`, "max");
}

export async function bulkImportProducts(
  items: { name: string; priceKobo: number }[]
): Promise<{ created: number }> {
  const { supabase, store } = await requireStore();

  const { error } = await supabase.from("products").insert(
    items.map((item) => ({
      store_id: store.id,
      name: item.name,
      price_kobo: item.priceKobo,
    }))
  );

  if (error) throw error;

  revalidatePath("/dashboard/products");
  revalidateTag(`store-products:${store.id}`, "max");
  return { created: items.length };
}
