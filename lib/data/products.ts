import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product, ProductVariant } from "@/lib/supabase/types";

export async function listProductsForStore(
  supabase: SupabaseClient,
  storeId: string
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Product[];
}

export async function listActiveProductsForStore(
  supabase: SupabaseClient,
  storeId: string
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Product[];
}

export async function getProductWithVariants(
  supabase: SupabaseClient,
  productId: string
): Promise<{ product: Product; variants: ProductVariant[] } | null> {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (productError) throw productError;
  if (!product) return null;

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId);

  if (variantsError) throw variantsError;

  return { product: product as Product, variants: variants as ProductVariant[] };
}
