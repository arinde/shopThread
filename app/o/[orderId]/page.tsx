import { notFound } from "next/navigation";
import { getPublicOrder } from "@/lib/data/publicOrder";
import { formatNaira } from "@/lib/pricing";
import { SendOnWhatsAppButton } from "@/components/storefront/SendOnWhatsAppButton";

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const result = await getPublicOrder(orderId);
  if (!result) notFound();

  const { order, items, store } = result;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-xl font-semibold">Order #{order.number}</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Status: <span className="font-medium">{order.status}</span>
      </p>

      <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between py-2 text-sm">
            <span>
              {item.qty} × {item.name_snapshot}
            </span>
            <span>{formatNaira(item.unit_kobo * item.qty)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between border-t border-zinc-200 pt-2 text-sm dark:border-zinc-800">
        <span>Delivery</span>
        <span>{formatNaira(order.delivery_kobo)}</span>
      </div>
      <div className="flex justify-between pt-1 font-semibold">
        <span>Total</span>
        <span>{formatNaira(order.total_kobo)}</span>
      </div>

      {store.bank_details && (
        <div className="mt-6 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
          <p className="font-medium">Pay by transfer</p>
          <p>{store.bank_details.bank_name}</p>
          <p>{store.bank_details.account_name}</p>
          <p>{store.bank_details.account_number}</p>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Use &quot;Order #{order.number}&quot; as the transfer narration.
          </p>
        </div>
      )}

      <div className="mt-6">
        <SendOnWhatsAppButton
          whatsapp={store.whatsapp}
          order={{
            number: order.number,
            customerName: order.customer_name,
            customerPhone: order.customer_phone,
            fulfilment: order.fulfilment,
            address: order.address,
            note: order.note,
            items: items.map((item) => ({
              name: item.name_snapshot,
              qty: item.qty,
              unitKobo: item.unit_kobo,
            })),
            deliveryKobo: order.delivery_kobo,
            totalKobo: order.total_kobo,
            orderUrl: `${appUrl}/o/${order.id}`,
          }}
        />
      </div>
    </div>
  );
}
