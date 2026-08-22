import Link from "next/link";
import { Button, Card, EmptyState, Input, PageHeader } from "@/components/ui";
import { money } from "@/lib/format";
import { measureAsync } from "@/lib/performance";
import { CLIENT_PAGE_SIZE, getClientPage } from "@/services/clients";

export const dynamic = "force-dynamic";

function pageHref(q: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return `/clients${search ? `?${search}` : ""}`;
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: rawQuery, page: rawPage } = await searchParams;
  const q = rawQuery?.trim() || undefined;
  const requestedPage = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const { rows: clients, totalClients, totalPages, page } = await measureAsync(
    "clients.page",
    () => getClientPage(q, requestedPage),
  );

  const firstShown = totalClients === 0 ? 0 : (page - 1) * CLIENT_PAGE_SIZE + 1;
  const lastShown = Math.min(page * CLIENT_PAGE_SIZE, totalClients);

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={
          totalClients === 0
            ? "No clients"
            : `${firstShown}–${lastShown} of ${totalClients} client${totalClients === 1 ? "" : "s"}`
        }
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
          <EmptyState>{q ? "No clients match this search." : "No clients yet."}</EmptyState>
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
                {clients.map((client) => (
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
                    <td className="py-2 pr-4 text-right">{client.eventCount}</td>
                    <td className="py-2 text-right">{money(client.lifetimeValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
            <div>
              {page > 1 ? (
                <Link className="underline" href={pageHref(q, page - 1)}>
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
            </div>
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div>
              {page < totalPages ? (
                <Link className="underline" href={pageHref(q, page + 1)}>
                  Next →
                </Link>
              ) : (
                <span />
              )}
            </div>
          </nav>
        )}
      </Card>
    </>
  );
}
