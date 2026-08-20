import { Fragment } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatTime, money, titleCase } from "@/lib/format";
import { num, summarize } from "@/lib/event-summary";
import { lineTotal } from "@/lib/totals";
import { InfoGrid, PrintSheet } from "@/components/PrintSheet";
import { MenuCategory } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export default async function BeoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: {
      client: true,
      venue: true,
      items: { orderBy: { position: "asc" } },
      payments: true,
      scheduled: { orderBy: { dueAt: "asc" } },
      shifts: { orderBy: { startAt: "asc" }, include: { staff: true } },
    },
  });
  if (!event) notFound();

  const totals = summarize(event);
  const categories = Object.values(MenuCategory) as string[];

  return (
    <PrintSheet docTitle={`BEO #${event.number}`} backHref={`/events/${event.id}`}>
      <h2 className="mb-4 text-lg font-semibold">{event.name}</h2>

      <InfoGrid
        rows={[
          ["Client", event.client.name],
          ["Contact", event.client.contactName ?? event.client.email ?? "—"],
          ["Phone", event.client.phone ?? "—"],
          ["Status", titleCase(event.status)],
          ["Date", formatDate(event.startAt)],
          [
            "Service time",
            `${formatTime(event.startAt)} – ${formatTime(event.endAt)}`,
          ],
          ["Staff arrival", event.arrivalAt ? formatTime(event.arrivalAt) : "—"],
          ["Guests", event.guestCount],
          ["Service style", titleCase(event.serviceType)],
          ["Event type", event.eventType ?? "—"],
          [
            "Location",
            event.venue
              ? `${event.venue.name}${event.room ? ` · ${event.room}` : ""}`
              : (event.siteAddress ?? "Client site"),
          ],
          ["Site address", event.siteAddress ?? event.venue?.address ?? "—"],
        ]}
      />

      <h3 className="mb-2 border-b border-slate-300 pb-1 text-sm font-semibold uppercase">
        Menu
      </h3>
      <table className="mb-6 w-full text-sm">
        <tbody>
          {categories.map((category) => {
            const items = event.items.filter((item) => item.category === category);
            if (items.length === 0) return null;
            return (
              <Fragment key={category}>
                <tr>
                  <td
                    colSpan={3}
                    className="pt-3 text-xs font-semibold uppercase text-slate-500"
                  >
                    {titleCase(category)}
                  </td>
                </tr>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-1">
                      {item.name}
                      {item.description && (
                        <span className="block text-xs text-slate-500">
                          {item.description}
                        </span>
                      )}
                    </td>
                    <td className="w-24 py-1 text-right tabular-nums">
                      {num(item.quantity)} × {money(num(item.unitPrice))}
                    </td>
                    <td className="w-24 py-1 text-right tabular-nums">
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
              </Fragment>
            );
          })}
        </tbody>
      </table>

      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 border-b border-slate-300 pb-1 text-sm font-semibold uppercase">
            Staffing
          </h3>
          {event.shifts.length === 0 ? (
            <p className="text-sm text-slate-500">No shifts scheduled.</p>
          ) : (
            <ul className="text-sm">
              {event.shifts.map((shift) => (
                <li key={shift.id} className="flex justify-between gap-2 py-0.5">
                  <span>
                    {shift.position} — {shift.staff?.name ?? "Unassigned"}
                  </span>
                  <span className="text-slate-500">
                    {formatTime(shift.startAt)}–{formatTime(shift.endAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-2 border-b border-slate-300 pb-1 text-sm font-semibold uppercase">
            Financial summary
          </h3>
          <dl className="text-sm">
            {(
              [
                ["Subtotal", totals.subtotal],
                ["Discount", -totals.discount],
                [`Service charge (${num(event.serviceChargePct)}%)`, totals.serviceCharge],
                [`Tax (${num(event.taxPct)}%)`, totals.tax],
                ["Total", totals.total],
                ["Paid to date", totals.paid],
                ["Balance due", totals.balance],
              ] as [string, number][]
            ).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-0.5">
                <dt className="text-slate-500">{label}</dt>
                <dd className="tabular-nums">{money(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {event.scheduled.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 border-b border-slate-300 pb-1 text-sm font-semibold uppercase">
            Payment schedule
          </h3>
          <ul className="text-sm">
            {event.scheduled.map((item) => (
              <li key={item.id} className="flex justify-between py-0.5">
                <span>
                  {item.label} — due {formatDate(item.dueAt)}
                </span>
                <span className="tabular-nums">
                  {money(num(item.amount))} {item.paid ? "(paid)" : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(event.clientNotes || event.staffNotes || event.kitchenNotes) && (
        <div className="mb-6 space-y-3 text-sm">
          {event.clientNotes && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500">
                Client notes
              </h4>
              <p className="whitespace-pre-wrap">{event.clientNotes}</p>
            </div>
          )}
          {event.staffNotes && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500">
                Service notes
              </h4>
              <p className="whitespace-pre-wrap">{event.staffNotes}</p>
            </div>
          )}
          {event.kitchenNotes && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-500">
                Kitchen notes
              </h4>
              <p className="whitespace-pre-wrap">{event.kitchenNotes}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 grid gap-8 text-sm sm:grid-cols-2">
        <div className="border-t border-slate-400 pt-1">Client signature / date</div>
        <div className="border-t border-slate-400 pt-1">Caterer signature / date</div>
      </div>
    </PrintSheet>
  );
}
