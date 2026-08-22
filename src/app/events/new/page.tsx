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
  searchParams: Promise<{ clientId?: string; date?: string; leadId?: string }>;
}) {
  const { clientId: requestedClientId, date, leadId } = await searchParams;

  const lead = leadId
    ? await db.lead.findUnique({
        where: { id: leadId },
        select: {
          clientId: true,
          eventDate: true,
          eventType: true,
          serviceType: true,
          guestCount: true,
          generalLocation: true,
          venue: { select: { id: true, name: true, address: true } },
        },
      })
    : null;

  const clientId = lead?.clientId ?? requestedClientId;
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

  const defaultDate =
    date ?? lead?.eventDate?.toISOString().slice(0, 10) ?? toDateInput(new Date());

  return (
    <>
      <PageHeader
        title="Book an event"
        subtitle={lead ? "Known lead details are already carried forward." : "Three steps: client, details, menu & terms."}
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
          defaultDate={defaultDate}
          defaultEventType={lead?.eventType ?? ""}
          defaultServiceType={lead?.serviceType ?? "BUFFET"}
          defaultGuestCount={lead?.guestCount ?? 50}
          defaultVenue={
            lead?.venue
              ? {
                  id: lead.venue.id,
                  label: lead.venue.name,
                  description: lead.venue.address,
                }
              : null
          }
          defaultSiteAddress={lead?.generalLocation ?? ""}
        />
      </div>
    </>
  );
}
