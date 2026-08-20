import Link from "next/link";
import { db } from "@/lib/db";
import { Button, Card, EmptyState, Input, PageHeader } from "@/components/ui";
import { money } from "@/lib/format";
import { summarize } from "@/lib/event-summary";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await db.client.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { contactName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    include: { events: { include: { items: true, payments: true } } },
  });

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} client${clients.length === 1 ? "" : "s"}`}
        action={
          <Link href="/clients/new">
            <Button>New client</Button>
          </Link>
        }
      />

      <form className="mb-4 flex max-w-sm gap-2">
        <Input name="q" placeholder="Search clients…" defaultValue={q ?? ""} />
        <Button variant="secondary" type="submit">
          Search
        </Button>
      </form>

      <Card>
        {clients.length === 0 ? (
          <EmptyState>No clients yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Contact</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4 text-right">Events</th>
                  <th className="py-2 text-right">Lifetime value</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const value = client.events.reduce(
                    (sum, event) => sum + summarize(event).total,
                    0,
                  );
                  return (
                    <tr
                      key={client.id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="py-2 pr-4 font-medium">
                        <Link className="hover:underline" href={`/clients/${client.id}`}>
                          {client.name}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 text-slate-500">
                        {client.contactName ?? "—"}
                      </td>
                      <td className="py-2 pr-4 text-slate-500">{client.phone ?? "—"}</td>
                      <td className="py-2 pr-4 text-right">{client.events.length}</td>
                      <td className="py-2 text-right">{money(value)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
