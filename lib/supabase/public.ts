import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Anon-key client with no cookie/session handling. Safe to call from inside
 * `"use cache"` functions (which can't read `cookies()`/`headers()`). RLS
 * still applies, scoped to the `public can read ...` policies.
 */
export function createPublicClient() {
  return createSupabaseClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false },
  });
}
