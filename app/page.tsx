import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
        Turn your WhatsApp product list into a real storefront
      </h1>
      <p className="mt-4 max-w-md text-zinc-600 dark:text-zinc-400">
        Customers browse, pick items, and check out — orders land back in your WhatsApp, neatly
        formatted.
      </p>
      <Link
        href="/login"
        className="mt-8 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
      >
        Set up your store
      </Link>
    </div>
  );
}
