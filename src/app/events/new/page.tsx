import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { toDateInput } from "@/lib/format";
import { num } from "@/lib/event-summary";
import { BookingWizard } from "./BookingWizard";
import { createEvent } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; date?: string }>;
}) {
  const { clientId, date } = await searchParams;
  const [clients, venues, packages] = await Promise.all([
    db.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.venue.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.menuPackage.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Book an event"
        subtitle="Three steps: client, details, menu & terms."
      />
      <div className="max-w-4xl">
        <BookingWizard
          action={createEvent}
          clients={clients}
          venues={venues}
          packages={packages.map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            pricePerGuest: num(pkg.pricePerGuest),
          }))}
          defaultClientId={clientId}
          defaultDate={date ?? toDateInput(new Date())}
        />
      </div>
    </>
  );
}
