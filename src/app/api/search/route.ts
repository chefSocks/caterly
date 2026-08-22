import { NextRequest, NextResponse } from "next/server";
import { searchReferenceData, type SearchKind } from "@/services/search";

const KINDS = new Set<SearchKind>(["clients", "venues", "menu-items", "staff"]);

export async function GET(request: NextRequest) {
  const rawKind = request.nextUrl.searchParams.get("type");
  const q = request.nextUrl.searchParams.get("q") ?? "";

  if (!rawKind || !KINDS.has(rawKind as SearchKind)) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  const results = await searchReferenceData(rawKind as SearchKind, q);
  return NextResponse.json({ results });
}
