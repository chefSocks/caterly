import { PrismaClient } from "@/generated/prisma/client";

const perfEnabled = process.env.CATERLY_PERF_LOG === "1";
const slowQueryMs = Number(process.env.CATERLY_SLOW_QUERY_MS ?? 100);

function createDb() {
  return new PrismaClient().$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        const startedAt = performance.now();

        try {
          return await query(args);
        } finally {
          if (perfEnabled) {
            const durationMs = performance.now() - startedAt;
            console.info(
              JSON.stringify({
                type: "caterly.db_query",
                model: model ?? "raw",
                operation,
                durationMs: Number(durationMs.toFixed(1)),
                slow: durationMs >= slowQueryMs,
              }),
            );
          }
        }
      },
    },
  });
}

type CaterlyDb = ReturnType<typeof createDb>;
const globalForPrisma = globalThis as unknown as { prisma?: CaterlyDb };

export const db = globalForPrisma.prisma ?? createDb();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
