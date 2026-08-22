import Link from "next/link";
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
import { formatDate, formatDateTime, money, titleCase } from "@/lib/format";
import { num } from "@/lib/event-summary";
import { leadTone } from "@/lib/status";
import { LeadStatus, ServiceType } from "@/generated/prisma/enums";
import { getLeadPipeline } from "@/services/leads";
import { createLead, setLeadStatus } from "./actions";

export const dynamic = "force-dynamic";

const NEXT_STAGE: Partial<Record<LeadStatus, LeadStatus>> = {
  NEW: LeadStatus.CONTACTED,
  CONTACTED: LeadStatus.QUALIFIED,
  QUALIFIED: LeadStatus.PROPOSAL,
  PROPOSAL: LeadStatus.FOLLOW_UP,
  FOLLOW_UP: LeadStatus.DECISION,
  DECISION: LeadStatus.WON,
};

export default async function LeadsPage() {
  const { stages, openCount, pipelineValue } = await getLeadPipeline();

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle={`${openCount} active · ${money(pipelineValue)} stated pipeline value`}
        action={
          <Link href="/leads/history">
            <Button variant="secondary">Won / lost history</Button>
          </Link>
        }
      />

      <div className="mb-6 overflow-x-auto pb-2">
        <div className="grid min-w-[1180px] grid-cols-6 gap-3">
          {stages.map(({ status, count, leads, truncated }) => (
            <Card
              key={status}
              title={
                <span className="flex items-center gap-2">
                  {titleCase(status)}
                  <Badge tone={leadTone[status]}>{count}</Badge>
                </span>
              }
            >
              {leads.length === 0 ? (
                <EmptyState>Nothing here.</EmptyState>
              ) : (
                <ul className="space-y-3">
                  {leads.map((lead) => {
                    const next = NEXT_STAGE[status];
                    const location = lead.venue?.name ?? lead.generalLocation;
                    return (
                      <li
                        key={lead.id}
                        className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800"
                      >
                        <Link className="font-medium hover:underline" href={`/leads/${lead.id}`}>
                          {lead.companyName || lead.contactName}
                        </Link>
                        {lead.companyName && (
                          <p className="text-xs text-slate-500">{lead.contactName}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                          {lead.eventType ?? "Event type TBD"}
                          {lead.serviceType ? ` · ${titleCase(lead.serviceType)}` : ""}
                        </p>
                        <p className="text-xs text-slate-500">
                          {lead.eventDate ? formatDate(lead.eventDate) : "Date TBD"}
                          {lead.guestCount ? ` · ${lead.guestCount} guests` : ""}
                        </p>
                        {location && <p className="truncate text-xs text-slate-400">{location}</p>}
                        {lead.budget && (
                          <p className="mt-1 text-xs font-medium">{money(num(lead.budget))}</p>
                        )}
                        {lead.nextAction && (
                          <p className="mt-2 text-xs">
                            <span className="text-slate-400">Next:</span> {lead.nextAction}
                          </p>
                        )}
                        {lead.followUpAt && (
                          <p className="text-xs text-amber-600">
                            Follow up {formatDateTime(lead.followUpAt)}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-1">
                          <Link href={`/leads/${lead.id}`}>
                            <Button variant="secondary" className="h-7 px-2 text-xs">
                              Open
                            </Button>
                          </Link>
                          {next && (
                            <form action={setLeadStatus.bind(null, lead.id, next)}>
                              <Button type="submit" variant="ghost" className="h-7 px-2 text-xs">
                                → {titleCase(next)}
                              </Button>
                            </form>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {truncated && (
                <p className="mt-3 text-xs text-slate-400">
                  Showing the 30 most relevant records in this stage.
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Card title="New inquiry">
        <form action={createLead} className="grid gap-4 lg:grid-cols-4">
          <Field label="Contact name">
            <Input name="contactName" required placeholder="Sarah Smith" />
          </Field>
          <Field label="Company">
            <Input name="companyName" placeholder="Acme Corp" />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" />
          </Field>
          <Field label="Phone">
            <Input name="phone" />
          </Field>

          <Field label="Preferred contact">
            <Select name="preferredContactMethod" defaultValue="">
              <option value="">No preference</option>
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
              <option value="Text">Text</option>
            </Select>
          </Field>
          <Field label="Lead source">
            <Select name="source" defaultValue="Website">
              <option>Website</option>
              <option>Google</option>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>Venue referral</option>
              <option>Planner referral</option>
              <option>Past client</option>
              <option>Corporate referral</option>
              <option>Phone</option>
              <option>Walk-in</option>
              <option>Other</option>
            </Select>
          </Field>
          <Field label="Event type">
            <Select name="eventType" defaultValue="">
              <option value="">Select type…</option>
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
            <Select name="serviceType" defaultValue="">
              <option value="">Not decided</option>
              {(Object.values(ServiceType) as string[]).map((value) => (
                <option key={value} value={value}>{titleCase(value)}</option>
              ))}
            </Select>
          </Field>

          <Field label="Event date">
            <Input name="eventDate" type="date" />
          </Field>
          <Field label="Approx. start">
            <Input name="approximateStartAt" type="datetime-local" />
          </Field>
          <Field label="Guests">
            <Input name="guestCount" type="number" min={0} />
          </Field>
          <Field label="Budget">
            <Input name="budget" type="number" step="0.01" />
          </Field>

          <Field label="Known venue">
            <AsyncSearchSelect
              name="venueId"
              endpoint="/api/search?type=venues"
              placeholder="Search venue…"
            />
          </Field>
          <Field label="General location">
            <Input name="generalLocation" placeholder="Vancouver, client home, TBD…" />
          </Field>
          <Field label="Next action">
            <Input name="nextAction" placeholder="Call to qualify" />
          </Field>
          <Field label="Follow up">
            <Input name="followUpAt" type="datetime-local" />
          </Field>

          <div className="flex flex-wrap gap-4 lg:col-span-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="dateFlexible" /> Date is flexible
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="venueConfirmed" /> Venue is confirmed
            </label>
          </div>

          <Field label="Inquiry / notes" className="lg:col-span-4">
            <Textarea
              name="notes"
              placeholder="What are they looking for? Special requests, dietary information, context…"
            />
          </Field>
          <input type="hidden" name="status" value={LeadStatus.NEW} />
          <div className="lg:col-span-4">
            <Button type="submit">Create lead</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
