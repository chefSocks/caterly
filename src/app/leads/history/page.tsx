import Link from "next/link";
import { Badge, Button, Card, EmptyState, Input, PageHeader } from "@/components/ui";
import { formatDate, money, titleCase } from "@/lib/format";
import { num } from "@/lib/event-summary";
import { leadTone } from "@/lib/status";
import { getLeadHistory } from "@/services/leads";

export const dynamic = "force-dynamic";

function href(q: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return `/leads/history${search ? `?${search}` : ""}`;
}

export default async function LeadHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: rawQuery, page: rawPage } = await searchParams;
  const q = rawQuery?.trim() || undefined;
  const requestedPage = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
  const { rows, count, page, totalPages, pageSize } = await getLeadHistory(requestedPage, q);
  const first = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, count);

  return (
    <>
      <PageHeader
        title="Lead history"
        subtitle={count ? `${first}–${last} of ${count} won/lost leads` : "No won/lost leads"}
        action={
          <Link href="/leads">
            <Button variant="secondary">Active pipeline</Button>
          </Link>
        }
      />

      <form className="mb-4 flex max-w-md gap-2">
        <Input name="q" placeholder="Search contact, company, or email…" defaultValue={q ?? ""} />
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <Card>
        {rows.length === 0 ? (
          <EmptyState>{q ? "No historical leads match this search." : "No won or lost leads yet."}</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Lead</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Event</th>
                  <th className="py-2 pr-4">Source / reason</th>
                  <th className="py-2 text-right">Budget</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((lead) => (
                  <tr key={lead.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-2 pr-4">
                      <Link className="font-medium hover:underline" href={`/leads/${lead.id}`}>
                        {lead.companyName || lead.contactName}
                      </Link>
                      {lead.companyName && <p className="text-xs text-slate-400">{lead.contactName}</p>}
                    </td>
                    <td className="py-2 pr-4">
                      <Badge tone={leadTone[lead.status]}>{titleCase(lead.status)}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-slate-500">
                      {lead.eventType ?? "Event"}
                      {lead.eventDate ? ` · ${formatDate(lead.eventDate)}` : ""}
                      {lead.guestCount ? ` · ${lead.guestCount} guests` : ""}
                    </td>
                    <td className="py-2 pr-4 text-slate-500">
                      {lead.status === "LOST" ? lead.lostReason ?? "Reason not recorded" : lead.source ?? "—"}
                    </td>
                    <td className="py-2 text-right">{lead.budget ? money(num(lead.budget)) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
            {page > 1 ? <Link className="underline" href={href(q, page - 1)}>← Previous</Link> : <span />}
            <span className="text-slate-500">Page {page} of {totalPages}</span>
            {page < totalPages ? <Link className="underline" href={href(q, page + 1)}>Next →</Link> : <span />}
          </nav>
        )}
      </Card>
    </>
  );
}
