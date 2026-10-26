"use client";

import { useState } from "react";
import type { Product, ProductVariant } from "@/lib/supabase/types";

type VariantRow = { label: string; price: string; stock: string };

function variantsToRows(variants: ProductVariant[]): VariantRow[] {
  return variants.map((v) => ({
    label: v.label,
    price: v.price_kobo != null ? (v.price_kobo / 100).toString() : "",
    stock: v.stock != null ? v.stock.toString() : "",
  }));
}

export function ProductForm({
  product,
  variants,
  action,
}: {
  product?: Product;
  variants?: ProductVariant[];
  action: (formData: FormData) => void;
}) {
  const [rows, setRows] = useState<VariantRow[]>(
    variants && variants.length > 0 ? variantsToRows(variants) : []
  );

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Name
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Description
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Price (₦)
          <input
            name="priceNaira"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product ? product.price_kobo / 100 : undefined}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          Stock (blank = not tracked)
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Category
        <input
          name="category"
          defaultValue={product?.category ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Image URL
        <input
          name="imageUrl"
          type="url"
          placeholder="https://…"
          defaultValue={product?.images?.[0] ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Variants (e.g. size, color) — optional</legend>
        {rows.map((row, index) => (
          <div key={index} className="flex gap-2">
            <input
              name="variantLabel"
              placeholder="M / Wine"
              defaultValue={row.label}
              className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              name="variantPrice"
              placeholder="Price override"
              defaultValue={row.price}
              className="w-32 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              name="variantStock"
              placeholder="Stock"
              defaultValue={row.stock}
              className="w-24 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="button"
              onClick={() => setRows((r) => r.filter((_, i) => i !== index))}
              className="px-2 text-sm text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows((r) => [...r, { label: "", price: "", stock: "" }])}
          className="w-fit text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          + Add variant
        </button>
      </fieldset>

      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
          Active (visible on storefront)
        </label>
      </div>

      <button
        type="submit"
        className="mt-2 w-fit rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
      >
        {product ? "Save changes" : "Add product"}
      </button>
    </form>
  );
}
