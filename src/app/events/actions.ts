"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertStaffAvailable } from "@/domain/staffing";
import {
  EventStatus,
  MenuCategory,
  PaymentMethod,
  ServiceType,
} from "@/generated/prisma/enums";
import {
  bool,
  dateTime,
  number,
  optionalDateTime,
  optionalText,
  text,
} from "@/lib/form";

function enumValue<T extends Record<string, string>>(
  values: T,
  raw: string,
  fallback: T[keyof T],
): T[keyof T] {
  return (Object.values(values) as string[]).includes(raw)
    ? (raw as T[keyof T])
    : fallback;
}

function refresh(eventId: string) {
  revalidatePath("/events");
  revalidatePath("/calendar");
  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
}

export async function createEvent(data: FormData) {
  const clientId = text(data, "clientId");
  const newClientName = text(data, "newClientName");

  let resolvedClientId = clientId;
  if (!resolvedClientId) {
    if (!newClientName) throw new Error("Select an existing client or enter a new one");
    const client = await db.client.create({
      data: {
        name: newClientName,
        contactName: optionalText(data, "newClientContact"),
        email: optionalText(data, "newClientEmail"),
        phone: optionalText(data, "newClientPhone"),
      },
    });
    resolvedClientId = client.id;
  }

  const startAt = dateTime(data, "startAt");
  const endAt = dateTime(data, "endAt");
  if (endAt <= startAt) throw new Error("End time must be after start time");

  const event = await db.event.create({
    data: {
      name: text(data, "name") || "Untitled event",
      clientId: resolvedClientId,
      status: enumValue(EventStatus, text(data, "status"), EventStatus.TENTATIVE),
      serviceType: enumValue(
        ServiceType,
        text(data, "serviceType"),
        ServiceType.BUFFET,
      ),
      eventType: optionalText(data, "eventType"),
      venueId: optionalText(data, "venueId"),
      room: optionalText(data, "room"),
      guestCount: number(data, "guestCount"),
      startAt,
      endAt,
      arrivalAt: optionalDateTime(data, "arrivalAt"),
      siteAddress: optionalText(data, "siteAddress"),
      serviceChargePct: number(data, "serviceChargePct", 20),
      taxPct: number(data, "taxPct", 13),
      clientNotes: optionalText(data, "clientNotes"),
      kitchenNotes: optionalText(data, "kitchenNotes"),
      staffNotes: optionalText(data, "staffNotes"),
    },
  });

  const packageId = text(data, "packageId");
  if (packageId) await applyPackage(event.id, packageId);

  refresh(event.id);
  redirect(`/events/${event.id}`);
}

export async function updateEvent(id: string, data: FormData) {
  const startAt = dateTime(data, "startAt");
  const endAt = dateTime(data, "endAt");
  if (endAt <= startAt) throw new Error("End time must be after start time");

  await db.event.update({
    where: { id },
    data: {
      name: text(data, "name"),
      clientId: text(data, "clientId"),
      status: enumValue(EventStatus, text(data, "status"), EventStatus.TENTATIVE),
      serviceType: enumValue(
        ServiceType,
        text(data, "serviceType"),
        ServiceType.BUFFET,
      ),
      eventType: optionalText(data, "eventType"),
      venueId: optionalText(data, "venueId"),
      room: optionalText(data, "room"),
      guestCount: number(data, "guestCount"),
      startAt,
      endAt,
      arrivalAt: optionalDateTime(data, "arrivalAt"),
      siteAddress: optionalText(data, "siteAddress"),
      serviceChargePct: number(data, "serviceChargePct", 20),
      taxPct: number(data, "taxPct", 13),
      discount: number(data, "discount"),
      clientNotes: optionalText(data, "clientNotes"),
      kitchenNotes: optionalText(data, "kitchenNotes"),
      staffNotes: optionalText(data, "staffNotes"),
    },
  });
  refresh(id);
}

export async function setEventStatus(id: string, status: string) {
  await db.event.update({
    where: { id },
    data: { status: enumValue(EventStatus, status, EventStatus.TENTATIVE) },
  });
  refresh(id);
}

export async function deleteEvent(id: string) {
  await db.event.delete({ where: { id } });
  revalidatePath("/events");
  revalidatePath("/calendar");
  redirect("/events");
}

export async function copyEvent(id: string) {
  const source = await db.event.findUniqueOrThrow({
    where: { id },
    include: { items: true, shifts: true },
  });
  const offset = 7 * 24 * 60 * 60 * 1000;
  const copy = await db.event.create({
    data: {
      name: `${source.name} (copy)`,
      clientId: source.clientId,
      status: EventStatus.TENTATIVE,
      serviceType: source.serviceType,
      eventType: source.eventType,
      venueId: source.venueId,
      room: source.room,
      guestCount: source.guestCount,
      startAt: new Date(source.startAt.getTime() + offset),
      endAt: new Date(source.endAt.getTime() + offset),
      arrivalAt: source.arrivalAt
        ? new Date(source.arrivalAt.getTime() + offset)
        : null,
      siteAddress: source.siteAddress,
      serviceChargePct: source.serviceChargePct,
      taxPct: source.taxPct,
      clientNotes: source.clientNotes,
      kitchenNotes: source.kitchenNotes,
      staffNotes: source.staffNotes,
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
      shifts: {
        create: source.shifts.map((shift) => ({
          position: shift.position,
          startAt: new Date(shift.startAt.getTime() + offset),
          endAt: new Date(shift.endAt.getTime() + offset),
        })),
      },
    },
  });
  refresh(copy.id);
  redirect(`/events/${copy.id}`);
}

export async function addEventItem(eventId: string, data: FormData) {
  const menuItemId = text(data, "menuItemId");
  const quantity = number(data, "quantity", 1);
  const last = await db.eventItem.findFirst({
    where: { eventId },
    orderBy: { position: "desc" },
  });
  const position = (last?.position ?? 0) + 1;

  if (menuItemId) {
    const menuItem = await db.menuItem.findUniqueOrThrow({ where: { id: menuItemId } });
    await db.eventItem.create({
      data: {
        eventId,
        menuItemId,
        name: menuItem.name,
        category: menuItem.category,
        description: menuItem.description,
        quantity,
        unitPrice: menuItem.price,
        position,
      },
    });
  } else {
    const name = text(data, "name");
    if (!name) throw new Error("Pick a menu item or enter a custom line name");
    await db.eventItem.create({
      data: {
        eventId,
        name,
        category: enumValue(MenuCategory, text(data, "category"), MenuCategory.OTHER),
        quantity,
        unitPrice: number(data, "unitPrice"),
      },
    });
  }
  refresh(eventId);
}

export async function updateEventItem(id: string, data: FormData) {
  const item = await db.eventItem.update({
    where: { id },
    data: {
      name: text(data, "name"),
      quantity: number(data, "quantity", 1),
      unitPrice: number(data, "unitPrice"),
      taxable: bool(data, "taxable"),
      description: optionalText(data, "description"),
    },
  });
  refresh(item.eventId);
}

export async function deleteEventItem(id: string) {
  const item = await db.eventItem.delete({ where: { id } });
  refresh(item.eventId);
}

export async function applyPackage(eventId: string, packageId: string) {
  const [event, pkg] = await Promise.all([
    db.event.findUniqueOrThrow({ where: { id: eventId } }),
    db.menuPackage.findUniqueOrThrow({
      where: { id: packageId },
      include: { items: { include: { menuItem: true } } },
    }),
  ]);
  const last = await db.eventItem.findFirst({
    where: { eventId },
    orderBy: { position: "desc" },
  });
  let position = last?.position ?? 0;
  const guests = Math.max(event.guestCount, 1);

  await db.eventItem.create({
    data: {
      eventId,
      name: `${pkg.name} (package)`,
      category: MenuCategory.ENTREE,
      description: pkg.items.map((item) => item.menuItem.name).join(", "),
      quantity: guests,
      unitPrice: pkg.pricePerGuest,
      position: ++position,
    },
  });
  refresh(eventId);
}

export async function addPayment(eventId: string, data: FormData) {
  await db.payment.create({
    data: {
      eventId,
      amount: number(data, "amount"),
      method: enumValue(PaymentMethod, text(data, "method"), PaymentMethod.CARD),
      receivedAt: optionalDateTime(data, "receivedAt") ?? new Date(),
      reference: optionalText(data, "reference"),
    },
  });
  refresh(eventId);
}

export async function deletePayment(id: string) {
  const payment = await db.payment.delete({ where: { id } });
  refresh(payment.eventId);
}

export async function addScheduledPayment(eventId: string, data: FormData) {
  const dueAt = optionalDateTime(data, "dueAt");
  await db.scheduledPayment.create({
    data: {
      eventId,
      label: text(data, "label") || "Deposit",
      amount: number(data, "amount"),
      dueAt: dueAt ?? new Date(),
    },
  });
  refresh(eventId);
}

export async function toggleScheduledPayment(id: string) {
  const current = await db.scheduledPayment.findUniqueOrThrow({ where: { id } });
  await db.scheduledPayment.update({
    where: { id },
    data: { paid: !current.paid },
  });
  refresh(current.eventId);
}

export async function deleteScheduledPayment(id: string) {
  const scheduled = await db.scheduledPayment.delete({ where: { id } });
  refresh(scheduled.eventId);
}

export async function addShift(eventId: string, data: FormData) {
  const startAt = dateTime(data, "startAt");
  const endAt = dateTime(data, "endAt");
  if (endAt <= startAt) throw new Error("Shift end must be after its start");

  const staffId = optionalText(data, "staffId");
  if (staffId) {
    await assertStaffAvailable({ staffId, startAt, endAt });
  }

  await db.shift.create({
    data: {
      eventId,
      position: text(data, "position") || "Server",
      startAt,
      endAt,
      staffId,
    },
  });
  refresh(eventId);
}

export async function deleteShift(id: string) {
  const shift = await db.shift.delete({ where: { id } });
  refresh(shift.eventId);
}

export async function addTask(eventId: string | null, data: FormData) {
  await db.task.create({
    data: {
      eventId,
      title: text(data, "title"),
      dueAt: optionalDateTime(data, "dueAt"),
      assignee: optionalText(data, "assignee"),
    },
  });
  if (eventId) refresh(eventId);
  revalidatePath("/");
}

export async function toggleTask(id: string) {
  const task = await db.task.findUniqueOrThrow({ where: { id } });
  await db.task.update({ where: { id }, data: { done: !task.done } });
  if (task.eventId) refresh(task.eventId);
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  const task = await db.task.delete({ where: { id } });
  if (task.eventId) refresh(task.eventId);
  revalidatePath("/");
}
