import { createClient } from "@/lib/supabase/server";
import { getStoreForOwner } from "@/lib/data/store";
import { StoreForm } from "@/components/dashboard/StoreForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const store = user ? await getStoreForOwner(supabase, user.id) : null;

  return (
    <div>
      <h1 className="text-xl font-semibold">Store settings</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        This is what customers see on your storefront link.
      </p>
      <div className="mt-6">
        <StoreForm store={store} />
      </div>
    </div>
  );
}
