import type { SupabaseClient } from "@supabase/supabase-js";
import type { Store } from "@/lib/supabase/types";

export async function getStoreForOwner(
  supabase: SupabaseClient,
  ownerId: string
): Promise<Store | null> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw error;
  return data as Store | null;
}

export async function getStoreBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Store | null> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data as Store | null;
}
