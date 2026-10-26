import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "./env";

/**
 * Service-role Supabase client. Bypasses RLS entirely.
 * Only use for: order creation (server-validated pricing), the public order
 * status page, and payment webhooks. Never import this into client code.
 */
export function createAdminClient() {
  return createSupabaseClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { persistSession: false },
  });
}
