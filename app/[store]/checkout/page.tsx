import { notFound } from "next/navigation";
import { getStoreBySlugCached } from "@/lib/data/storefront";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";

export default async function CheckoutPage({ params }: { params: Promise<{ store: string }> }) {
  const { store: slug } = await params;
  const store = await getStoreBySlugCached(slug);
  if (!store) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold">Checkout</h1>
      <div className="mt-6">
        <CheckoutForm storeSlug={slug} deliveryFeeKobo={store.delivery_fee_kobo} />
      </div>
    </div>
  );
}
