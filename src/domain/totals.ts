export type LineItem = { quantity: number; unitPrice: number };

export function CalculateTotals(items: LineItem[], discountCents = 0) {
  const subTotal = items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.unitPrice),
    0,
  );

  const discount = Math.min(Math.max(discountCents, 0), subTotal);

  return {
    subTotal,
    discountCents: discount,
    total: subTotal - discount,
  };
}
