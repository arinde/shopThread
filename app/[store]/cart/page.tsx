"use client";

import { use } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/pricing";

export default function CartPage({ params }: { params: Promise<{ store: string }> }) {
  const { store: slug } = use(params);
  const { lines, setQty, remove, subtotalKobo } = useCart();

  if (lines.length === 0) {
    return (
      <div>
        <p className="text-zinc-600 dark:text-zinc-400">Your cart is empty.</p>
        <Link href={`/${slug}`} className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400">
          ← Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {lines.map((line) => (
          <li key={`${line.productId}:${line.variantId}`} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">
                {line.name}
                {line.variantLabel && <span className="text-zinc-500"> ({line.variantLabel})</span>}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{formatNaira(line.unitKobo)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={line.qty}
                onChange={(e) => setQty(line.productId, line.variantId, Number.parseInt(e.target.value, 10) || 1)}
                className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button
                type="button"
                onClick={() => remove(line.productId, line.variantId)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between text-lg font-semibold">
        <span>Subtotal</span>
        <span>{formatNaira(subtotalKobo)}</span>
      </div>

      <Link
        href={`/${slug}/checkout`}
        className="mt-6 block w-fit rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
      >
        Checkout
      </Link>
    </div>
  );
}
