"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { parseProductList } from "@/lib/importParser";
import { formatNaira } from "@/lib/pricing";
import { bulkImportProducts } from "@/lib/actions/products";

export function BulkImportForm() {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  const { products, errors } = useMemo(() => parseProductList(text), [text]);

  function handleImport() {
    if (products.length === 0) return;
    startTransition(async () => {
      const { created } = await bulkImportProducts(products);
      setResult(`Added ${created} product${created === 1 ? "" : "s"}.`);
      router.push("/dashboard/products");
    });
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Paste your product list (one per line, e.g. &quot;Ankara gown - 15,000&quot;)
        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Ankara gown - 15,000\nSilk scarf - 9,000"}
          className="rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {products.length > 0 && (
        <div>
          <p className="text-sm font-medium">{products.length} product(s) found:</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400">
            {products.map((p, i) => (
              <li key={i}>
                {p.name} — {formatNaira(p.priceKobo)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {errors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-red-600">Couldn&apos;t read {errors.length} line(s):</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-red-600">
            {errors.map((e) => (
              <li key={e.line}>
                Line {e.line}: &quot;{e.raw}&quot; — {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={handleImport}
        disabled={products.length === 0 || isPending}
        className="w-fit rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {isPending ? "Importing…" : `Add ${products.length || ""} product(s)`}
      </button>

      {result && <p className="text-sm text-green-700 dark:text-green-500">{result}</p>}
    </div>
  );
}
