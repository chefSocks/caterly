"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { bool, number, optionalText, text } from "@/lib/form";

export async function createStaff(data: FormData) {
  const name = text(data, "name");
  if (!name) throw new Error("Staff name is required");
  await db.staff.create({
    data: {
      name,
      position: optionalText(data, "position"),
      email: optionalText(data, "email"),
      phone: optionalText(data, "phone"),
      hourlyRate: number(data, "hourlyRate"),
    },
  });
  revalidatePath("/staff");
}

export async function updateStaff(id: string, data: FormData) {
  await db.staff.update({
    where: { id },
    data: {
      name: text(data, "name"),
      position: optionalText(data, "position"),
      email: optionalText(data, "email"),
      phone: optionalText(data, "phone"),
      hourlyRate: number(data, "hourlyRate"),
      active: bool(data, "active"),
    },
  });
  revalidatePath("/staff");
}

export async function deleteStaff(id: string) {
  await db.staff.delete({ where: { id } });
  revalidatePath("/staff");
}

export async function createVenue(data: FormData) {
  const name = text(data, "name");
  if (!name) throw new Error("Venue name is required");
  await db.venue.create({
    data: {
      name,
      address: optionalText(data, "address"),
      capacity: Number(text(data, "capacity")) || null,
      notes: optionalText(data, "notes"),
    },
  });
  revalidatePath("/staff");
}

export async function deleteVenue(id: string) {
  await db.venue.delete({ where: { id } });
  revalidatePath("/staff");
}
