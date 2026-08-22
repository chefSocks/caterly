import { db } from "@/lib/db";

export type SearchKind = "clients" | "venues" | "menu-items" | "staff";

export type SearchResult = {
  id: string;
  label: string;
  description?: string | null;
};

const LIMIT = 12;

export async function searchReferenceData(
  kind: SearchKind,
  rawQuery: string,
): Promise<SearchResult[]> {
  const q = rawQuery.trim();
  if (q.length < 2) return [];

  if (kind === "clients") {
    const rows = await db.client.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { contactName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, contactName: true, email: true },
      take: LIMIT,
    });
    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      description: [row.contactName, row.email].filter(Boolean).join(" · ") || null,
    }));
  }

  if (kind === "venues") {
    const rows = await db.venue.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, address: true },
      take: LIMIT,
    });
    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      description: row.address,
    }));
  }

  if (kind === "menu-items") {
    const rows = await db.menuItem.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, category: true, unit: true, price: true },
      take: LIMIT,
    });
    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      description: `${row.category.toLowerCase().replace(/_/g, " ")} · $${Number(row.price).toFixed(2)} ${row.unit}`,
    }));
  }

  const rows = await db.staff.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { position: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, position: true, email: true },
    take: LIMIT,
  });
  return rows.map((row) => ({
    id: row.id,
    label: row.name,
    description: [row.position, row.email].filter(Boolean).join(" · ") || null,
  }));
}
