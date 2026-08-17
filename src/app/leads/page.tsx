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
import { formatDate, money, titleCase } from "@/lib/format";
import { num } from "@/lib/event-summary";
import { leadTone } from "@/lib/status";
import { LeadStatus } from "@/generated/prisma/enums";
import { convertLead, createLead, deleteLead, setLeadStatus } from "./actions";

export const dynamic = "force-dynamic";

const PIPELINE = ["NEW", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"] as const;

export default async function LeadsPage() {
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
  const open = leads.filter((lead) => lead.status !== "WON" && lead.status !== "LOST");
  const pipelineValue = open.reduce((sum, lead) => sum + num(lead.budget), 0);

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle={`${open.length} open · ${money(pipelineValue)} in pipeline`}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PIPELINE.map((stage) => {
            const stageLeads = leads.filter((lead) => lead.status === stage);
            return (
              <Card
                key={stage}
                title={
                  <span className="flex items-center gap-2">
                    {titleCase(stage)}
                    <Badge tone={leadTone[stage]}>{stageLeads.length}</Badge>
                  </span>
                }
              >
                {stageLeads.length === 0 ? (
                  <EmptyState>Empty</EmptyState>
                ) : (
                  <ul className="space-y-3">
                    {stageLeads.map((lead) => (
                      <li
                        key={lead.id}
                        className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800"
                      >
                        <p className="font-medium">{lead.contactName}</p>
                        {lead.companyName && (
                          <p className="text-slate-500">{lead.companyName}</p>
                        )}
                        <p className="text-xs text-slate-500">
                          {lead.eventDate ? formatDate(lead.eventDate) : "No date"}
                          {lead.guestCount ? ` · ${lead.guestCount} guests` : ""}
                          {lead.budget ? ` · ${money(num(lead.budget))}` : ""}
                        </p>
                        {(lead.email || lead.phone) && (
                          <p className="text-xs text-slate-400">
                            {[lead.email, lead.phone].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {lead.source && (
                          <p className="text-xs text-slate-400">via {lead.source}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-1">
                          {PIPELINE.filter((next) => next !== lead.status).map((next) => (
                            <form
                              key={next}
                              action={setLeadStatus.bind(null, lead.id, next)}
                            >
                              <Button
                                variant="ghost"
                                type="submit"
                                className="h-7 px-2 text-xs"
                              >
                                → {titleCase(next)}
                              </Button>
                            </form>
                          ))}
                        </div>
                        <div className="mt-1 flex gap-1">
                          <form action={convertLead.bind(null, lead.id)}>
                            <Button
                              type="submit"
                              className="h-7 px-2 text-xs"
                              variant="secondary"
                            >
                              Book event
                            </Button>
                          </form>
                          <form action={deleteLead.bind(null, lead.id)}>
                            <Button
                              variant="ghost"
                              type="submit"
                              className="h-7 px-2 text-xs"
                            >
                              Delete
                            </Button>
                          </form>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>

        <Card title="New lead">
          <form action={createLead} className="space-y-3">
            <Field label="Contact name">
              <Input name="contactName" required />
            </Field>
            <Field label="Company">
              <Input name="companyName" />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" />
            </Field>
            <Field label="Phone">
              <Input name="phone" />
            </Field>
            <Field label="Source">
              <Input name="source" placeholder="Website, referral, Instagram…" />
            </Field>
            <Field label="Status">
              <Select name="status" defaultValue="NEW">
                {(Object.values(LeadStatus) as string[]).map((value) => (
                  <option key={value} value={value}>
                    {titleCase(value)}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Event date">
                <Input name="eventDate" type="date" />
              </Field>
              <Field label="Guests">
                <Input name="guestCount" type="number" min={0} />
              </Field>
            </div>
            <Field label="Budget">
              <Input name="budget" type="number" step="0.01" />
            </Field>
            <Field label="Notes">
              <Textarea name="notes" />
            </Field>
            <Button type="submit">Add lead</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
