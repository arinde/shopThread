import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStoreForOwner } from "@/lib/data/store";
import { listProductsForStore } from "@/lib/data/products";
import { ProductsList } from "@/components/dashboard/ProductsList";

export default async function ProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const store = await getStoreForOwner(supabase, user.id);
  if (!store) redirect("/dashboard");

  const products = await listProductsForStore(supabase, store.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link
          href="/dashboard/products/new"
          className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
        >
          + Add product
        </Link>
      </div>
      <div className="mt-6">
        <ProductsList products={products} />
      </div>
    </div>
  );
}
