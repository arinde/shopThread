"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/pricing";
import { createOrder } from "@/lib/actions/checkout";

export function CheckoutForm({ storeSlug, deliveryFeeKobo }: { storeSlug: string; deliveryFeeKobo: number }) {
  const { lines, subtotalKobo } = useCart();
  const router = useRouter();
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const deliveryKobo = fulfilment === "delivery" ? deliveryFeeKobo : 0;
  const totalKobo = subtotalKobo + deliveryKobo;
  const cartEmpty = lines.length === 0;

  useEffect(() => {
    // Only bounce back when the cart is empty and we're not mid-submit —
    // createOrder's redirect briefly leaves stale closure state here too,
    // but isPending stays true until the new route takes over.
    if (cartEmpty && !isPending) {
      router.replace(`/${storeSlug}`);
    }
  }, [cartEmpty, isPending, router, storeSlug]);

  if (cartEmpty) {
    return null;
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    // createOrder() redirects on success, so this cart is left as-is; the
    // customer lands on the order page and won't need it again this session.
    startTransition(async () => {
      try {
        await createOrder({
          storeSlug,
          customerName: String(formData.get("customerName") ?? ""),
          customerPhone: String(formData.get("customerPhone") ?? ""),
          fulfilment,
          address: String(formData.get("address") ?? ""),
          note: String(formData.get("note") ?? ""),
          deliveryKobo,
          lines: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty })),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Your name
        <input
          name="customerName"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        WhatsApp / phone number
        <input
          name="customerPhone"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <fieldset className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="fulfilmentChoice"
            checked={fulfilment === "delivery"}
            onChange={() => setFulfilment("delivery")}
          />
          Delivery
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="fulfilmentChoice"
            checked={fulfilment === "pickup"}
            onChange={() => setFulfilment("pickup")}
          />
          Pickup
        </label>
      </fieldset>

      {fulfilment === "delivery" && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          Delivery address
          <textarea
            name="address"
            rows={2}
            required
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Note (optional)
        <textarea
          name="note"
          rows={2}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <div className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatNaira(subtotalKobo)}</span>
        </div>
        {fulfilment === "delivery" && (
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{formatNaira(deliveryKobo)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between border-t border-zinc-200 pt-1 font-semibold dark:border-zinc-800">
          <span>Total</span>
          <span>{formatNaira(totalKobo)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {isPending ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}
