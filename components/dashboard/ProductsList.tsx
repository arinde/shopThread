"use client";

import Link from "next/link";
import { formatNaira } from "@/lib/pricing";
import { deleteProduct } from "@/lib/actions/products";
import type { Product } from "@/lib/supabase/types";

export function ProductsList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">No products yet.</p>;
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {products.map((product) => (
        <li key={product.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">
              {product.name}
              {!product.active && <span className="ml-2 text-xs text-zinc-500">(hidden)</span>}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{formatNaira(product.price_kobo)}</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href={`/dashboard/products/${product.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
              Edit
            </Link>
            <form action={deleteProduct.bind(null, product.id)}>
              <button type="submit" className="text-red-600 hover:underline">
                Delete
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
