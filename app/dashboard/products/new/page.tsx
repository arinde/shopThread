import { createProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/dashboard/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Add product</h1>
      <div className="mt-6">
        <ProductForm action={createProduct} />
      </div>
    </div>
  );
}
