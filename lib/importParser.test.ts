import { describe, expect, it } from "vitest";
import { parseProductList } from "./importParser";

describe("parseProductList", () => {
  it("parses a basic hyphen-separated list", () => {
    const { products, errors } = parseProductList(
      "Ankara gown - 15,000\nSilk scarf - 9,000"
    );

    expect(errors).toEqual([]);
    expect(products).toEqual([
      { name: "Ankara gown", priceKobo: 1_500_000 },
      { name: "Silk scarf", priceKobo: 900_000 },
    ]);
  });

  it("accepts a naira sign, colon separator, and decimals", () => {
    const { products, errors } = parseProductList("Beaded bag: N7,500.50");
    expect(errors).toEqual([]);
    expect(products).toEqual([{ name: "Beaded bag", priceKobo: 750_050 }]);
  });

  it("skips blank lines and comment/category lines", () => {
    const { products, errors } = parseProductList(
      "# Dresses\n\nAnkara gown - 15,000\n"
    );
    expect(errors).toEqual([]);
    expect(products).toHaveLength(1);
  });

  it("reports a line with no trailing price", () => {
    const { products, errors } = parseProductList("Ankara gown");
    expect(products).toEqual([]);
    expect(errors).toEqual([
      { line: 1, raw: "Ankara gown", message: "No price found at the end of the line" },
    ]);
  });

  it("reports a line with a price but no name", () => {
    const { products, errors } = parseProductList("- 15,000");
    expect(products).toEqual([]);
    expect(errors[0].message).toBe("No product name before the price");
  });

  it("reports a zero price", () => {
    const { errors } = parseProductList("Free sample - 0");
    expect(errors[0].message).toBe("Price must be greater than zero");
  });
});
