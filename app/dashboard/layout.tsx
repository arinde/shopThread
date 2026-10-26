import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export const instant = false; // auth-gated, inherently per-user: not worth prerendering

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard">Orders</Link>
          <Link href="/dashboard/products">Products</Link>
          <Link href="/dashboard/import">Bulk import</Link>
          <Link href="/dashboard/settings">Settings</Link>
        </nav>
        <form action={signOut}>
          <button type="submit" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
            Sign out
          </button>
        </form>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
