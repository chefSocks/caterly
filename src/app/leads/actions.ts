"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { LeadStatus } from "@/generated/prisma/enums";
import { optionalDate, optionalNumber, optionalText, text } from "@/lib/form";

function status(raw: string): LeadStatus {
  return (Object.values(LeadStatus) as string[]).includes(raw)
    ? (raw as LeadStatus)
    : LeadStatus.NEW;
}

export async function createLead(data: FormData) {
  const contactName = text(data, "contactName");
  if (!contactName) throw new Error("Contact name is required");
  await db.lead.create({
    data: {
      contactName,
      companyName: optionalText(data, "companyName"),
      email: optionalText(data, "email"),
      phone: optionalText(data, "phone"),
      source: optionalText(data, "source"),
      status: status(text(data, "status")),
      eventDate: optionalDate(data, "eventDate"),
      guestCount: optionalNumber(data, "guestCount"),
      budget: optionalNumber(data, "budget"),
      notes: optionalText(data, "notes"),
    },
  });
  revalidatePath("/leads");
}

export async function setLeadStatus(id: string, next: string) {
  await db.lead.update({ where: { id }, data: { status: status(next) } });
  revalidatePath("/leads");
}

export async function deleteLead(id: string) {
  await db.lead.delete({ where: { id } });
  revalidatePath("/leads");
}

/** Converts a lead into a client and opens the booking wizard prefilled. */
export async function convertLead(id: string) {
  const lead = await db.lead.findUniqueOrThrow({ where: { id } });
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
  revalidatePath("/leads");
  revalidatePath("/clients");
  const date = lead.eventDate
    ? `&date=${lead.eventDate.toISOString().slice(0, 10)}`
    : "";
  redirect(`/events/new?clientId=${clientId}${date}`);
}
