import { describe, expect, it } from "vitest";
import { formatOrderMessage, toWhatsAppLink } from "./whatsappMessage";

const baseOrder = {
  number: 1042,
  customerName: "Tolu A.",
  customerPhone: "0803 000 0000",
  fulfilment: "delivery" as const,
  address: "12 Example Street, Yaba",
  note: "Please call before delivery",
  items: [
    { name: "Ankara gown", variantLabel: "Size M", qty: 1, unitKobo: 1_500_000 },
    { name: "Silk scarf", variantLabel: "Wine", qty: 2, unitKobo: 900_000 },
  ],
  deliveryKobo: 200_000,
  totalKobo: 1_500_000 + 900_000 * 2 + 200_000,
  orderUrl: "https://shopthread.app/o/1042",
};

describe("formatOrderMessage", () => {
  it("includes order number, customer, items, total, address, note, and link", () => {
    const message = formatOrderMessage(baseOrder);

    expect(message).toContain("New order #1042");
    expect(message).toContain("Tolu A.");
    expect(message).toContain("1 × Ankara gown (Size M)");
    expect(message).toContain("2 × Silk scarf (Wine)");
    expect(message).toContain("₦35,000");
    expect(message).toContain("12 Example Street, Yaba");
    expect(message).toContain("Please call before delivery");
    expect(message).toContain("https://shopthread.app/o/1042");
  });

  it("omits the delivery line and shows pickup for pickup orders", () => {
    const message = formatOrderMessage({
      ...baseOrder,
      fulfilment: "pickup",
      address: null,
      deliveryKobo: 0,
      totalKobo: baseOrder.totalKobo - 200_000,
    });

    expect(message).not.toContain("Delivery");
    expect(message).toContain("Fulfilment: Pickup");
  });

  it("omits the note line when there is no note", () => {
    const message = formatOrderMessage({ ...baseOrder, note: null });
    expect(message).not.toContain("Note:");
  });
});

describe("toWhatsAppLink", () => {
  it("strips non-digits from the phone number and URL-encodes the message", () => {
    const link = toWhatsAppLink("+234 803 000 0000", "Hello there");
    expect(link).toBe("https://wa.me/2348030000000?text=Hello%20there");
  });
});
