import { describe, it, expect } from 'vitest';
import { calcTotals } from './totals';

describe('calcTotals', () => {
  it('soma itens', () => {
    const r = calcTotals([
      { quantity: 2, unitPriceCents: 5000 },
      { quantity: 1, unitPriceCents: 1500 },
    ]);
    expect(r.totalCents).toBe(11500);
  });

  it('aceita quantidade fracionada', () => {
    expect(calcTotals([{ quantity: 2.5, unitPriceCents: 4000 }]).totalCents).toBe(10000);
  });

  it('desconto nunca passa do subtotal', () => {
    expect(calcTotals([{ quantity: 1, unitPriceCents: 1000 }], 5000).totalCents).toBe(0);
  });

  it('desconto negativo é ignorado', () => {
    expect(calcTotals([{ quantity: 1, unitPriceCents: 1000 }], -300).totalCents).toBe(1000);
  });

  it('lista vazia', () => {
    expect(calcTotals([]).totalCents).toBe(0);
  });
});