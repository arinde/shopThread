import { NextResponse } from "next/server";

/**
 * Stub for a Nigerian payment gateway webhook (v0.2, see plan.md).
 * Once a gateway is chosen: verify the request signature against
 * PAYMENT_WEBHOOK_SECRET, look up the order by its payment reference, and
 * set status to "paid" via the admin Supabase client.
 */
export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
