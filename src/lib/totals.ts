export type TotalLine = {
  quantity: number;
  unitPrice: number;
  taxable: boolean;
};

export type TotalTerms = {
  serviceChargePct: number;
  taxPct: number;
  discount: number;
};

export type EventTotals = {
  subtotal: number;
  discount: number;
  serviceCharge: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
};

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function lineTotal(line: TotalLine): number {
  return round(line.quantity * line.unitPrice);
}

export function eventTotals(
  lines: TotalLine[],
  terms: TotalTerms,
  paid = 0,
): EventTotals {
  const subtotal = round(lines.reduce((sum, line) => sum + lineTotal(line), 0));
  const taxableSubtotal = round(
    lines.filter((l) => l.taxable).reduce((sum, line) => sum + lineTotal(line), 0),
  );
  const discount = round(Math.min(terms.discount, subtotal));
  const discountRatio = subtotal > 0 ? (subtotal - discount) / subtotal : 0;
  const serviceCharge = round((subtotal - discount) * (terms.serviceChargePct / 100));
  const taxBase = round(taxableSubtotal * discountRatio + serviceCharge);
  const tax = round(taxBase * (terms.taxPct / 100));
  const total = round(subtotal - discount + serviceCharge + tax);
  return {
    subtotal,
    discount,
    serviceCharge,
    tax,
    total,
    paid: round(paid),
    balance: round(total - paid),
  };
}
