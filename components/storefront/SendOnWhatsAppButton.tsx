"use client";

import { formatOrderMessage, toWhatsAppLink, type OrderForMessage } from "@/lib/whatsappMessage";

export function SendOnWhatsAppButton({
  order,
  whatsapp,
}: {
  order: OrderForMessage;
  whatsapp: string;
}) {
  const message = formatOrderMessage(order);
  const href = toWhatsAppLink(whatsapp, message);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white"
    >
      Send order on WhatsApp
    </a>
  );
}
