import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatTime, titleCase } from "@/lib/format";
import { num } from "@/lib/event-summary";
import { InfoGrid, PrintSheet } from "@/components/PrintSheet";

export const dynamic = "force-dynamic";

type Rollup = Map<string, { quantity: number; unit: string }>;

function add(rollup: Rollup, key: string, quantity: number, unit: string) {
  const existing = rollup.get(`${key}|${unit}`);
  rollup.set(`${key}|${unit}`, {
    quantity: (existing?.quantity ?? 0) + quantity,
    unit,
  });
}

export default async function KitchenSheetPage({
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
      items: {
        orderBy: { position: "asc" },
        include: {
          menuItem: { include: { recipeLines: true, packingLines: true } },
        },
      },
    },
  });
  if (!event) notFound();

  const ingredients: Rollup = new Map();
  const equipment: Rollup = new Map();

  for (const item of event.items) {
    const quantity = num(item.quantity);
    for (const line of item.menuItem?.recipeLines ?? []) {
      add(ingredients, line.ingredient, num(line.quantity) * quantity, line.unit);
    }
    for (const line of item.menuItem?.packingLines ?? []) {
      add(equipment, line.equipment, num(line.quantity) * quantity, line.unit);
    }
  }

  const rows = (rollup: Rollup) =>
    [...rollup.entries()]
      .map(([key, value]) => ({ name: key.split("|")[0], ...value }))
      .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <PrintSheet
      docTitle={`Kitchen sheet #${event.number}`}
      backHref={`/events/${event.id}`}
    >
      <h2 className="mb-4 text-lg font-semibold">{event.name}</h2>

      <InfoGrid
        rows={[
          ["Date", formatDate(event.startAt)],
          ["Service time", `${formatTime(event.startAt)} – ${formatTime(event.endAt)}`],
          ["Guests", event.guestCount],
          ["Service style", titleCase(event.serviceType)],
          ["Client", event.client.name],
          [
            "Location",
            event.venue?.name ?? event.siteAddress ?? "Client site",
          ],
        ]}
      />

      <h3 className="mb-2 border-b border-slate-300 pb-1 text-sm font-semibold uppercase">
        Production list
      </h3>
      <table className="mb-6 w-full text-sm">
        <tbody>
          {event.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-1">
                {item.name}
                <span className="block text-xs text-slate-500">
                  {titleCase(item.category)}
                  {item.description ? ` · ${item.description}` : ""}
                </span>
              </td>
              <td className="w-20 py-1 text-right tabular-nums">
                {num(item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 border-b border-slate-300 pb-1 text-sm font-semibold uppercase">
            Shopping / prep list
          </h3>
          {ingredients.size === 0 ? (
            <p className="text-sm text-slate-500">
              No recipes attached to these menu items yet.
            </p>
          ) : (
            <ul className="text-sm">
              {rows(ingredients).map((row) => (
                <li key={`${row.name}${row.unit}`} className="flex justify-between py-0.5">
                  <span>{row.name}</span>
                  <span className="tabular-nums">
                    {row.quantity.toFixed(2)} {row.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-2 border-b border-slate-300 pb-1 text-sm font-semibold uppercase">
            Packing list
          </h3>
          {equipment.size === 0 ? (
            <p className="text-sm text-slate-500">
              No equipment attached to these menu items yet.
            </p>
          ) : (
            <ul className="text-sm">
              {rows(equipment).map((row) => (
                <li key={`${row.name}${row.unit}`} className="flex justify-between py-0.5">
                  <span>☐ {row.name}</span>
                  <span className="tabular-nums">
                    {row.quantity.toFixed(2)} {row.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {event.kitchenNotes && (
        <div className="mt-6 text-sm">
          <h4 className="text-xs font-semibold uppercase text-slate-500">
            Kitchen notes
          </h4>
          <p className="whitespace-pre-wrap">{event.kitchenNotes}</p>
        </div>
      )}
    </PrintSheet>
  );
}
