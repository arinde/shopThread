import { describe, expect, it } from "vitest";
import { formatNaira, priceOrder } from "./pricing";

describe("priceOrder", () => {
  it("sums line totals and adds delivery", () => {
    const result = priceOrder({
      lines: [
        { name: "Ankara gown", unitKobo: 1_500_000, qty: 1 },
        { name: "Silk scarf", unitKobo: 900_000, qty: 2 },
      ],
      deliveryKobo: 200_000,
    });

    expect(result.subtotalKobo).toBe(1_500_000 + 900_000 * 2);
    expect(result.deliveryKobo).toBe(200_000);
    expect(result.totalKobo).toBe(result.subtotalKobo + 200_000);
  });

  it("defaults delivery to zero", () => {
    const result = priceOrder({ lines: [{ name: "Item", unitKobo: 100_000, qty: 1 }] });
    expect(result.deliveryKobo).toBe(0);
    expect(result.totalKobo).toBe(100_000);
  });

  it("rejects an empty order", () => {
    expect(() => priceOrder({ lines: [] })).toThrow();
  });

  it("rejects a non-positive quantity", () => {
    expect(() =>
      priceOrder({ lines: [{ name: "Item", unitKobo: 100_000, qty: 0 }] })
    ).toThrow();
  });

  it("rejects a negative unit price", () => {
    expect(() =>
      priceOrder({ lines: [{ name: "Item", unitKobo: -1, qty: 1 }] })
    ).toThrow();
  });
});

describe("formatNaira", () => {
  it("formats whole naira with thousands separators", () => {
    expect(formatNaira(1_500_000)).toBe("₦15,000");
  });

  it("rounds to the nearest naira", () => {
    expect(formatNaira(1_050)).toBe("₦11");
  });

  it("formats zero", () => {
    expect(formatNaira(0)).toBe("₦0");
  });
});
