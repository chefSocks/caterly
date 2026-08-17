import Link from "next/link";
import { db } from "@/lib/db";
import { Button, Card, EmptyState, Input, PageHeader } from "@/components/ui";
import { formatDate, money, titleCase } from "@/lib/format";
import { num, summarize } from "@/lib/event-summary";
import { lineTotal } from "@/lib/totals";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const now = new Date();
  const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), 11, 31));
  const start = from ? new Date(`${from}T00:00:00.000Z`) : defaultFrom;
  const end = to ? new Date(`${to}T23:59:59.999Z`) : defaultTo;

  const events = await db.event.findMany({
    where: { startAt: { gte: start, lte: end }, status: { not: "CANCELLED" } },
    orderBy: { startAt: "asc" },
    include: {
      client: true,
      items: { include: { menuItem: true } },
      payments: true,
      shifts: { include: { staff: true } },
    },
  });

  const revenue = events.reduce((sum, event) => sum + summarize(event).total, 0);
  const guests = events.reduce((sum, event) => sum + event.guestCount, 0);
  const collected = events.reduce((sum, event) => sum + summarize(event).paid, 0);

  const foodCost = events.reduce(
    (sum, event) =>
      sum +
      event.items.reduce(
        (itemSum, item) =>
          itemSum + num(item.menuItem?.cost ?? null) * num(item.quantity),
        0,
      ),
    0,
  );

  const labourCost = events.reduce(
    (sum, event) =>
      sum +
      event.shifts.reduce((shiftSum, shift) => {
        const hours =
          (shift.endAt.getTime() - shift.startAt.getTime()) / (1000 * 60 * 60);
        return shiftSum + hours * num(shift.staff?.hourlyRate ?? null);
      }, 0),
    0,
  );

  const byMonth = new Map<string, { revenue: number; events: number }>();
  for (const event of events) {
    const key = `${event.startAt.getUTCFullYear()}-${String(
      event.startAt.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    const current = byMonth.get(key) ?? { revenue: 0, events: 0 };
    byMonth.set(key, {
      revenue: current.revenue + summarize(event).total,
      events: current.events + 1,
    });
  }

  const itemSales = new Map<string, { quantity: number; revenue: number }>();
  for (const event of events) {
    for (const item of event.items) {
      const current = itemSales.get(item.name) ?? { quantity: 0, revenue: 0 };
      itemSales.set(item.name, {
        quantity: current.quantity + num(item.quantity),
        revenue:
          current.revenue +
          lineTotal({
            quantity: num(item.quantity),
            unitPrice: num(item.unitPrice),
            taxable: item.taxable,
          }),
      });
    }
  }
  const topItems = [...itemSales.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 12);

  const byClient = new Map<string, { name: string; revenue: number; events: number }>();
  for (const event of events) {
    const current = byClient.get(event.clientId) ?? {
      name: event.client.name,
      revenue: 0,
      events: 0,
    };
    byClient.set(event.clientId, {
      name: current.name,
      revenue: current.revenue + summarize(event).total,
      events: current.events + 1,
    });
  }
  const topClients = [...byClient.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10);

  const maxMonthRevenue = Math.max(
    1,
    ...[...byMonth.values()].map((month) => month.revenue),
  );

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle={`${formatDate(start)} – ${formatDate(end)}`}
      />

      <form className="mb-6 flex flex-wrap items-end gap-2">
        <Input type="date" name="from" defaultValue={from ?? ""} />
        <Input type="date" name="to" defaultValue={to ?? ""} />
        <Button variant="secondary" type="submit">
          Apply
        </Button>
      </form>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Revenue booked", money(revenue), `${events.length} events`],
            ["Collected", money(collected), `${money(revenue - collected)} outstanding`],
            [
              "Food + labour cost",
              money(foodCost + labourCost),
              `${money(foodCost)} food · ${money(labourCost)} labour`,
            ],
            [
              "Avg per guest",
              guests > 0 ? money(revenue / guests) : money(0),
              `${guests} guests`,
            ],
          ] as [string, string, string][]
        ).map(([label, value, hint]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Revenue by month">
          {byMonth.size === 0 ? (
            <EmptyState>No events in this range.</EmptyState>
          ) : (
            <ul className="space-y-2 text-sm">
              {[...byMonth.entries()].map(([key, value]) => (
                <li key={key}>
                  <div className="flex justify-between">
                    <span>{key}</span>
                    <span className="tabular-nums">
                      {money(value.revenue)}{" "}
                      <span className="text-xs text-slate-400">
                        {value.events} events
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-slate-900 dark:bg-white"
                      style={{
                        width: `${(value.revenue / maxMonthRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Top menu items">
          {topItems.length === 0 ? (
            <EmptyState>No menu lines in this range.</EmptyState>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-1">Item</th>
                  <th className="py-1 text-right">Qty</th>
                  <th className="py-1 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map(([name, stats]) => (
                  <tr key={name} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-1">{name}</td>
                    <td className="py-1 text-right tabular-nums">
                      {stats.quantity.toFixed(0)}
                    </td>
                    <td className="py-1 text-right tabular-nums">
                      {money(stats.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Top clients">
          {topClients.length === 0 ? (
            <EmptyState>No clients in this range.</EmptyState>
          ) : (
            <ul className="space-y-1 text-sm">
              {topClients.map(([id, stats]) => (
                <li key={id} className="flex justify-between">
                  <Link className="hover:underline" href={`/clients/${id}`}>
                    {stats.name}
                  </Link>
                  <span className="tabular-nums">
                    {money(stats.revenue)}{" "}
                    <span className="text-xs text-slate-400">
                      {stats.events} events
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Events in range">
          {events.length === 0 ? (
            <EmptyState>No events.</EmptyState>
          ) : (
            <ul className="space-y-1 text-sm">
              {events.map((event) => {
                const totals = summarize(event);
                return (
                  <li key={event.id} className="flex justify-between gap-2">
                    <Link className="truncate hover:underline" href={`/events/${event.id}`}>
                      {formatDate(event.startAt)} · {event.name}
                      <span className="text-xs text-slate-400">
                        {" "}
                        {titleCase(event.status)}
                      </span>
                    </Link>
                    <span className="shrink-0 tabular-nums">{money(totals.total)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
