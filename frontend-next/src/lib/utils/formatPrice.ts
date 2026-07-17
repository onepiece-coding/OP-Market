/**
 * @file src/lib/utils/formatPrice.ts
 */

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(price: string | number): string {
  const value = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(value)) return formatter.format(0);
  return formatter.format(value);
}
