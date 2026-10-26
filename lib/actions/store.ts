"use server";

import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toE164Nigeria } from "@/lib/phone";

const storeSchema = z.object({
  name: z.string().trim().min(2, "Store name is too short").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Use only lowercase letters, numbers, and hyphens")
    .min(3)
    .max(40),
  whatsapp: z.string().trim().min(7, "Enter a valid WhatsApp number"),
  deliveryFeeNaira: z.coerce.number().nonnegative().optional().or(z.literal("")),
  bankName: z.string().trim().max(80).optional().or(z.literal("")),
  bankAccountName: z.string().trim().max(80).optional().or(z.literal("")),
  bankAccountNumber: z.string().trim().max(20).optional().or(z.literal("")),
  brandColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #111111")
    .optional()
    .or(z.literal("")),
});

export type StoreFormState = {
  status: "idle" | "error" | "success";
  message?: string;
};

async function upsertStore(
  _prevState: StoreFormState,
  formData: FormData
): Promise<StoreFormState> {
  const parsed = storeSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    whatsapp: formData.get("whatsapp"),
    deliveryFeeNaira: formData.get("deliveryFeeNaira"),
    bankName: formData.get("bankName"),
    bankAccountName: formData.get("bankAccountName"),
    bankAccountNumber: formData.get("bankAccountNumber"),
    brandColor: formData.get("brandColor"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "You must be signed in." };
  }

  const { data: existing } = await supabase
    .from("stores")
    .select("id, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  const payload = {
    owner_id: user.id,
    name: parsed.data.name,
    slug: parsed.data.slug,
    whatsapp: toE164Nigeria(parsed.data.whatsapp),
    delivery_fee_kobo: Math.round(Number(parsed.data.deliveryFeeNaira || 0) * 100),
    bank_details:
      parsed.data.bankName && parsed.data.bankAccountName && parsed.data.bankAccountNumber
        ? {
            bank_name: parsed.data.bankName,
            account_name: parsed.data.bankAccountName,
            account_number: parsed.data.bankAccountNumber,
          }
        : null,
    brand_color: parsed.data.brandColor || "#111111",
  };

  const { error } = existing
    ? await supabase.from("stores").update(payload).eq("id", existing.id)
    : await supabase.from("stores").insert(payload);

  if (error) {
    const message = error.code === "23505" ? "That store link is already taken." : error.message;
    return { status: "error", message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidateTag(`store-slug:${parsed.data.slug}`, "max");
  if (existing?.slug && existing.slug !== parsed.data.slug) {
    revalidateTag(`store-slug:${existing.slug}`, "max");
  }
  return { status: "success", message: "Store saved." };
}

export const createStore = upsertStore;
export const updateStore = upsertStore;
