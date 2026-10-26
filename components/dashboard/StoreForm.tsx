"use client";

import { useActionState } from "react";
import { createStore, type StoreFormState } from "@/lib/actions/store";
import type { Store } from "@/lib/supabase/types";

const initialState: StoreFormState = { status: "idle" };

export function StoreForm({ store }: { store: Store | null }) {
  const [state, formAction, pending] = useActionState(createStore, initialState);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Store name
        <input
          name="name"
          required
          defaultValue={store?.name}
          placeholder="Amaka Styles"
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Store link
        <div className="flex items-center gap-1 text-sm text-zinc-500">
          <span>shopthread.app/</span>
          <input
            name="slug"
            required
            defaultValue={store?.slug}
            placeholder="amaka-styles"
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        WhatsApp number
        <input
          name="whatsapp"
          required
          defaultValue={store?.whatsapp}
          placeholder="0803 000 0000"
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Delivery fee (₦, flat — leave 0 if you quote delivery separately)
        <input
          name="deliveryFeeNaira"
          type="number"
          min="0"
          step="0.01"
          defaultValue={store ? store.delivery_fee_kobo / 100 : 0}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Bank details (shown to customers for transfer payments)</legend>
        <input
          name="bankName"
          placeholder="Bank name"
          defaultValue={store?.bank_details?.bank_name ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="bankAccountName"
          placeholder="Account name"
          defaultValue={store?.bank_details?.account_name ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="bankAccountNumber"
          placeholder="Account number"
          defaultValue={store?.bank_details?.account_number ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </fieldset>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Brand color
        <input
          name="brandColor"
          type="color"
          defaultValue={store?.brand_color ?? "#111111"}
          className="h-10 w-16 rounded-md border border-zinc-300 dark:border-zinc-700"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "Saving…" : store ? "Save changes" : "Create store"}
      </button>

      {state.status !== "idle" && (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-green-700 dark:text-green-500"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
