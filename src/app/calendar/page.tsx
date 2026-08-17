import Link from "next/link";
import { db } from "@/lib/db";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { formatTime, money, plural, titleCase } from "@/lib/format";
import { summarize } from "@/lib/event-summary";
import { statusTone } from "@/lib/status";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month + delta, 1));
  return monthKey(date);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const now = new Date();
  const [yearStr, monthStr] = (month ?? monthKey(now)).split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const valid = Number.isInteger(year) && monthIndex >= 0 && monthIndex <= 11;
  const safeYear = valid ? year : now.getUTCFullYear();
  const safeMonth = valid ? monthIndex : now.getUTCMonth();

  const start = new Date(Date.UTC(safeYear, safeMonth, 1));
  const end = new Date(Date.UTC(safeYear, safeMonth + 1, 1));

  const events = await db.event.findMany({
    where: { startAt: { gte: start, lt: end } },
    orderBy: { startAt: "asc" },
    include: { client: true, items: true, payments: true },
  });

  const byDay = new Map<number, typeof events>();
  for (const event of events) {
    const day = event.startAt.getUTCDate();
    byDay.set(day, [...(byDay.get(day) ?? []), event]);
  }

  const leadingBlanks = start.getUTCDay();
  const daysInMonth = new Date(Date.UTC(safeYear, safeMonth + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(start);

  const booked = events.reduce((sum, event) => sum + summarize(event).total, 0);
  const isToday = (day: number) =>
    now.getUTCFullYear() === safeYear &&
    now.getUTCMonth() === safeMonth &&
    now.getUTCDate() === day;

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle={`${plural(events.length, "event")} · ${money(booked)} booked in ${monthLabel}`}
        action={
          <div className="flex gap-2">
            <Link href={`/calendar?month=${shiftMonth(safeYear, safeMonth, -1)}`}>
              <Button variant="secondary">←</Button>
            </Link>
            <Link href={`/calendar?month=${monthKey(now)}`}>
              <Button variant="secondary">Today</Button>
            </Link>
            <Link href={`/calendar?month=${shiftMonth(safeYear, safeMonth, 1)}`}>
              <Button variant="secondary">→</Button>
            </Link>
            <Link href="/events/new">
              <Button>New event</Button>
            </Link>
          </div>
        }
      />

      <Card title={monthLabel}>
        <div className="grid grid-cols-7 gap-px text-xs font-medium uppercase text-slate-500">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2 py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800">
          {cells.map((day, index) => (
            <div
              key={index}
              className="min-h-24 bg-white p-1 align-top dark:bg-slate-900"
            >
              {day && (
                <>
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        isToday(day)
                          ? "inline-flex size-5 items-center justify-center rounded-full bg-slate-900 text-xs text-white dark:bg-white dark:text-slate-900"
                          : "text-xs text-slate-400"
                      }
                    >
                      {day}
                    </span>
                    <Link
                      href={`/events/new?date=${safeYear}-${String(safeMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`}
                      className="text-xs text-slate-300 hover:text-slate-600"
                    >
                      +
                    </Link>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {(byDay.get(day) ?? []).map((event) => (
                      <li key={event.id}>
                        <Link
                          href={`/events/${event.id}`}
                          className="block rounded-md bg-slate-50 px-1.5 py-1 text-xs hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                          <span className="block truncate font-medium">
                            {event.name}
                          </span>
                          <span className="block truncate text-slate-500">
                            {formatTime(event.startAt)} · {event.guestCount}g
                          </span>
                          <Badge tone={statusTone[event.status]}>
                            {titleCase(event.status)}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
