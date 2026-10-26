import { notFound } from "next/navigation";
import { getActiveProductCached } from "@/lib/data/storefront";
import { AddToCartForm } from "@/components/storefront/AddToCartForm";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ store: string; productId: string }>;
}) {
  const { store: slug, productId } = await params;
  const result = await getActiveProductCached(productId);
  if (!result) notFound();

  const { product, variants } = result;

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
        {product.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        )}
      </div>
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        {product.description && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{product.description}</p>
        )}
        <div className="mt-6">
          <AddToCartForm storeSlug={slug} product={product} variants={variants} />
        </div>
      </div>
    </div>
  );
}
