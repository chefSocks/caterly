import { eventTotals, type EventTotals } from "@/lib/totals";

type DecimalLike = { toString(): string };

type EventWithLines = {
  serviceChargePct: DecimalLike;
  taxPct: DecimalLike;
  discount: DecimalLike;
  items: { quantity: DecimalLike; unitPrice: DecimalLike; taxable: boolean }[];
  payments?: { amount: DecimalLike }[];
};

export function num(value: DecimalLike | null | undefined): number {
  return value == null ? 0 : Number(value.toString());
}

export function summarize(event: EventWithLines): EventTotals {
  return eventTotals(
    event.items.map((item) => ({
      quantity: num(item.quantity),
      unitPrice: num(item.unitPrice),
      taxable: item.taxable,
    })),
    {
      serviceChargePct: num(event.serviceChargePct),
      taxPct: num(event.taxPct),
      discount: num(event.discount),
    },
    (event.payments ?? []).reduce((sum, payment) => sum + num(payment.amount), 0),
  );
}
