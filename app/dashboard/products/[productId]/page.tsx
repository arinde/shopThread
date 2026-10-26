import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductWithVariants } from "@/lib/data/products";
import { updateProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/dashboard/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const supabase = await createClient();
  const result = await getProductWithVariants(supabase, productId);

  if (!result) notFound();

  const { product, variants } = result;
  const action = updateProduct.bind(null, product.id);

  return (
    <div>
      <h1 className="text-xl font-semibold">Edit product</h1>
      <div className="mt-6">
        <ProductForm product={product} variants={variants} action={action} />
      </div>
    </div>
  );
}
