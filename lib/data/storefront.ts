import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Product, ProductVariant, Store } from "@/lib/supabase/types";

export async function getStoreBySlugCached(slug: string): Promise<Store | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`store-slug:${slug}`);

  const supabase = createPublicClient();
  const { data, error } = await supabase.from("stores").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as Store | null;
}

export async function getActiveProductsCached(storeId: string): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`store-products:${storeId}`);

  const supabase = createPublicClient();
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

export async function getActiveProductCached(
  productId: string
): Promise<{ product: Product; variants: ProductVariant[] } | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`product:${productId}`);

  const supabase = createPublicClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();
  if (productError) throw productError;
  if (!product) return null;

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId);
  if (variantsError) throw variantsError;

  return { product: product as Product, variants: (variants ?? []) as ProductVariant[] };
}
