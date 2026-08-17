import Link from "next/link";
import { db } from "@/lib/db";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import { formatDate, formatTime, money, plural, titleCase } from "@/lib/format";
import { summarize } from "@/lib/event-summary";
import { EventStatus } from "@/generated/prisma/enums";
import { statusTone } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string }>;
}) {
  const { q, status, from, to } = await searchParams;
  const statuses = Object.values(EventStatus) as string[];

  const events = await db.event.findMany({
    where: {
      ...(status && statuses.includes(status)
        ? { status: status as EventStatus }
        : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { client: { name: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
      ...(from || to
        ? {
            startAt: {
              ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
    },
    orderBy: { startAt: "desc" },
    include: { client: true, items: true, payments: true },
    take: 200,
  });

  const booked = events.reduce((sum, event) => sum + summarize(event).total, 0);

  return (
    <>
      <PageHeader
        title="Events"
        subtitle={`${plural(events.length, "event")} · ${money(booked)} booked`}
        action={
          <Link href="/events/new">
            <Button>New event</Button>
          </Link>
        }
      />

      <form className="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]">
        <Input name="q" placeholder="Search event or client…" defaultValue={q ?? ""} />
        <Select name="status" defaultValue={status ?? ""}>
          <option value="">All statuses</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {titleCase(value)}
            </option>
          ))}
        </Select>
        <Input type="date" name="from" defaultValue={from ?? ""} />
        <Input type="date" name="to" defaultValue={to ?? ""} />
        <Button variant="secondary" type="submit">
          Filter
        </Button>
      </form>

      <Card>
        {events.length === 0 ? (
          <EmptyState>No events match these filters.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Event</th>
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4 text-right">Guests</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Total</th>
                  <th className="py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const totals = summarize(event);
                  return (
                    <tr
                      key={event.id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="py-2 pr-4 text-slate-400">{event.number}</td>
                      <td className="py-2 pr-4 font-medium">
                        <Link className="hover:underline" href={`/events/${event.id}`}>
                          {event.name}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 text-slate-500">{event.client.name}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {formatDate(event.startAt)}
                        <span className="text-slate-400">
                          {" "}
                          {formatTime(event.startAt)}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right">{event.guestCount}</td>
                      <td className="py-2 pr-4">
                        <Badge tone={statusTone[event.status]}>
                          {titleCase(event.status)}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-right">{money(totals.total)}</td>
                      <td className="py-2 text-right">
                        {totals.balance > 0 ? (
                          <span className="text-amber-600">{money(totals.balance)}</span>
                        ) : (
                          <span className="text-emerald-600">Paid</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
