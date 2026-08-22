import { db } from "@/lib/db";
import { summarize } from "@/lib/event-summary";

export const CLIENT_PAGE_SIZE = 50;

export type ClientListRow = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  eventCount: number;
  lifetimeValue: number;
};

export type ClientPageResult = {
  rows: ClientListRow[];
  totalClients: number;
  page: number;
  totalPages: number;
};

export async function getClientPage(
  rawQuery: string | undefined,
  requestedPage: number,
): Promise<ClientPageResult> {
  const q = rawQuery?.trim() || undefined;
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { contactName: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const totalClients = await db.client.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalClients / CLIENT_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);

  const clients = await db.client.findMany({
    where,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    skip: (page - 1) * CLIENT_PAGE_SIZE,
    take: CLIENT_PAGE_SIZE,
    select: {
      id: true,
      name: true,
      contactName: true,
      phone: true,
      _count: { select: { events: true } },
      events: {
        select: {
          serviceChargePct: true,
          taxPct: true,
          discount: true,
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              taxable: true,
            },
          },
        },
      },
    },
  });

  return {
    totalClients,
    totalPages,
    page,
    rows: clients.map((client) => ({
      id: client.id,
      name: client.name,
      contactName: client.contactName,
      phone: client.phone,
      eventCount: client._count.events,
      lifetimeValue: client.events.reduce((sum, event) => sum + summarize(event).total, 0),
    })),
  };
}
