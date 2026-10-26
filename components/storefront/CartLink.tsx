"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartLink({ storeSlug }: { storeSlug: string }) {
  const { itemCount } = useCart();
  return (
    <Link href={`/${storeSlug}/cart`} className="text-sm font-medium">
      Cart ({itemCount})
    </Link>
  );
}
