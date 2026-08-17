import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { formatDate, money, plural, titleCase } from "@/lib/format";
import { summarize } from "@/lib/event-summary";
import { ClientForm } from "../ClientForm";
import { deleteClient, updateClient } from "../actions";

export const dynamic = "force-dynamic";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await db.client.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { startAt: "desc" },
        include: { items: true, payments: true },
      },
    },
  });
  if (!client) notFound();

  const lifetime = client.events.reduce(
    (sum, event) => sum + summarize(event).total,
    0,
  );

  return (
    <>
      <PageHeader
        title={client.name}
        subtitle={`${plural(client.events.length, "event")} · ${money(lifetime)} lifetime value`}
        action={
          <div className="flex gap-2">
            <Link href={`/events/new?clientId=${client.id}`}>
              <Button variant="secondary">Book event</Button>
            </Link>
            <form action={deleteClient.bind(null, client.id)}>
              <Button variant="danger" type="submit">
                Delete
              </Button>
            </form>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ClientForm
          action={updateClient.bind(null, client.id)}
          client={client}
          submitLabel="Save changes"
        />

        <Card title="Event history">
          {client.events.length === 0 ? (
            <EmptyState>No events booked yet.</EmptyState>
          ) : (
            <ul className="space-y-3 text-sm">
              {client.events.map((event) => (
                <li key={event.id} className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      className="font-medium hover:underline"
                      href={`/events/${event.id}`}
                    >
                      {event.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {formatDate(event.startAt)} · {titleCase(event.status)}
                    </p>
                  </div>
                  <span className="shrink-0">{money(summarize(event).total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
