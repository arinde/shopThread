export type PricedLine = {
  name: string;
  unitKobo: number;
  qty: number;
};

export type PricingInput = {
  lines: PricedLine[];
  deliveryKobo?: number;
};

export type PricingResult = {
  subtotalKobo: number;
  deliveryKobo: number;
  totalKobo: number;
};

export function priceOrder({ lines, deliveryKobo = 0 }: PricingInput): PricingResult {
  if (lines.length === 0) {
    throw new Error("Cannot price an order with no lines");
  }

  for (const line of lines) {
    if (!Number.isInteger(line.unitKobo) || line.unitKobo < 0) {
      throw new Error(`Invalid unit price for "${line.name}": ${line.unitKobo}`);
    }
    if (!Number.isInteger(line.qty) || line.qty <= 0) {
      throw new Error(`Invalid quantity for "${line.name}": ${line.qty}`);
    }
  }

  const subtotalKobo = lines.reduce((sum, line) => sum + line.unitKobo * line.qty, 0);

  return {
    subtotalKobo,
    deliveryKobo,
    totalKobo: subtotalKobo + deliveryKobo,
  };
}

/** Formats kobo as a naira amount, e.g. 1500000 -> "₦15,000". Always whole naira (kobo is not shown). */
export function formatNaira(kobo: number): string {
  const naira = Math.round(kobo) / 100;
  return `₦${naira.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}
