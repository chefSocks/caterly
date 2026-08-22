import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
} from "@/components/ui";
import {
  formatDate,
  formatDateTime,
  formatTime,
  money,
  plural,
  titleCase,
} from "@/lib/format";
import { summarize } from "@/lib/event-summary";
import { statusTone } from "@/lib/status";
import { getDashboardData } from "@/services/dashboard";
import { addTask, toggleTask } from "./events/actions";

export const dynamic = "force-dynamic";

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const now = new Date();
  const {
    upcoming,
    openLeads,
    tasks,
    monthEventCount,
    monthGuests,
    monthBooked,
    outstandingCount,
    outstandingTotal,
    outstanding,
  } = await getDashboardData(now);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={formatDate(now)}
        action={
          <div className="flex gap-2">
            <Link href="/events/new">
              <Button>New event</Button>
            </Link>
            <Link href="/calendar">
              <Button variant="secondary">Calendar</Button>
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Booked this month"
          value={money(monthBooked)}
          hint={`${plural(monthEventCount, "event")} · ${monthGuests} guests`}
        />
        <Kpi label="Events next 30 days" value={String(upcoming.length)} />
        <Kpi label="Open leads" value={String(openLeads)} hint="Needing follow-up" />
        <Kpi
          label="Outstanding balance"
          value={money(outstandingTotal)}
          hint={`${plural(outstandingCount, "event")} with a balance`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card
          title="Upcoming events"
          action={
            <Link className="text-xs underline" href="/events">
              All events
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <EmptyState>Nothing booked in the next 30 days.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {upcoming.map((event) => {
                const totals = summarize(event);
                return (
                  <li key={event.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <Link
                        className="font-medium hover:underline"
                        href={`/events/${event.id}`}
                      >
                        {event.name}
                      </Link>
                      <p className="truncate text-xs text-slate-500">
                        {event.client.name} · {formatDate(event.startAt)}{" "}
                        {formatTime(event.startAt)} · {event.guestCount} guests
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge tone={statusTone[event.status]}>
                        {titleCase(event.status)}
                      </Badge>
                      <span className="tabular-nums">{money(totals.total)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Open tasks">
            <form
              action={addTask.bind(null, null)}
              className="mb-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end"
            >
              <Field label="Task">
                <Input name="title" required placeholder="Call Nadia about tasting" />
              </Field>
              <Field label="Due">
                <Input name="dueAt" type="datetime-local" />
              </Field>
              <Button type="submit">Add</Button>
            </form>
            {tasks.length === 0 ? (
              <EmptyState>Nothing outstanding.</EmptyState>
            ) : (
              <ul className="space-y-2 text-sm">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <form action={toggleTask.bind(null, task.id)}>
                      <button type="submit" className="text-left hover:underline">
                        {task.title}
                        <span className="block text-xs text-slate-400">
                          {task.dueAt ? `due ${formatDateTime(task.dueAt)}` : "no due date"}
                          {task.event ? ` · ${task.event.name}` : ""}
                        </span>
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Balances owing">
            {outstanding.length === 0 ? (
              <EmptyState>Everything is paid up.</EmptyState>
            ) : (
              <ul className="space-y-2 text-sm">
                {outstanding.map((row) => (
                  <li key={row.id} className="flex justify-between gap-3">
                    <Link className="truncate hover:underline" href={`/events/${row.id}`}>
                      {row.clientName} · {row.eventName}
                    </Link>
                    <span className="shrink-0 tabular-nums text-amber-600">
                      {money(row.balance)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
