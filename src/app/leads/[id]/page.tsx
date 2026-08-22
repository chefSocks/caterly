import Link from "next/link";
import { notFound } from "next/navigation";
import { AsyncSearchSelect } from "@/components/AsyncSearchSelect";
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
import { LeadStatus, ServiceType } from "@/generated/prisma/enums";
import {
  formatDate,
  formatDateTime,
  money,
  titleCase,
  toDateTimeInput,
} from "@/lib/format";
import { num, summarize } from "@/lib/event-summary";
import { leadTone } from "@/lib/status";
import { getLeadWorkspace } from "@/services/leads";
import {
  addLeadActivity,
  convertLead,
  deleteLead,
  setLeadStatus,
  updateLead,
} from "../actions";
import { createProposal } from "../proposal-actions";

export const dynamic = "force-dynamic";

const PIPELINE = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.QUALIFIED,
  LeadStatus.PROPOSAL,
  LeadStatus.FOLLOW_UP,
  LeadStatus.DECISION,
] as const;

function toDateInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadWorkspace(id);
  if (!lead) notFound();

  const location = lead.venue?.name ?? lead.generalLocation ?? "Location TBD";
  const subtitle = [
    lead.eventType ?? "Event type TBD",
    lead.eventDate ? formatDate(lead.eventDate) : "Date TBD",
    lead.guestCount ? `${lead.guestCount} guests` : null,
    lead.serviceType ? titleCase(lead.serviceType) : null,
    location,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageHeader
        title={lead.companyName || lead.contactName}
        subtitle={subtitle}
        action={
          <div className="flex flex-wrap gap-2">
            {lead.status !== LeadStatus.WON && lead.status !== LeadStatus.LOST && (
              <form action={convertLead.bind(null, lead.id)}>
                <Button type="submit">Book event</Button>
              </form>
            )}
            <Link href="/leads">
              <Button variant="secondary">Pipeline</Button>
            </Link>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge tone={leadTone[lead.status]}>{titleCase(lead.status)}</Badge>
        {PIPELINE.filter((stage) => stage !== lead.status).map((stage) => (
          <form key={stage} action={setLeadStatus.bind(null, lead.id, stage)}>
            <Button variant="ghost" className="h-8 px-2 text-xs" type="submit">
              → {titleCase(stage)}
            </Button>
          </form>
        ))}
        {lead.status !== LeadStatus.WON && (
          <form action={setLeadStatus.bind(null, lead.id, LeadStatus.WON)}>
            <Button variant="ghost" className="h-8 px-2 text-xs" type="submit">
              → Won
            </Button>
          </form>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <Card title="Lead & event details">
            <form action={updateLead.bind(null, lead.id)} className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact name">
                <Input name="contactName" defaultValue={lead.contactName} required />
              </Field>
              <Field label="Company">
                <Input name="companyName" defaultValue={lead.companyName ?? ""} />
              </Field>
              <Field label="Email">
                <Input name="email" type="email" defaultValue={lead.email ?? ""} />
              </Field>
              <Field label="Phone">
                <Input name="phone" defaultValue={lead.phone ?? ""} />
              </Field>
              <Field label="Preferred contact">
                <Select name="preferredContactMethod" defaultValue={lead.preferredContactMethod ?? ""}>
                  <option value="">No preference</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="Text">Text</option>
                </Select>
              </Field>
              <Field label="Source">
                <Input name="source" defaultValue={lead.source ?? ""} />
              </Field>

              <Field label="Event type">
                <Select name="eventType" defaultValue={lead.eventType ?? ""}>
                  <option value="">Not decided</option>
                  <option>Wedding</option>
                  <option>Corporate</option>
                  <option>Social</option>
                  <option>Fundraiser</option>
                  <option>Celebration</option>
                  <option>Holiday</option>
                  <option>Other</option>
                </Select>
              </Field>
              <Field label="Service style">
                <Select name="serviceType" defaultValue={lead.serviceType ?? ""}>
                  <option value="">Not decided</option>
                  {(Object.values(ServiceType) as string[]).map((value) => (
                    <option key={value} value={value}>{titleCase(value)}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Event date">
                <Input name="eventDate" type="date" defaultValue={toDateInput(lead.eventDate)} />
              </Field>
              <Field label="Approx. start">
                <Input
                  name="approximateStartAt"
                  type="datetime-local"
                  defaultValue={toDateTimeInput(lead.approximateStartAt)}
                />
              </Field>
              <Field label="Guests">
                <Input name="guestCount" type="number" min={0} defaultValue={lead.guestCount ?? ""} />
              </Field>
              <Field label="Budget">
                <Input name="budget" type="number" step="0.01" defaultValue={lead.budget ? num(lead.budget) : ""} />
              </Field>

              <Field label="Venue">
                <AsyncSearchSelect
                  name="venueId"
                  endpoint="/api/search?type=venues"
                  placeholder="Search venue…"
                  defaultOption={
                    lead.venue
                      ? {
                          id: lead.venue.id,
                          label: lead.venue.name,
                          description: lead.venue.address,
                        }
                      : null
                  }
                />
              </Field>
              <Field label="General location">
                <Input name="generalLocation" defaultValue={lead.generalLocation ?? ""} />
              </Field>

              <Field label="Next action">
                <Input name="nextAction" defaultValue={lead.nextAction ?? ""} placeholder="Send sample menu" />
              </Field>
              <Field label="Follow up">
                <Input
                  name="followUpAt"
                  type="datetime-local"
                  defaultValue={toDateTimeInput(lead.followUpAt)}
                />
              </Field>

              <div className="flex flex-wrap gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="dateFlexible" defaultChecked={lead.dateFlexible} />
                  Date is flexible
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="venueConfirmed" defaultChecked={lead.venueConfirmed} />
                  Venue is confirmed
                </label>
              </div>

              <Field label="Inquiry / notes" className="sm:col-span-2">
                <Textarea name="notes" defaultValue={lead.notes ?? ""} />
              </Field>
              <div className="sm:col-span-2">
                <Button type="submit">Save lead</Button>
              </div>
            </form>
          </Card>

          <Card
            title="Proposals"
            action={
              lead.status !== LeadStatus.WON && lead.status !== LeadStatus.LOST ? (
                <form action={createProposal.bind(null, lead.id)}>
                  <Button type="submit">Create proposal</Button>
                </form>
              ) : null
            }
          >
            {lead.proposals.length === 0 ? (
              <EmptyState>No proposal yet. Create a draft from the information already captured on this lead.</EmptyState>
            ) : (
              <div className="space-y-2">
                {lead.proposals.map((proposal) => {
                  const totals = summarize({ ...proposal, payments: [] });
                  return (
                    <Link
                      key={proposal.id}
                      href={`/leads/${lead.id}/proposals/${proposal.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      <div>
                        <p className="font-medium">V{proposal.version} · {proposal.title}</p>
                        <p className="text-xs text-slate-400">
                          {titleCase(proposal.status)} · created {formatDate(proposal.createdAt)}
                        </p>
                      </div>
                      <span className="font-medium tabular-nums">{money(totals.total)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Sales focus">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase text-slate-400">Next action</dt>
                <dd className="font-medium">{lead.nextAction ?? "No next action set"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-400">Follow up</dt>
                <dd>{lead.followUpAt ? formatDateTime(lead.followUpAt) : "No follow-up scheduled"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-400">Budget</dt>
                <dd>{lead.budget ? money(num(lead.budget)) : "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-400">Existing client</dt>
                <dd>
                  {lead.client ? (
                    <Link className="hover:underline" href={`/clients/${lead.client.id}`}>
                      {lead.client.name}
                    </Link>
                  ) : (
                    "Not linked"
                  )}
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Mark lost">
            <form action={setLeadStatus.bind(null, lead.id, LeadStatus.LOST)} className="space-y-2">
              <Select name="lostReason" defaultValue={lead.lostReason ?? ""}>
                <option value="">Select reason…</option>
                <option>Price</option>
                <option>Date unavailable</option>
                <option>Venue issue</option>
                <option>Menu/service mismatch</option>
                <option>Went with competitor</option>
                <option>No response</option>
                <option>Client cancelled event</option>
                <option>Budget</option>
                <option>Internal capacity</option>
                <option>Other</option>
              </Select>
              <Button type="submit" variant="secondary">Mark lost</Button>
            </form>
          </Card>

          <Card title="Activity">
            <form action={addLeadActivity.bind(null, lead.id)} className="mb-4 space-y-2">
              <Textarea name="message" placeholder="Called client; awaiting venue confirmation…" required />
              <Button type="submit" variant="secondary">Add note</Button>
            </form>
            {lead.activities.length === 0 ? (
              <EmptyState>No activity yet.</EmptyState>
            ) : (
              <ol className="space-y-3 text-sm">
                {lead.activities.map((activity) => (
                  <li key={activity.id} className="border-l-2 border-slate-200 pl-3 dark:border-slate-700">
                    <p>{activity.message}</p>
                    <p className="text-xs text-slate-400">
                      {titleCase(activity.kind)} · {formatDateTime(activity.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title="Record controls">
            <form action={deleteLead.bind(null, lead.id)}>
              <Button variant="danger" type="submit">Delete lead</Button>
            </form>
            <p className="mt-2 text-xs text-slate-400">
              Normal lost leads should be marked Lost rather than deleted so conversion history stays useful.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
