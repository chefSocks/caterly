"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ClientType } from "@/generated/prisma/enums";
import { optionalText, text } from "@/lib/form";

function parse(data: FormData) {
  return {
    type: text(data, "type") === "PERSON" ? ClientType.PERSON : ClientType.COMPANY,
    name: text(data, "name"),
    contactName: optionalText(data, "contactName"),
    email: optionalText(data, "email"),
    phone: optionalText(data, "phone"),
    address: optionalText(data, "address"),
    city: optionalText(data, "city"),
    region: optionalText(data, "region"),
    postalCode: optionalText(data, "postalCode"),
    notes: optionalText(data, "notes"),
  };
}

export async function createClient(data: FormData) {
  const values = parse(data);
  if (!values.name) throw new Error("Client name is required");
  const client = await db.client.create({ data: values });
  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(id: string, data: FormData) {
  const values = parse(data);
  if (!values.name) throw new Error("Client name is required");
  await db.client.update({ where: { id }, data: values });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  const events = await db.event.count({ where: { clientId: id } });
  if (events > 0) throw new Error("Cannot delete a client with events");
  await db.client.delete({ where: { id } });
  revalidatePath("/clients");
  redirect("/clients");
}
