export type ParsedProduct = {
  name: string;
  priceKobo: number;
};

export type ParseError = {
  line: number;
  raw: string;
  message: string;
};

export type ParseResult = {
  products: ParsedProduct[];
  errors: ParseError[];
};

// Matches a trailing price such as "- 15,000", ": N15000", "— ₦15,000.50", "15000"
const PRICE_PATTERN = /[-:–—]?\s*[₦nN]?\s*([\d][\d,]*(?:\.\d{1,2})?)\s*$/;

function toKobo(rawNumber: string): number {
  const naira = Number.parseFloat(rawNumber.replace(/,/g, ""));
  return Math.round(naira * 100);
}

/**
 * Parses a WhatsApp-style pasted product list, one product per line, e.g.:
 *   Ankara gown - 15,000
 *   Silk scarf: N9,000
 * Blank lines and lines starting with "#" (used as category headers) are skipped.
 */
export function parseProductList(text: string): ParseResult {
  const products: ParsedProduct[] = [];
  const errors: ParseError[] = [];

  const rawLines = text.split(/\r?\n/);

  rawLines.forEach((raw, index) => {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) {
      return;
    }

    const match = line.match(PRICE_PATTERN);
    if (!match) {
      errors.push({ line: index + 1, raw, message: "No price found at the end of the line" });
      return;
    }

    const priceKobo = toKobo(match[1]);
    const name = line.slice(0, match.index).replace(/[-:–—]\s*$/, "").trim();

    if (name === "") {
      errors.push({ line: index + 1, raw, message: "No product name before the price" });
      return;
    }
    if (priceKobo <= 0) {
      errors.push({ line: index + 1, raw, message: "Price must be greater than zero" });
      return;
    }

    products.push({ name, priceKobo });
  });

  return { products, errors };
}
