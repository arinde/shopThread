import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveProductsCached, getStoreBySlugCached } from "@/lib/data/storefront";
import { formatNaira } from "@/lib/pricing";

export default async function StorefrontHome({ params }: { params: Promise<{ store: string }> }) {
  const { store: slug } = await params;
  const store = await getStoreBySlugCached(slug);
  if (!store) notFound();

  const products = await getActiveProductsCached(store.id);

  if (products.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">No products yet — check back soon.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/${slug}/p/${product.id}`}
          className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
        >
          <div className="aspect-square w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
            {product.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
            )}
          </div>
          <p className="text-sm font-medium">{product.name}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{formatNaira(product.price_kobo)}</p>
        </Link>
      ))}
    </div>
  );
}
