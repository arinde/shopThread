"use client";

import { useTransition } from "react";
import { formatNaira } from "@/lib/pricing";
import { toWhatsAppLink } from "@/lib/whatsappMessage";
import { updateOrderStatus } from "@/lib/actions/orders";
import type { Order, OrderStatus } from "@/lib/supabase/types";

const STATUSES: OrderStatus[] = ["new", "confirmed", "paid", "dispatched", "delivered", "cancelled"];

const PAID_REPLY = "Payment received, thank you! We'll get your order ready.";

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [isPending, startTransition] = useTransition();

  if (orders.length === 0) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">No orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800">
            <th className="py-2 pr-4">#</th>
            <th className="py-2 pr-4">Customer</th>
            <th className="py-2 pr-4">Total</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">WhatsApp</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2 pr-4 font-medium">#{order.number}</td>
              <td className="py-2 pr-4">
                {order.customer_name}
                <div className="text-zinc-500">{order.customer_phone}</div>
              </td>
              <td className="py-2 pr-4">{formatNaira(order.total_kobo)}</td>
              <td className="py-2 pr-4">
                <select
                  defaultValue={order.status}
                  disabled={isPending}
                  onChange={(event) =>
                    startTransition(() => updateOrderStatus(order.id, event.target.value))
                  }
                  className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-700"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2 pr-4">
                <a
                  className="text-blue-600 hover:underline dark:text-blue-400"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={toWhatsAppLink(order.customer_phone, PAID_REPLY)}
                >
                  Message customer
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
