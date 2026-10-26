import { formatNaira } from "./pricing";

export type OrderItemForMessage = {
  name: string;
  variantLabel?: string | null;
  qty: number;
  unitKobo: number;
};

export type OrderForMessage = {
  number: number;
  customerName: string;
  customerPhone: string;
  fulfilment: "delivery" | "pickup";
  address?: string | null;
  note?: string | null;
  items: OrderItemForMessage[];
  deliveryKobo: number;
  totalKobo: number;
  orderUrl: string;
};

/** Pads item/price columns so the message lines up in WhatsApp's monospace-ish rendering. */
function formatLine(label: string, amount: string): string {
  const padded = label.length < 30 ? label.padEnd(30) : label;
  return `${padded}${amount}`;
}

export function formatOrderMessage(order: OrderForMessage): string {
  const lines: string[] = [];

  lines.push(`🛍️ New order #${order.number} from ShopThread`);
  lines.push(`Name: ${order.customerName}`);
  lines.push(`Phone: ${order.customerPhone}`);
  lines.push("");

  for (const item of order.items) {
    const label = item.variantLabel
      ? `${item.qty} × ${item.name} (${item.variantLabel})`
      : `${item.qty} × ${item.name}`;
    lines.push(formatLine(label, formatNaira(item.unitKobo * item.qty)));
  }

  if (order.fulfilment === "delivery") {
    lines.push(formatLine("Delivery", formatNaira(order.deliveryKobo)));
  }

  lines.push(formatLine("Total:", formatNaira(order.totalKobo)));
  lines.push("");

  if (order.fulfilment === "delivery" && order.address) {
    lines.push(`Address: ${order.address}`);
  } else if (order.fulfilment === "pickup") {
    lines.push("Fulfilment: Pickup");
  }

  if (order.note) {
    lines.push(`Note: ${order.note}`);
  }

  lines.push("");
  lines.push(`View order: ${order.orderUrl}`);

  return lines.join("\n");
}

/** E.164 phone number (digits only, no leading +) required by wa.me links. */
export function toWhatsAppLink(phoneE164: string, message: string): string {
  const digitsOnly = phoneE164.replace(/[^\d]/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
