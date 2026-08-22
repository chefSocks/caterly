"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { LeadStatus, MenuCategory, ProposalStatus } from "@/generated/prisma/enums";
import { bool, number, optionalDate, optionalText, text } from "@/lib/form";

function refresh(leadId: string, proposalId?: string) {
  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  if (proposalId) revalidatePath(`/leads/${leadId}/proposals/${proposalId}`);
}

async function activity(leadId: string, kind: string, message: string) {
  await db.leadActivity.create({ data: { leadId, kind, message } });
}

export async function createProposal(leadId: string) {
  const lead = await db.lead.findUniqueOrThrow({
    where: { id: leadId },
    include: { venue: { select: { name: true } } },
  });
  const latest = await db.proposal.findFirst({
    where: { leadId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const version = (latest?.version ?? 0) + 1;
  const title = `${lead.companyName ?? lead.contactName} ${lead.eventType ?? "Event"} Proposal`;

  const proposal = await db.proposal.create({
    data: {
      leadId,
      version,
      title,
      eventDate: lead.eventDate,
      guestCount: lead.guestCount ?? 0,
      serviceType: lead.serviceType,
      venueName: lead.venue?.name ?? lead.generalLocation,
      notes: lead.notes,
    },
  });
  await db.lead.update({ where: { id: leadId }, data: { status: LeadStatus.PROPOSAL } });
  await activity(leadId, "PROPOSAL", `Proposal V${version} created`);
  refresh(leadId, proposal.id);
  redirect(`/leads/${leadId}/proposals/${proposal.id}`);
}

export async function updateProposal(proposalId: string, data: FormData) {
  const proposal = await db.proposal.findUniqueOrThrow({ where: { id: proposalId } });
  if (proposal.status !== ProposalStatus.DRAFT && proposal.status !== ProposalStatus.READY) {
    throw new Error("Sent proposals are locked. Create a revision to make changes.");
  }
  await db.proposal.update({
    where: { id: proposalId },
    data: {
      title: text(data, "title") || proposal.title,
      eventDate: optionalDate(data, "eventDate"),
      guestCount: number(data, "guestCount", proposal.guestCount),
      venueName: optionalText(data, "venueName"),
      serviceChargePct: number(data, "serviceChargePct", 20),
      taxPct: number(data, "taxPct", 13),
      discount: number(data, "discount", 0),
      notes: optionalText(data, "notes"),
    },
  });
  refresh(proposal.leadId, proposalId);
}

export async function addProposalItem(proposalId: string, data: FormData) {
  const proposal = await db.proposal.findUniqueOrThrow({ where: { id: proposalId } });
  if (proposal.status !== ProposalStatus.DRAFT && proposal.status !== ProposalStatus.READY) {
    throw new Error("Sent proposals are locked. Create a revision to make changes.");
  }
  const menuItemId = text(data, "menuItemId");
  if (!menuItemId) throw new Error("Select a menu item");
  const menuItem = await db.menuItem.findUniqueOrThrow({ where: { id: menuItemId } });
  const maxPosition = await db.proposalItem.aggregate({
    where: { proposalId },
    _max: { position: true },
  });
  const requested = number(data, "quantity", 0);
  const quantity = requested > 0 ? requested : menuItem.unit.toLowerCase().includes("person") ? Math.max(1, proposal.guestCount) : 1;

  await db.proposalItem.create({
    data: {
      proposalId,
      menuItemId: menuItem.id,
      name: menuItem.name,
      category: menuItem.category,
      description: menuItem.description,
      quantity,
      unitPrice: menuItem.price,
      taxable: true,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });
  refresh(proposal.leadId, proposalId);
}

export async function addCustomProposalItem(proposalId: string, data: FormData) {
  const proposal = await db.proposal.findUniqueOrThrow({ where: { id: proposalId } });
  if (proposal.status !== ProposalStatus.DRAFT && proposal.status !== ProposalStatus.READY) throw new Error("Proposal is locked");
  const name = text(data, "name");
  if (!name) throw new Error("Line name is required");
  const maxPosition = await db.proposalItem.aggregate({ where: { proposalId }, _max: { position: true } });
  const rawCategory = text(data, "category");
  const category = (Object.values(MenuCategory) as string[]).includes(rawCategory)
    ? (rawCategory as MenuCategory)
    : MenuCategory.OTHER;
  await db.proposalItem.create({
    data: {
      proposalId,
      name,
      category,
      description: optionalText(data, "description"),
      quantity: number(data, "quantity", 1),
      unitPrice: number(data, "unitPrice", 0),
      taxable: bool(data, "taxable"),
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });
  refresh(proposal.leadId, proposalId);
}

export async function updateProposalItem(itemId: string, data: FormData) {
  const item = await db.proposalItem.findUniqueOrThrow({ where: { id: itemId }, include: { proposal: true } });
  if (item.proposal.status !== ProposalStatus.DRAFT && item.proposal.status !== ProposalStatus.READY) throw new Error("Proposal is locked");
  await db.proposalItem.update({
    where: { id: itemId },
    data: {
      name: text(data, "name") || item.name,
      quantity: number(data, "quantity", Number(item.quantity)),
      unitPrice: number(data, "unitPrice", Number(item.unitPrice)),
      taxable: bool(data, "taxable"),
    },
  });
  refresh(item.proposal.leadId, item.proposalId);
}

export async function deleteProposalItem(itemId: string) {
  const item = await db.proposalItem.findUniqueOrThrow({ where: { id: itemId }, include: { proposal: true } });
  if (item.proposal.status !== ProposalStatus.DRAFT && item.proposal.status !== ProposalStatus.READY) throw new Error("Proposal is locked");
  await db.proposalItem.delete({ where: { id: itemId } });
  refresh(item.proposal.leadId, item.proposalId);
}

export async function setProposalStatus(proposalId: string, next: ProposalStatus) {
  const proposal = await db.proposal.findUniqueOrThrow({ where: { id: proposalId } });
  const now = new Date();
  await db.proposal.update({
    where: { id: proposalId },
    data: {
      status: next,
      sentAt: next === ProposalStatus.SENT ? now : proposal.sentAt,
      acceptedAt: next === ProposalStatus.ACCEPTED ? now : proposal.acceptedAt,
    },
  });
  if (next === ProposalStatus.SENT) {
    await db.lead.update({ where: { id: proposal.leadId }, data: { status: LeadStatus.FOLLOW_UP } });
  } else if (next === ProposalStatus.ACCEPTED) {
    await db.lead.update({ where: { id: proposal.leadId }, data: { status: LeadStatus.DECISION } });
  }
  await activity(proposal.leadId, "PROPOSAL", `Proposal V${proposal.version} marked ${next.toLowerCase().replaceAll("_", " ")}`);
  refresh(proposal.leadId, proposalId);
}

export async function createProposalRevision(proposalId: string) {
  const source = await db.proposal.findUniqueOrThrow({ where: { id: proposalId }, include: { items: true } });
  const latest = await db.proposal.findFirst({ where: { leadId: source.leadId }, orderBy: { version: "desc" }, select: { version: true } });
  const version = (latest?.version ?? source.version) + 1;
  const revision = await db.proposal.create({
    data: {
      leadId: source.leadId,
      version,
      title: source.title,
      eventDate: source.eventDate,
      guestCount: source.guestCount,
      serviceType: source.serviceType,
      venueName: source.venueName,
      serviceChargePct: source.serviceChargePct,
      taxPct: source.taxPct,
      discount: source.discount,
      notes: source.notes,
      items: {
        create: source.items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          category: item.category,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxable: item.taxable,
          position: item.position,
        })),
      },
    },
  });
  if (source.status === ProposalStatus.SENT) {
    await db.proposal.update({ where: { id: source.id }, data: { status: ProposalStatus.SUPERSEDED } });
  }
  await db.lead.update({ where: { id: source.leadId }, data: { status: LeadStatus.PROPOSAL } });
  await activity(source.leadId, "PROPOSAL", `Proposal V${version} created from V${source.version}`);
  refresh(source.leadId, revision.id);
  redirect(`/leads/${source.leadId}/proposals/${revision.id}`);
}
