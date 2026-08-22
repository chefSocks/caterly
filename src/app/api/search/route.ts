import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const LIMIT = 12;

type SearchKind = "clients" | "venues" | "menu-items" | "staff";

export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("type") as SearchKind | null;
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!kind || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

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
    return NextResponse.json({
      results: rows.map((row) => ({
        id: row.id,
        label: row.name,
        description: [row.contactName, row.email].filter(Boolean).join(" · ") || null,
      })),
    });
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
    return NextResponse.json({
      results: rows.map((row) => ({
        id: row.id,
        label: row.name,
        description: row.address,
      })),
    });
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
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, category: true, unit: true, price: true },
      take: LIMIT,
    });
    return NextResponse.json({
      results: rows.map((row) => ({
        id: row.id,
        label: row.name,
        description: `${row.category.toLowerCase().replaceAll("_", " ")} · $${Number(row.price).toFixed(2)} ${row.unit}`,
      })),
    });
  }

  if (kind === "staff") {
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
    return NextResponse.json({
      results: rows.map((row) => ({
        id: row.id,
        label: row.name,
        description: [row.position, row.email].filter(Boolean).join(" · ") || null,
      })),
    });
  }

  return NextResponse.json({ results: [] }, { status: 400 });
}
