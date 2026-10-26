"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

/** Browser-side Supabase client. Subject to RLS as the signed-in user (or anon). */
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
