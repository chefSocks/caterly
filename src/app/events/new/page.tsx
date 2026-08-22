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
  const [defaultClient, packages] = await Promise.all([
    clientId
      ? db.client.findUnique({
          where: { id: clientId },
          select: { id: true, name: true, contactName: true, email: true },
        })
      : Promise.resolve(null),
    db.menuPackage.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, pricePerGuest: true },
      take: 100,
    }),
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
          packages={packages.map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            pricePerGuest: num(pkg.pricePerGuest),
          }))}
          defaultClient={
            defaultClient
              ? {
                  id: defaultClient.id,
                  label: defaultClient.name,
                  description:
                    [defaultClient.contactName, defaultClient.email]
                      .filter(Boolean)
                      .join(" · ") || null,
                }
              : null
          }
          defaultDate={date ?? toDateInput(new Date())}
        />
      </div>
    </>
  );
}
