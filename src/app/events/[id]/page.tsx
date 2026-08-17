import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";
import {
  formatDate,
  formatDateTime,
  formatTime,
  money,
  titleCase,
  toDateTimeInput,
} from "@/lib/format";
import { num, summarize } from "@/lib/event-summary";
import { lineTotal } from "@/lib/totals";
import { paymentMethodLabel, statusTone } from "@/lib/status";
import { EventStatus, ServiceType } from "@/generated/prisma/enums";
import { AddMenuLine } from "./AddMenuLine";
import {
  addEventItem,
  addPayment,
  addScheduledPayment,
  addShift,
  addTask,
  copyEvent,
  deleteEvent,
  deleteEventItem,
  deletePayment,
  deleteScheduledPayment,
  deleteShift,
  deleteTask,
  setEventStatus,
  toggleScheduledPayment,
  toggleTask,
  updateEvent,
  updateEventItem,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, clients, venues, menuItems, staff] = await Promise.all([
    db.event.findUnique({
      where: { id },
      include: {
        client: true,
        venue: true,
        items: { orderBy: { position: "asc" } },
        payments: { orderBy: { receivedAt: "desc" } },
        scheduled: { orderBy: { dueAt: "asc" } },
        shifts: { orderBy: { startAt: "asc" }, include: { staff: true } },
        tasks: { orderBy: [{ done: "asc" }, { dueAt: "asc" }] },
      },
    }),
    db.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.venue.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.menuItem.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    db.staff.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  if (!event) notFound();

  const totals = summarize(event);

  return (
    <>
      <PageHeader
        title={event.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone[event.status]}>{titleCase(event.status)}</Badge>
            <span>#{event.number}</span>
            <span>·</span>
            <Link className="hover:underline" href={`/clients/${event.clientId}`}>
              {event.client.name}
            </Link>
            <span>·</span>
            <span>
              {formatDate(event.startAt)} {formatTime(event.startAt)}–
              {formatTime(event.endAt)}
            </span>
            <span>·</span>
            <span>{event.guestCount} guests</span>
          </span>
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/events/${event.id}/beo`}>
              <Button variant="secondary">BEO</Button>
            </Link>
            <Link href={`/events/${event.id}/kitchen`}>
              <Button variant="secondary">Kitchen sheet</Button>
            </Link>
            <Link href={`/events/${event.id}/invoice`}>
              <Button variant="secondary">Invoice</Button>
            </Link>
            <form action={copyEvent.bind(null, event.id)}>
              <Button variant="secondary" type="submit">
                Copy
              </Button>
            </form>
            <form action={deleteEvent.bind(null, event.id)}>
              <Button variant="danger" type="submit">
                Delete
              </Button>
            </form>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.values(EventStatus) as string[]).map((status) => (
          <form key={status} action={setEventStatus.bind(null, event.id, status)}>
            <Button
              type="submit"
              variant={status === event.status ? "primary" : "secondary"}
            >
              {titleCase(status)}
            </Button>
          </form>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <Card title="Menu">
            {event.items.length === 0 ? (
              <EmptyState>No menu lines yet — add the first one below.</EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2 pr-2">Item</th>
                      <th className="py-2 pr-2 w-20">Qty</th>
                      <th className="py-2 pr-2 w-24">Price</th>
                      <th className="py-2 pr-2 w-14">Tax</th>
                      <th className="py-2 pr-2 w-24 text-right">Total</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {event.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        <td colSpan={6} className="py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <form
                              action={updateEventItem.bind(null, item.id)}
                              className="flex flex-1 flex-wrap items-center gap-2"
                            >
                              <Input
                                name="name"
                                defaultValue={item.name}
                                className="min-w-40 flex-1"
                              />
                              <Input
                                name="quantity"
                                type="number"
                                step="0.01"
                                defaultValue={num(item.quantity)}
                                className="w-20"
                              />
                              <Input
                                name="unitPrice"
                                type="number"
                                step="0.01"
                                defaultValue={num(item.unitPrice)}
                                className="w-24"
                              />
                              <label className="flex items-center gap-1 text-xs text-slate-500">
                                <input
                                  type="checkbox"
                                  name="taxable"
                                  defaultChecked={item.taxable}
                                />
                                tax
                              </label>
                              <span className="w-24 text-right tabular-nums">
                                {money(
                                  lineTotal({
                                    quantity: num(item.quantity),
                                    unitPrice: num(item.unitPrice),
                                    taxable: item.taxable,
                                  }),
                                )}
                              </span>
                              <Button type="submit" variant="secondary">
                                Save
                              </Button>
                            </form>
                            <form action={deleteEventItem.bind(null, item.id)}>
                              <Button type="submit" variant="ghost">
                                Remove
                              </Button>
                            </form>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            {titleCase(item.category)}
                            {item.description ? ` · ${item.description}` : ""}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <AddMenuLine
                action={addEventItem.bind(null, event.id)}
                guestCount={event.guestCount}
                menuItems={menuItems.map((item) => ({
                  id: item.id,
                  name: item.name,
                  category: item.category,
                  price: num(item.price),
                  unit: item.unit,
                }))}
              />
            </div>
          </Card>

          <Card title="Event details">
            <form action={updateEvent.bind(null, event.id)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Event name" className="sm:col-span-2">
                  <Input name="name" defaultValue={event.name} required />
                </Field>
                <Field label="Client">
                  <Select name="clientId" defaultValue={event.clientId}>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Status">
                  <Select name="status" defaultValue={event.status}>
                    {(Object.values(EventStatus) as string[]).map((status) => (
                      <option key={status} value={status}>
                        {titleCase(status)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Event type">
                  <Input name="eventType" defaultValue={event.eventType ?? ""} />
                </Field>
                <Field label="Service style">
                  <Select name="serviceType" defaultValue={event.serviceType}>
                    {(Object.values(ServiceType) as string[]).map((type) => (
                      <option key={type} value={type}>
                        {titleCase(type)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Guests">
                  <Input
                    name="guestCount"
                    type="number"
                    min={0}
                    defaultValue={event.guestCount}
                  />
                </Field>
                <Field label="Venue">
                  <Select name="venueId" defaultValue={event.venueId ?? ""}>
                    <option value="">— Off-site —</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Room / area">
                  <Input name="room" defaultValue={event.room ?? ""} />
                </Field>
                <Field label="Site address">
                  <Input name="siteAddress" defaultValue={event.siteAddress ?? ""} />
                </Field>
                <Field label="Start">
                  <Input
                    name="startAt"
                    type="datetime-local"
                    defaultValue={toDateTimeInput(event.startAt)}
                    required
                  />
                </Field>
                <Field label="End">
                  <Input
                    name="endAt"
                    type="datetime-local"
                    defaultValue={toDateTimeInput(event.endAt)}
                    required
                  />
                </Field>
                <Field label="Staff arrival">
                  <Input
                    name="arrivalAt"
                    type="datetime-local"
                    defaultValue={toDateTimeInput(event.arrivalAt)}
                  />
                </Field>
                <Field label="Service charge %">
                  <Input
                    name="serviceChargePct"
                    type="number"
                    step="0.5"
                    defaultValue={num(event.serviceChargePct)}
                  />
                </Field>
                <Field label="Tax %">
                  <Input
                    name="taxPct"
                    type="number"
                    step="0.5"
                    defaultValue={num(event.taxPct)}
                  />
                </Field>
                <Field label="Discount">
                  <Input
                    name="discount"
                    type="number"
                    step="0.01"
                    defaultValue={num(event.discount)}
                  />
                </Field>
                <Field label="Client notes" className="sm:col-span-2">
                  <Textarea name="clientNotes" defaultValue={event.clientNotes ?? ""} />
                </Field>
                <Field label="Kitchen notes" className="sm:col-span-2">
                  <Textarea name="kitchenNotes" defaultValue={event.kitchenNotes ?? ""} />
                </Field>
                <Field label="Staff notes" className="sm:col-span-2">
                  <Textarea name="staffNotes" defaultValue={event.staffNotes ?? ""} />
                </Field>
              </div>
              <Button type="submit">Save event</Button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Financials">
            <dl className="space-y-1 text-sm">
              {[
                ["Subtotal", totals.subtotal],
                ["Discount", -totals.discount],
                [`Service charge (${num(event.serviceChargePct)}%)`, totals.serviceCharge],
                [`Tax (${num(event.taxPct)}%)`, totals.tax],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="tabular-nums">{money(value as number)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold dark:border-slate-700">
                <dt>Total</dt>
                <dd className="tabular-nums">{money(totals.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Paid</dt>
                <dd className="tabular-nums">{money(totals.paid)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Balance</dt>
                <dd className="tabular-nums">{money(totals.balance)}</dd>
              </div>
              {event.guestCount > 0 && (
                <div className="flex justify-between text-xs text-slate-400">
                  <dt>Per guest</dt>
                  <dd>{money(totals.total / event.guestCount)}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Payments">
            <form
              action={addPayment.bind(null, event.id)}
              className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            >
              <Field label="Amount">
                <Input name="amount" type="number" step="0.01" required />
              </Field>
              <Field label="Method">
                <Select name="method" defaultValue="CARD">
                  <option value="CARD">Card</option>
                  <option value="CASH">Cash</option>
                  <option value="CHECK">Check</option>
                  <option value="ACH">ACH / e-transfer</option>
                  <option value="OTHER">Other</option>
                </Select>
              </Field>
              <Button type="submit">Record</Button>
            </form>
            <ul className="mt-3 space-y-2 text-sm">
              {event.payments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-2">
                  <span>
                    {money(num(payment.amount))}{" "}
                    <span className="text-xs text-slate-400">
                      {paymentMethodLabel[payment.method] ?? payment.method} ·{" "}
                      {formatDate(payment.receivedAt)}
                    </span>
                  </span>
                  <form action={deletePayment.bind(null, payment.id)}>
                    <Button variant="ghost" type="submit">
                      Void
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Deposit schedule">
            <form
              action={addScheduledPayment.bind(null, event.id)}
              className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
            >
              <Field label="Label">
                <Input name="label" placeholder="50% deposit" />
              </Field>
              <Field label="Amount">
                <Input name="amount" type="number" step="0.01" required />
              </Field>
              <Field label="Due">
                <Input name="dueAt" type="datetime-local" />
              </Field>
              <Button type="submit">Add</Button>
            </form>
            <ul className="mt-3 space-y-2 text-sm">
              {event.scheduled.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <span className={item.paid ? "text-slate-400 line-through" : ""}>
                    {item.label} · {money(num(item.amount))}{" "}
                    <span className="text-xs text-slate-400">
                      due {formatDate(item.dueAt)}
                    </span>
                  </span>
                  <span className="flex gap-1">
                    <form action={toggleScheduledPayment.bind(null, item.id)}>
                      <Button variant="ghost" type="submit">
                        {item.paid ? "Unpay" : "Mark paid"}
                      </Button>
                    </form>
                    <form action={deleteScheduledPayment.bind(null, item.id)}>
                      <Button variant="ghost" type="submit">
                        ✕
                      </Button>
                    </form>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Shifts & staffing">
            <form
              action={addShift.bind(null, event.id)}
              className="grid gap-2 sm:grid-cols-2 sm:items-end"
            >
              <Field label="Position">
                <Input name="position" placeholder="Server" />
              </Field>
              <Field label="Assign staff">
                <Select name="staffId" defaultValue="">
                  <option value="">— Unassigned —</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Start">
                <Input
                  name="startAt"
                  type="datetime-local"
                  defaultValue={toDateTimeInput(event.arrivalAt ?? event.startAt)}
                  required
                />
              </Field>
              <Field label="End">
                <Input
                  name="endAt"
                  type="datetime-local"
                  defaultValue={toDateTimeInput(event.endAt)}
                  required
                />
              </Field>
              <Button type="submit" className="sm:col-span-2">
                Add shift
              </Button>
            </form>
            <ul className="mt-3 space-y-2 text-sm">
              {event.shifts.map((shift) => (
                <li key={shift.id} className="flex items-center justify-between gap-2">
                  <span>
                    {shift.position} — {shift.staff?.name ?? "Unassigned"}
                    <span className="block text-xs text-slate-400">
                      {formatTime(shift.startAt)}–{formatTime(shift.endAt)}
                    </span>
                  </span>
                  <form action={deleteShift.bind(null, shift.id)}>
                    <Button variant="ghost" type="submit">
                      ✕
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Checklist">
            <form
              action={addTask.bind(null, event.id)}
              className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end"
            >
              <Field label="Task">
                <Input name="title" required placeholder="Confirm final guest count" />
              </Field>
              <Field label="Due">
                <Input name="dueAt" type="datetime-local" />
              </Field>
              <Button type="submit">Add</Button>
            </form>
            <ul className="mt-3 space-y-2 text-sm">
              {event.tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-2">
                  <form action={toggleTask.bind(null, task.id)}>
                    <button
                      type="submit"
                      className={
                        task.done
                          ? "text-left text-slate-400 line-through"
                          : "text-left hover:underline"
                      }
                    >
                      {task.title}
                      {task.dueAt && (
                        <span className="block text-xs text-slate-400">
                          due {formatDateTime(task.dueAt)}
                        </span>
                      )}
                    </button>
                  </form>
                  <form action={deleteTask.bind(null, task.id)}>
                    <Button variant="ghost" type="submit">
                      ✕
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
