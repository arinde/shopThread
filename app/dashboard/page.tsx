import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStoreForOwner } from "@/lib/data/store";
import { listOrdersForStore } from "@/lib/data/orders";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { StoreForm } from "@/components/dashboard/StoreForm";

export default async function DashboardOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const store = user ? await getStoreForOwner(supabase, user.id) : null;

  if (!store) {
    return (
      <div>
        <h1 className="text-xl font-semibold">Welcome to ShopThread</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Set up your store to get your storefront link.
        </p>
        <div className="mt-6">
          <StoreForm store={null} />
        </div>
      </div>
    );
  }

  const orders = await listOrdersForStore(supabase, store.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>
        <Link
          href={`/${store.slug}`}
          target="_blank"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          View storefront ↗
        </Link>
      </div>
      <div className="mt-6">
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
