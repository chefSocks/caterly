import { db } from "@/lib/db";
import { measureAsync } from "@/lib/performance";
import { LeadStatus } from "@/generated/prisma/enums";

export const ACTIVE_LEAD_STAGES = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.QUALIFIED,
  LeadStatus.PROPOSAL,
  LeadStatus.FOLLOW_UP,
  LeadStatus.DECISION,
] as const;

const STAGE_LIMIT = 30;
const HISTORY_PAGE_SIZE = 50;

export async function getLeadPipeline() {
  return measureAsync("leads.pipeline", async () => {
    const [stageRows, counts, valueRows] = await Promise.all([
      Promise.all(
        ACTIVE_LEAD_STAGES.map((stage) =>
          db.lead.findMany({
            where: { status: stage },
            orderBy: [{ followUpAt: "asc" }, { createdAt: "desc" }],
            take: STAGE_LIMIT,
            select: {
              id: true,
              contactName: true,
              companyName: true,
              eventType: true,
              serviceType: true,
              eventDate: true,
              guestCount: true,
              budget: true,
              followUpAt: true,
              nextAction: true,
              source: true,
              venue: { select: { name: true } },
              generalLocation: true,
              createdAt: true,
            },
          }),
        ),
      ),
      db.lead.groupBy({
        by: ["status"],
        where: { status: { in: [...ACTIVE_LEAD_STAGES] } },
        _count: { _all: true },
      }),
      db.lead.aggregate({
        where: { status: { in: [...ACTIVE_LEAD_STAGES] } },
        _sum: { budget: true },
        _count: { _all: true },
      }),
    ]);

    const countByStage = new Map(counts.map((row) => [row.status, row._count._all]));
    const stages = ACTIVE_LEAD_STAGES.map((status, index) => ({
      status,
      count: countByStage.get(status) ?? 0,
      leads: stageRows[index],
      truncated: (countByStage.get(status) ?? 0) > STAGE_LIMIT,
    }));

    return {
      stages,
      openCount: valueRows._count._all,
      pipelineValue: Number(valueRows._sum.budget ?? 0),
    };
  });
}

export async function getLeadWorkspace(id: string) {
  return measureAsync("leads.workspace", () =>
    db.lead.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        venue: { select: { id: true, name: true, address: true } },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    }),
  );
}

export async function getLeadHistory(rawPage: number, query?: string) {
  return measureAsync("leads.history", async () => {
    const q = query?.trim() || undefined;
    const where = {
      status: { in: [LeadStatus.WON, LeadStatus.LOST] },
      ...(q
        ? {
            OR: [
              { contactName: { contains: q, mode: "insensitive" as const } },
              { companyName: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const count = await db.lead.count({ where });
    const totalPages = Math.max(1, Math.ceil(count / HISTORY_PAGE_SIZE));
    const page = Math.min(Math.max(1, rawPage), totalPages);
    const rows = await db.lead.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * HISTORY_PAGE_SIZE,
      take: HISTORY_PAGE_SIZE,
      select: {
        id: true,
        contactName: true,
        companyName: true,
        status: true,
        eventType: true,
        eventDate: true,
        guestCount: true,
        budget: true,
        source: true,
        lostReason: true,
        updatedAt: true,
      },
    });

    return { rows, count, page, totalPages, pageSize: HISTORY_PAGE_SIZE };
  });
}
