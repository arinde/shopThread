import { BulkImportForm } from "@/components/dashboard/BulkImportForm";

export default function BulkImportPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Bulk import</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Paste a WhatsApp-style product list and we&apos;ll turn it into products.
      </p>
      <div className="mt-6">
        <BulkImportForm />
      </div>
    </div>
  );
}
