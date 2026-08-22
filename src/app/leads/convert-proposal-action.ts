"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { EventStatus, LeadStatus, ProposalStatus, ServiceType } from "@/generated/prisma/enums";

function defaultStart(eventDate: Date | null, approximateStartAt: Date | null) {
  if (approximateStartAt) return approximateStartAt;
  const base = eventDate ? new Date(eventDate) : new Date();
  base.setUTCHours(17, 0, 0, 0);
  return base;
}

export async function convertAcceptedProposalToEvent(proposalId: string) {
  const proposal = await db.proposal.findUniqueOrThrow({
    where: { id: proposalId },
    include: {
      items: { orderBy: { position: "asc" } },
      lead: {
        include: { venue: true },
      },
    },
  });

  if (proposal.status !== ProposalStatus.ACCEPTED) {
    throw new Error("Only an accepted proposal can be converted to an event");
  }

  if (proposal.lead.convertedEventId) {
    redirect(`/events/${proposal.lead.convertedEventId}`);
  }

  let clientId = proposal.lead.clientId;
  if (!clientId) {
    const client = await db.client.create({
      data: {
        name: proposal.lead.companyName ?? proposal.lead.contactName,
        contactName: proposal.lead.contactName,
        email: proposal.lead.email,
        phone: proposal.lead.phone,
        notes: proposal.lead.notes,
      },
    });
    clientId = client.id;
  }

  const startAt = defaultStart(proposal.eventDate ?? proposal.lead.eventDate, proposal.lead.approximateStartAt);
  const endAt = new Date(startAt.getTime() + 5 * 60 * 60 * 1000);

  const event = await db.event.create({
    data: {
      name: proposal.title.replace(/\s+Proposal$/i, "") || `${proposal.lead.contactName} event`,
      clientId,
      status: EventStatus.TENTATIVE,
      serviceType: proposal.serviceType ?? proposal.lead.serviceType ?? ServiceType.BUFFET,
      eventType: proposal.lead.eventType,
      venueId: proposal.lead.venueId,
      guestCount: proposal.guestCount,
      startAt,
      endAt,
      siteAddress: proposal.lead.generalLocation,
      serviceChargePct: proposal.serviceChargePct,
      taxPct: proposal.taxPct,
      discount: proposal.discount,
      clientNotes: proposal.notes,
      items: {
        create: proposal.items.map((item) => ({
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

  await db.lead.update({
    where: { id: proposal.leadId },
    data: {
      clientId,
      convertedEventId: event.id,
      status: LeadStatus.WON,
    },
  });
  await db.leadActivity.create({
    data: {
      leadId: proposal.leadId,
      kind: "WON",
      message: `Accepted proposal V${proposal.version} converted to Event #${event.number}`,
    },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${proposal.leadId}`);
  revalidatePath("/events");
  revalidatePath("/calendar");
  revalidatePath("/");
  redirect(`/events/${event.id}`);
}
