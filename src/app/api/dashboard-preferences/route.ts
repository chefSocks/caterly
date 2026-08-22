import { NextRequest, NextResponse } from "next/server";

const ALLOWED = new Set(["PROSPECTIVE", "TENTATIVE", "DEFINITE", "COMPLETED"]);
const COOKIE = "caterly_dashboard_statuses";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { statuses?: unknown } | null;
  const raw = Array.isArray(body?.statuses) ? body.statuses : [];
  const statuses = raw.filter(
    (value): value is string => typeof value === "string" && ALLOWED.has(value),
  );

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE, statuses.join(","), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
