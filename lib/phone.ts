/**
 * Normalizes a Nigerian phone number to E.164 digits (no leading +), e.g.
 * "0803 000 0000" -> "2348030000000", "+234 803 000 0000" -> "2348030000000".
 * Numbers already in another country's format (not starting with 0 or 234)
 * are returned digit-stripped as-is.
 */
export function toE164Nigeria(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");

  if (digits.startsWith("234")) {
    return digits;
  }
  if (digits.startsWith("0")) {
    return `234${digits.slice(1)}`;
  }
  return digits;
}
