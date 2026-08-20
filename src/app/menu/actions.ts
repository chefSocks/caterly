"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MenuCategory } from "@/generated/prisma/enums";
import { bool, number, optionalText, text } from "@/lib/form";

function category(raw: string): MenuCategory {
  return (Object.values(MenuCategory) as string[]).includes(raw)
    ? (raw as MenuCategory)
    : MenuCategory.OTHER;
}

export async function createMenuItem(data: FormData) {
  const name = text(data, "name");
  if (!name) throw new Error("Menu item name is required");
  await db.menuItem.create({
    data: {
      name,
      category: category(text(data, "category")),
      description: optionalText(data, "description"),
      unit: text(data, "unit") || "per person",
      price: number(data, "price"),
      cost: number(data, "cost"),
    },
  });
  revalidatePath("/menu");
}

export async function updateMenuItem(id: string, data: FormData) {
  await db.menuItem.update({
    where: { id },
    data: {
      name: text(data, "name"),
      category: category(text(data, "category")),
      description: optionalText(data, "description"),
      unit: text(data, "unit") || "per person",
      price: number(data, "price"),
      cost: number(data, "cost"),
      active: bool(data, "active"),
    },
  });
  revalidatePath("/menu");
  revalidatePath(`/menu/${id}`);
}

export async function deleteMenuItem(id: string) {
  await db.menuItem.delete({ where: { id } });
  revalidatePath("/menu");
  redirect("/menu");
}

export async function addRecipeLine(menuItemId: string, data: FormData) {
  await db.recipeLine.create({
    data: {
      menuItemId,
      ingredient: text(data, "ingredient"),
      quantity: number(data, "quantity", 1),
      unit: text(data, "unit") || "ea",
    },
  });
  revalidatePath(`/menu/${menuItemId}`);
}

export async function deleteRecipeLine(id: string) {
  const line = await db.recipeLine.delete({ where: { id } });
  revalidatePath(`/menu/${line.menuItemId}`);
}

export async function addPackingLine(menuItemId: string, data: FormData) {
  await db.packingLine.create({
    data: {
      menuItemId,
      equipment: text(data, "equipment"),
      quantity: number(data, "quantity", 1),
      unit: text(data, "unit") || "ea",
    },
  });
  revalidatePath(`/menu/${menuItemId}`);
}

export async function deletePackingLine(id: string) {
  const line = await db.packingLine.delete({ where: { id } });
  revalidatePath(`/menu/${line.menuItemId}`);
}

export async function createPackage(data: FormData) {
  const name = text(data, "name");
  if (!name) throw new Error("Package name is required");
  const menuItemIds = data.getAll("menuItemIds").filter((v): v is string => typeof v === "string");
  await db.menuPackage.create({
    data: {
      name,
      description: optionalText(data, "description"),
      pricePerGuest: number(data, "pricePerGuest"),
      items: { create: menuItemIds.map((menuItemId) => ({ menuItemId })) },
    },
  });
  revalidatePath("/menu/packages");
}

export async function deletePackage(id: string) {
  await db.menuPackage.delete({ where: { id } });
  revalidatePath("/menu/packages");
}
