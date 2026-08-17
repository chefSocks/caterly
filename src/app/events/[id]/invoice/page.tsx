import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, money, titleCase } from "@/lib/format";
import { num, summarize } from "@/lib/event-summary";
import { lineTotal } from "@/lib/totals";
import { InfoGrid, PrintSheet } from "@/components/PrintSheet";

export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: {
      client: true,
      items: { orderBy: { position: "asc" } },
      payments: { orderBy: { receivedAt: "asc" } },
      scheduled: { orderBy: { dueAt: "asc" } },
    },
  });
  if (!event) notFound();

  const totals = summarize(event);

  return (
    <PrintSheet
      docTitle={`Invoice #${event.number}`}
      backHref={`/events/${event.id}`}
    >
      <h2 className="mb-4 text-lg font-semibold">{event.name}</h2>

      <InfoGrid
        rows={[
          ["Billed to", event.client.name],
          ["Attention", event.client.contactName ?? "—"],
          [
            "Address",
            [event.client.address, event.client.city, event.client.region]
              .filter(Boolean)
              .join(", ") || "—",
          ],
          ["Email", event.client.email ?? "—"],
          ["Event date", formatDate(event.startAt)],
          ["Guests", event.guestCount],
        ]}
      />

      <table className="mb-6 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left text-xs uppercase text-slate-500">
            <th className="py-1">Description</th>
            <th className="w-20 py-1 text-right">Qty</th>
            <th className="w-24 py-1 text-right">Rate</th>
            <th className="w-24 py-1 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {event.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-1">
                {item.name}
                <span className="block text-xs text-slate-500">
                  {titleCase(item.category)}
                </span>
              </td>
              <td className="py-1 text-right tabular-nums">{num(item.quantity)}</td>
              <td className="py-1 text-right tabular-nums">
                {money(num(item.unitPrice))}
              </td>
              <td className="py-1 text-right tabular-nums">
                {money(
                  lineTotal({
                    quantity: num(item.quantity),
                    unitPrice: num(item.unitPrice),
                    taxable: item.taxable,
                  }),
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto max-w-xs text-sm">
        {(
          [
            ["Subtotal", totals.subtotal],
            ["Discount", -totals.discount],
            [`Service charge (${num(event.serviceChargePct)}%)`, totals.serviceCharge],
            [`Tax (${num(event.taxPct)}%)`, totals.tax],
          ] as [string, number][]
        ).map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-0.5">
            <span className="text-slate-500">{label}</span>
            <span className="tabular-nums">{money(value)}</span>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-slate-300 py-1 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{money(totals.total)}</span>
        </div>
        <div className="flex justify-between gap-4 py-0.5">
          <span className="text-slate-500">Payments received</span>
          <span className="tabular-nums">-{money(totals.paid)}</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-slate-300 py-1 text-base font-semibold">
          <span>Balance due</span>
          <span className="tabular-nums">{money(totals.balance)}</span>
        </div>
      </div>

      {event.payments.length > 0 && (
        <div className="mt-6 text-sm">
          <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">
            Payment history
          </h3>
          <ul>
            {event.payments.map((payment) => (
              <li key={payment.id} className="flex justify-between py-0.5">
                <span>
                  {formatDate(payment.receivedAt)} · {titleCase(payment.method)}
                  {payment.reference ? ` · ${payment.reference}` : ""}
                </span>
                <span className="tabular-nums">{money(num(payment.amount))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {event.scheduled.some((item) => !item.paid) && (
        <div className="mt-6 text-sm">
          <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">
            Upcoming payments
          </h3>
          <ul>
            {event.scheduled
              .filter((item) => !item.paid)
              .map((item) => (
                <li key={item.id} className="flex justify-between py-0.5">
                  <span>
                    {item.label} — due {formatDate(item.dueAt)}
                  </span>
                  <span className="tabular-nums">{money(num(item.amount))}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </PrintSheet>
  );
}
