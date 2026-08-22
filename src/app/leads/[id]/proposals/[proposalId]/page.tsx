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
import { MenuCategory, ProposalStatus } from "@/generated/prisma/enums";
import { formatDate, money, titleCase } from "@/lib/format";
import { num, summarize } from "@/lib/event-summary";
import { getProposalWorkspace } from "@/services/leads";
import {
  addCustomProposalItem,
  addProposalItem,
  createProposalRevision,
  deleteProposalItem,
  setProposalStatus,
  updateProposal,
  updateProposalItem,
} from "../../../proposal-actions";

export const dynamic = "force-dynamic";

function proposalTone(status: ProposalStatus) {
  if (status === ProposalStatus.ACCEPTED) return "green" as const;
  if (status === ProposalStatus.REJECTED) return "red" as const;
  if (status === ProposalStatus.SENT || status === ProposalStatus.READY) return "blue" as const;
  if (status === ProposalStatus.SUPERSEDED) return "slate" as const;
  return "amber" as const;
}

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string; proposalId: string }>;
}) {
  const { id, proposalId } = await params;
  const proposal = await getProposalWorkspace(id, proposalId);
  if (!proposal) notFound();

  const totals = summarize({ ...proposal, payments: [] });
  const editable = proposal.status === ProposalStatus.DRAFT || proposal.status === ProposalStatus.READY;

  return (
    <>
      <PageHeader
        title={`Proposal V${proposal.version}`}
        subtitle={`${proposal.lead.companyName ?? proposal.lead.contactName} · ${proposal.lead.eventType ?? "Event"} · ${money(totals.total)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/leads/${id}`}>
              <Button variant="secondary">Back to lead</Button>
            </Link>
            {!editable && proposal.status !== ProposalStatus.ACCEPTED && (
              <form action={createProposalRevision.bind(null, proposal.id)}>
                <Button type="submit">Create revision</Button>
              </form>
            )}
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge tone={proposalTone(proposal.status)}>{titleCase(proposal.status)}</Badge>
        {editable && proposal.status !== ProposalStatus.READY && (
          <form action={setProposalStatus.bind(null, proposal.id, ProposalStatus.READY)}>
            <Button type="submit" variant="ghost" className="h-8 px-2 text-xs">Mark ready</Button>
          </form>
        )}
        {editable && (
          <form action={setProposalStatus.bind(null, proposal.id, ProposalStatus.SENT)}>
            <Button type="submit" variant="secondary" className="h-8 px-2 text-xs">Mark sent</Button>
          </form>
        )}
        {proposal.status === ProposalStatus.SENT && (
          <form action={setProposalStatus.bind(null, proposal.id, ProposalStatus.ACCEPTED)}>
            <Button type="submit" className="h-8 px-2 text-xs">Mark accepted</Button>
          </form>
        )}
        {proposal.status === ProposalStatus.SENT && (
          <form action={setProposalStatus.bind(null, proposal.id, ProposalStatus.REJECTED)}>
            <Button type="submit" variant="ghost" className="h-8 px-2 text-xs">Mark rejected</Button>
          </form>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <Card title="Proposal details">
            <form action={updateProposal.bind(null, proposal.id)} className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" className="sm:col-span-2">
                <Input name="title" defaultValue={proposal.title} disabled={!editable} />
              </Field>
              <Field label="Event date">
                <Input name="eventDate" type="date" defaultValue={proposal.eventDate?.toISOString().slice(0, 10) ?? ""} disabled={!editable} />
              </Field>
              <Field label="Guest count">
                <Input name="guestCount" type="number" min={0} defaultValue={proposal.guestCount} disabled={!editable} />
              </Field>
              <Field label="Venue / location" className="sm:col-span-2">
                <Input name="venueName" defaultValue={proposal.venueName ?? ""} disabled={!editable} />
              </Field>
              <Field label="Service charge %">
                <Input name="serviceChargePct" type="number" step="0.5" defaultValue={num(proposal.serviceChargePct)} disabled={!editable} />
              </Field>
              <Field label="Tax %">
                <Input name="taxPct" type="number" step="0.5" defaultValue={num(proposal.taxPct)} disabled={!editable} />
              </Field>
              <Field label="Discount">
                <Input name="discount" type="number" step="0.01" defaultValue={num(proposal.discount)} disabled={!editable} />
              </Field>
              <Field label="Notes / terms" className="sm:col-span-2">
                <Textarea name="notes" defaultValue={proposal.notes ?? ""} disabled={!editable} />
              </Field>
              {editable && <div className="sm:col-span-2"><Button type="submit">Save proposal</Button></div>}
            </form>
          </Card>

          <Card title="Proposal lines">
            {proposal.items.length === 0 ? (
              <EmptyState>No proposal lines yet.</EmptyState>
            ) : (
              <div className="space-y-2">
                {proposal.items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    {editable ? (
                      <div className="flex flex-wrap items-end gap-2">
                        <form action={updateProposalItem.bind(null, item.id)} className="flex flex-1 flex-wrap items-end gap-2">
                          <Field label="Item" className="min-w-52 flex-1">
                            <Input name="name" defaultValue={item.name} />
                          </Field>
                          <Field label="Qty" className="w-24">
                            <Input name="quantity" type="number" step="0.01" defaultValue={num(item.quantity)} />
                          </Field>
                          <Field label="Price" className="w-28">
                            <Input name="unitPrice" type="number" step="0.01" defaultValue={num(item.unitPrice)} />
                          </Field>
                          <label className="mb-2 flex items-center gap-1 text-xs text-slate-500">
                            <input type="checkbox" name="taxable" defaultChecked={item.taxable} /> tax
                          </label>
                          <Button type="submit" variant="secondary">Save</Button>
                        </form>
                        <form action={deleteProposalItem.bind(null, item.id)}>
                          <Button type="submit" variant="ghost">Remove</Button>
                        </form>
                      </div>
                    ) : (
                      <div className="flex justify-between gap-3 text-sm">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-slate-400">{titleCase(item.category)} · {num(item.quantity)} × {money(num(item.unitPrice))}</p>
                        </div>
                        <span>{money(num(item.quantity) * num(item.unitPrice))}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {editable && (
              <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800">
                <form action={addProposalItem.bind(null, proposal.id)} className="space-y-2">
                  <p className="text-sm font-medium">Add from menu</p>
                  <AsyncSearchSelect
                    name="menuItemId"
                    endpoint="/api/search?type=menu-items"
                    placeholder="Search menu items…"
                  />
                  <Input name="quantity" type="number" step="0.01" placeholder="Qty (blank = smart default)" />
                  <Button type="submit" variant="secondary">Add menu item</Button>
                </form>

                <form action={addCustomProposalItem.bind(null, proposal.id)} className="space-y-2">
                  <p className="text-sm font-medium">Add custom line</p>
                  <Input name="name" placeholder="Delivery fee, custom station…" required />
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="quantity" type="number" step="0.01" defaultValue={1} />
                    <Input name="unitPrice" type="number" step="0.01" placeholder="Price" />
                  </div>
                  <Select name="category" defaultValue={MenuCategory.OTHER}>
                    {(Object.values(MenuCategory) as string[]).map((category) => (
                      <option key={category} value={category}>{titleCase(category)}</option>
                    ))}
                  </Select>
                  <Input name="description" placeholder="Optional description" />
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="taxable" defaultChecked /> Taxable</label>
                  <Button type="submit" variant="secondary">Add custom line</Button>
                </form>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Proposal total">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Discount</dt><dd>-{money(totals.discount)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Service charge</dt><dd>{money(totals.serviceCharge)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Tax</dt><dd>{money(totals.tax)}</dd></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold dark:border-slate-700"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
              {proposal.guestCount > 0 && <div className="flex justify-between text-xs text-slate-400"><dt>Per guest</dt><dd>{money(totals.total / proposal.guestCount)}</dd></div>}
            </dl>
          </Card>

          <Card title="Version integrity">
            <p className="text-sm text-slate-500">
              {editable
                ? "This version is editable. Once it is marked sent, Caterly locks its commercial content so the client-facing record cannot silently change."
                : `V${proposal.version} is locked. Create a revision to change menu or pricing while preserving this version.`}
            </p>
            {proposal.sentAt && <p className="mt-2 text-xs text-slate-400">Sent {formatDate(proposal.sentAt)}</p>}
            {proposal.acceptedAt && <p className="mt-1 text-xs text-slate-400">Accepted {formatDate(proposal.acceptedAt)}</p>}
          </Card>

          {proposal.lead.budget && (
            <Card title="Lead budget">
              <div className="flex justify-between text-sm"><span>Stated budget</span><strong>{money(num(proposal.lead.budget))}</strong></div>
              <div className="mt-2 flex justify-between text-sm"><span>Proposal</span><strong>{money(totals.total)}</strong></div>
              <p className="mt-2 text-xs text-slate-400">
                Difference: {money(totals.total - num(proposal.lead.budget))}
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
