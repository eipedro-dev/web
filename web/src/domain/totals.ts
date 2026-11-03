export type LineItem = { quantity: number; unitPriceCents: number };

export function calcTotals(items: LineItem[], discountCents = 0) {
  const subtotalCents = items.reduce(
    (sum, i) => sum + Math.round(i.quantity * i.unitPriceCents),
    0,
  );
  const discount = Math.min(Math.max(discountCents, 0), subtotalCents);
  return {
    subtotalCents,
    discountCents: discount,
    totalCents: subtotalCents - discount,
  };
}