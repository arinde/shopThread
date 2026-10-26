import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySlugCached } from "@/lib/data/storefront";
import { CartProvider } from "@/lib/cart";
import { CartLink } from "@/components/storefront/CartLink";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = await params;
  const store = await getStoreBySlugCached(slug);
  if (!store) notFound();

  return (
    <CartProvider storeSlug={slug}>
      <div className="flex flex-1 flex-col">
        <header
          className="flex items-center justify-between px-6 py-4 text-white"
          style={{ backgroundColor: store.brand_color }}
        >
          <Link href={`/${slug}`} className="text-lg font-semibold">
            {store.name}
          </Link>
          <CartLink storeSlug={slug} />
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </CartProvider>
  );
}
