"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/pricing";
import type { Product, ProductVariant } from "@/lib/supabase/types";

export function AddToCartForm({
  storeSlug,
  product,
  variants,
}: {
  storeSlug: string;
  product: Product;
  variants: ProductVariant[];
}) {
  const { add } = useCart();
  const router = useRouter();
  const [variantId, setVariantId] = useState<string>(variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === variantId) ?? null;
  const unitKobo = selectedVariant?.price_kobo ?? product.price_kobo;

  function handleAdd() {
    add(
      {
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        name: product.name,
        variantLabel: selectedVariant?.label ?? null,
        unitKobo,
        image: product.images[0] ?? null,
      },
      qty
    );
    setAdded(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-semibold">{formatNaira(unitKobo)}</p>

      {variants.length > 0 && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          Variant
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Quantity
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
          className="w-24 rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Add to cart
        </button>
        {added && (
          <button
            type="button"
            onClick={() => router.push(`/${storeSlug}/cart`)}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
          >
            View cart →
          </button>
        )}
      </div>
    </div>
  );
}
