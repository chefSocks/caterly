"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { LeadStatus, ServiceType } from "@/generated/prisma/enums";
import {
  bool,
  optionalDate,
  optionalDateTime,
  optionalNumber,
  optionalText,
  text,
} from "@/lib/form";

function status(raw: string): LeadStatus {
  return (Object.values(LeadStatus) as string[]).includes(raw)
    ? (raw as LeadStatus)
    : LeadStatus.NEW;
}

function serviceType(raw: string): ServiceType | null {
  return (Object.values(ServiceType) as string[]).includes(raw)
    ? (raw as ServiceType)
    : null;
}

async function recordActivity(leadId: string, kind: string, message: string) {
  await db.leadActivity.create({ data: { leadId, kind, message } });
}

export async function createLead(data: FormData) {
  const contactName = text(data, "contactName");
  if (!contactName) throw new Error("Contact name is required");

  const lead = await db.lead.create({
    data: {
      contactName,
      companyName: optionalText(data, "companyName"),
      email: optionalText(data, "email"),
      phone: optionalText(data, "phone"),
      preferredContactMethod: optionalText(data, "preferredContactMethod"),
      source: optionalText(data, "source"),
      status: status(text(data, "status")),
      eventType: optionalText(data, "eventType"),
      serviceType: serviceType(text(data, "serviceType")),
      eventDate: optionalDate(data, "eventDate"),
      dateFlexible: bool(data, "dateFlexible"),
      approximateStartAt: optionalDateTime(data, "approximateStartAt"),
      guestCount: optionalNumber(data, "guestCount"),
      budget: optionalNumber(data, "budget"),
      generalLocation: optionalText(data, "generalLocation"),
      venueConfirmed: bool(data, "venueConfirmed"),
      venueId: optionalText(data, "venueId"),
      nextAction: optionalText(data, "nextAction"),
      followUpAt: optionalDateTime(data, "followUpAt"),
      notes: optionalText(data, "notes"),
    },
  });

  await recordActivity(lead.id, "CREATED", "Lead created");
  revalidatePath("/leads");
  redirect(`/leads/${lead.id}`);
}

export async function updateLead(id: string, data: FormData) {
  const contactName = text(data, "contactName");
  if (!contactName) throw new Error("Contact name is required");

  await db.lead.update({
    where: { id },
    data: {
      contactName,
      companyName: optionalText(data, "companyName"),
      email: optionalText(data, "email"),
      phone: optionalText(data, "phone"),
      preferredContactMethod: optionalText(data, "preferredContactMethod"),
      source: optionalText(data, "source"),
      eventType: optionalText(data, "eventType"),
      serviceType: serviceType(text(data, "serviceType")),
      eventDate: optionalDate(data, "eventDate"),
      dateFlexible: bool(data, "dateFlexible"),
      approximateStartAt: optionalDateTime(data, "approximateStartAt"),
      guestCount: optionalNumber(data, "guestCount"),
      budget: optionalNumber(data, "budget"),
      generalLocation: optionalText(data, "generalLocation"),
      venueConfirmed: bool(data, "venueConfirmed"),
      venueId: optionalText(data, "venueId"),
      nextAction: optionalText(data, "nextAction"),
      followUpAt: optionalDateTime(data, "followUpAt"),
      notes: optionalText(data, "notes"),
    },
  });
  await recordActivity(id, "UPDATED", "Lead details updated");
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

export async function setLeadStatus(id: string, next: string, data?: FormData) {
  const nextStatus = status(next);
  const lostReason = nextStatus === LeadStatus.LOST ? optionalText(data ?? new FormData(), "lostReason") : null;
  const current = await db.lead.findUniqueOrThrow({ where: { id }, select: { status: true } });

  await db.lead.update({
    where: { id },
    data: { status: nextStatus, lostReason },
  });
  await recordActivity(
    id,
    "STATUS",
    `Status changed from ${current.status.replaceAll("_", " ")} to ${nextStatus.replaceAll("_", " ")}${lostReason ? ` · ${lostReason}` : ""}`,
  );
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

export async function addLeadActivity(id: string, data: FormData) {
  const message = text(data, "message");
  if (!message) return;
  await recordActivity(id, "NOTE", message);
  revalidatePath(`/leads/${id}`);
}

export async function deleteLead(id: string) {
  await db.lead.delete({ where: { id } });
  revalidatePath("/leads");
  redirect("/leads");
}

/** Converts a won lead into a client and opens the booking wizard with known facts prefilled. */
export async function convertLead(id: string) {
  const lead = await db.lead.findUniqueOrThrow({
    where: { id },
    include: { venue: { select: { id: true } } },
  });
  let clientId = lead.clientId;
  if (!clientId) {
    const client = await db.client.create({
      data: {
        name: lead.companyName ?? lead.contactName,
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone,
        notes: lead.notes,
      },
    });
    clientId = client.id;
  }

  await db.lead.update({
    where: { id },
    data: { clientId, status: LeadStatus.WON },
  });
  await recordActivity(id, "WON", "Lead converted to booking workflow");
  revalidatePath("/leads");
  revalidatePath("/clients");

  const params = new URLSearchParams({ clientId, leadId: id });
  if (lead.eventDate) params.set("date", lead.eventDate.toISOString().slice(0, 10));
  if (lead.eventType) params.set("eventType", lead.eventType);
  if (lead.serviceType) params.set("serviceType", lead.serviceType);
  if (lead.guestCount != null) params.set("guestCount", String(lead.guestCount));
  if (lead.generalLocation) params.set("siteAddress", lead.generalLocation);
  if (lead.venueId) params.set("venueId", lead.venueId);

  redirect(`/events/new?${params.toString()}`);
}
