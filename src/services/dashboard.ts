import { EventStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { measureAsync } from "@/lib/performance";

export type DashboardEvent = {
  id: string;
  name: string;
  number: number;
  status: string;
  startAt: Date;
  guestCount: number;
  client: { name: string };
  items: { quantity: { toString(): string }; unitPrice: { toString(): string }; taxable: boolean }[];
};

export type DashboardTask = {
  id: string;
  title: string;
  dueAt: Date | null;
  event: { name: string } | null;
};

type MonthlyRow = {
  eventCount: bigint;
  guestCount: bigint;
  bookedTotal: unknown;
};

type OutstandingSummaryRow = {
  eventCount: bigint;
  balanceTotal: unknown;
};

type OutstandingRow = {
  id: string;
  eventName: string;
  clientName: string;
  balance: unknown;
};

const EVENT_FINANCIALS_CTE = `
WITH item_totals AS (
  SELECT
    e.id,
    COALESCE(SUM(ROUND(ei.quantity * ei."unitPrice", 2)), 0)::numeric AS subtotal,
    COALESCE(SUM(CASE WHEN ei.taxable THEN ROUND(ei.quantity * ei."unitPrice", 2) ELSE 0 END), 0)::numeric AS taxable_subtotal
  FROM "Event" e
  LEFT JOIN "EventItem" ei ON ei."eventId" = e.id
  GROUP BY e.id
),
payment_totals AS (
  SELECT
    e.id,
    COALESCE(SUM(p.amount), 0)::numeric AS paid
  FROM "Event" e
  LEFT JOIN "Payment" p ON p."eventId" = e.id
  GROUP BY e.id
),
financials AS (
  SELECT
    e.id,
    e.name,
    e.status,
    e."startAt",
    e."guestCount",
    e."clientId",
    i.subtotal,
    i.taxable_subtotal,
    LEAST(e.discount, i.subtotal)::numeric AS discount,
    CASE WHEN i.subtotal > 0
      THEN (i.subtotal - LEAST(e.discount, i.subtotal)) / i.subtotal
      ELSE 0
    END::numeric AS discount_ratio,
    ROUND((i.subtotal - LEAST(e.discount, i.subtotal)) * (e."serviceChargePct" / 100), 2)::numeric AS service_charge,
    p.paid
  FROM "Event" e
  JOIN item_totals i ON i.id = e.id
  JOIN payment_totals p ON p.id = e.id
),
computed AS (
  SELECT
    f.*,
    ROUND((f.taxable_subtotal * f.discount_ratio + f.service_charge), 2)::numeric AS tax_base
  FROM financials f
),
finals AS (
  SELECT
    c.*,
    ROUND(c.tax_base * (e."taxPct" / 100), 2)::numeric AS tax,
    ROUND(c.subtotal - c.discount + c.service_charge + ROUND(c.tax_base * (e."taxPct" / 100), 2), 2)::numeric AS total
  FROM computed c
  JOIN "Event" e ON e.id = c.id
)
`;

export async function getDashboardData(now: Date, visibleStatuses: EventStatus[]) {
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return measureAsync("dashboard.data", async () => {
    const [upcoming, openLeads, tasks, monthlyRows, outstandingSummaryRows, outstandingRows] =
      await Promise.all([
        visibleStatuses.length === 0
          ? Promise.resolve([])
          : db.event.findMany({
              where: {
                startAt: { gte: now, lte: in30Days },
                status: { in: visibleStatuses },
              },
              orderBy: { startAt: "asc" },
              take: 12,
              select: {
                id: true,
                name: true,
                number: true,
                status: true,
                startAt: true,
                guestCount: true,
                client: { select: { name: true } },
                items: {
                  select: { quantity: true, unitPrice: true, taxable: true },
                },
                serviceChargePct: true,
                taxPct: true,
                discount: true,
              },
            }),
        db.lead.count({ where: { status: { notIn: ["WON", "LOST"] } } }),
        db.task.findMany({
          where: { done: false },
          orderBy: { dueAt: "asc" },
          take: 10,
          select: {
            id: true,
            title: true,
            dueAt: true,
            event: { select: { name: true } },
          },
        }),
        db.$queryRawUnsafe<MonthlyRow[]>(
          `${EVENT_FINANCIALS_CTE}
          SELECT
            COUNT(*)::bigint AS "eventCount",
            COALESCE(SUM("guestCount"), 0)::bigint AS "guestCount",
            COALESCE(SUM(total), 0)::numeric AS "bookedTotal"
          FROM finals
          WHERE "startAt" >= $1 AND "startAt" < $2 AND status <> 'CANCELLED'`,
          monthStart,
          monthEnd,
        ),
        db.$queryRawUnsafe<OutstandingSummaryRow[]>(
          `${EVENT_FINANCIALS_CTE}
          SELECT
            COUNT(*) FILTER (WHERE total - paid > 0.01)::bigint AS "eventCount",
            COALESCE(SUM(total - paid) FILTER (WHERE total - paid > 0.01), 0)::numeric AS "balanceTotal"
          FROM finals
          WHERE status IN ('DEFINITE', 'COMPLETED')`,
        ),
        db.$queryRawUnsafe<OutstandingRow[]>(
          `${EVENT_FINANCIALS_CTE}
          SELECT
            f.id,
            f.name AS "eventName",
            c.name AS "clientName",
            ROUND(f.total - f.paid, 2)::numeric AS balance
          FROM finals f
          JOIN "Client" c ON c.id = f."clientId"
          WHERE f.status IN ('DEFINITE', 'COMPLETED')
            AND f.total - f.paid > 0.01
          ORDER BY balance DESC
          LIMIT 8`,
        ),
      ]);

    const monthly = monthlyRows[0];
    const outstandingSummary = outstandingSummaryRows[0];

    return {
      upcoming,
      openLeads,
      tasks,
      monthEventCount: Number(monthly?.eventCount ?? 0),
      monthGuests: Number(monthly?.guestCount ?? 0),
      monthBooked: Number(monthly?.bookedTotal ?? 0),
      outstandingCount: Number(outstandingSummary?.eventCount ?? 0),
      outstandingTotal: Number(outstandingSummary?.balanceTotal ?? 0),
      outstanding: outstandingRows.map((row) => ({
        id: row.id,
        eventName: row.eventName,
        clientName: row.clientName,
        balance: Number(row.balance),
      })),
    };
  });
}
