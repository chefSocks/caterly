import Link from "next/link";
import { db } from "@/lib/db";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Textarea,
} from "@/components/ui";
import { formatDate, formatTime, plural } from "@/lib/format";
import { num } from "@/lib/event-summary";
import {
  createStaff,
  createVenue,
  deleteStaff,
  deleteVenue,
  updateStaff,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const now = new Date();
  const [staff, venues] = await Promise.all([
    db.staff.findMany({
      orderBy: { name: "asc" },
      include: {
        shifts: {
          where: { endAt: { gte: now } },
          orderBy: { startAt: "asc" },
          include: { event: true },
        },
      },
    }),
    db.venue.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { events: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader title="Staff & venues" subtitle="Team roster and upcoming shifts." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card title="Roster">
            {staff.length === 0 ? (
              <EmptyState>No staff yet.</EmptyState>
            ) : (
              <ul className="space-y-4">
                {staff.map((member) => (
                  <li
                    key={member.id}
                    className="border-b border-slate-100 pb-4 last:border-0 dark:border-slate-800"
                  >
                    <form
                      action={updateStaff.bind(null, member.id)}
                      className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_100px_auto_auto] sm:items-end"
                    >
                      <Field label="Name">
                        <Input name="name" defaultValue={member.name} />
                      </Field>
                      <Field label="Position">
                        <Input name="position" defaultValue={member.position ?? ""} />
                      </Field>
                      <Field label="Rate/hr">
                        <Input
                          name="hourlyRate"
                          type="number"
                          step="0.01"
                          defaultValue={num(member.hourlyRate)}
                        />
                      </Field>
                      <label className="flex items-center gap-2 pb-2 text-xs text-slate-500">
                        <input
                          type="checkbox"
                          name="active"
                          defaultChecked={member.active}
                        />
                        active
                      </label>
                      <Button variant="secondary" type="submit">
                        Save
                      </Button>
                      <input type="hidden" name="email" value={member.email ?? ""} />
                      <input type="hidden" name="phone" value={member.phone ?? ""} />
                    </form>
                    <div className="mt-1 flex items-start justify-between gap-3">
                      <ul className="text-xs text-slate-500">
                        {member.shifts.length === 0 ? (
                          <li>No upcoming shifts</li>
                        ) : (
                          member.shifts.map((shift) => (
                            <li key={shift.id}>
                              <Link
                                className="hover:underline"
                                href={`/events/${shift.eventId}`}
                              >
                                {formatDate(shift.startAt)} {formatTime(shift.startAt)}–
                                {formatTime(shift.endAt)} · {shift.position} ·{" "}
                                {shift.event.name}
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                      <form action={deleteStaff.bind(null, member.id)}>
                        <Button variant="ghost" type="submit">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Venues">
            {venues.length === 0 ? (
              <EmptyState>No venues yet.</EmptyState>
            ) : (
              <ul className="space-y-2 text-sm">
                {venues.map((venue) => (
                  <li key={venue.id} className="flex items-center justify-between gap-2">
                    <span>
                      {venue.name}
                      <span className="block text-xs text-slate-400">
                        {[
                          venue.address,
                          venue.capacity ? `cap ${venue.capacity}` : null,
                          plural(venue._count.events, "event"),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    <form action={deleteVenue.bind(null, venue.id)}>
                      <Button variant="ghost" type="submit">
                        Delete
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Add staff">
            <form action={createStaff} className="space-y-3">
              <Field label="Name">
                <Input name="name" required />
              </Field>
              <Field label="Position">
                <Input name="position" placeholder="Server, chef, driver…" />
              </Field>
              <Field label="Email">
                <Input name="email" type="email" />
              </Field>
              <Field label="Phone">
                <Input name="phone" />
              </Field>
              <Field label="Hourly rate">
                <Input name="hourlyRate" type="number" step="0.01" defaultValue={0} />
              </Field>
              <Button type="submit">Add staff</Button>
            </form>
          </Card>

          <Card title="Add venue">
            <form action={createVenue} className="space-y-3">
              <Field label="Name">
                <Input name="name" required />
              </Field>
              <Field label="Address">
                <Input name="address" />
              </Field>
              <Field label="Capacity">
                <Input name="capacity" type="number" min={0} />
              </Field>
              <Field label="Notes">
                <Textarea name="notes" />
              </Field>
              <Button type="submit">Add venue</Button>
            </form>
          </Card>
        </div>
      </div>
      <p className="mt-6 text-xs text-slate-400">
        Labour cost per event (shift hours × hourly rate) is summarised on the{" "}
        <Link className="underline" href="/reports">
          reports
        </Link>{" "}
        page.
      </p>
    </>
  );
}
