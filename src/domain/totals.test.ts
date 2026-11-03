import { describe, expect, it } from "vitest";
import { CalculateTotals } from "./totals";

describe("calculateTotals", () => {
  it("soma itens", () => {
    const r = CalculateTotals([
      { quantity: 2, unitPrice: 5000 },
      { quantity: 1, unitPrice: 1500 },
    ]);
    expect(r.total).toBe(11500);
  });

  it("aceita quantidade fracionada", () => {
    expect(CalculateTotals([{ quantity: 2.5, unitPrice: 4000 }]).total).toBe(
      10000,
    );
  });
  it("desconto nunca passa do subtotal", () => {
    expect(
      CalculateTotals([{ quantity: 1, unitPrice: 1000 }], 5000).total,
    ).toBe(0);
  });

  it("desconto negativo é ignorado", () => {
    expect(
      CalculateTotals([{ quantity: 1, unitPrice: 1000 }], -300).total,
    ).toBe(1000);
  });

  it("lista vazia", () => {
    expect(CalculateTotals([]).total).toBe(0);
  });
});
