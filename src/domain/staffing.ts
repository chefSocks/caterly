import { db } from "@/lib/db";

export async function findStaffConflict({
  staffId,
  startAt,
  endAt,
  excludeShiftId,
}: {
  staffId: string;
  startAt: Date;
  endAt: Date;
  excludeShiftId?: string;
}) {
  return db.shift.findFirst({
    where: {
      staffId,
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      ...(excludeShiftId ? { id: { not: excludeShiftId } } : {}),
    },
    select: {
      id: true,
      eventId: true,
      startAt: true,
      endAt: true,
      event: { select: { name: true } },
    },
  });
}

export async function assertStaffAvailable({
  staffId,
  startAt,
  endAt,
  excludeShiftId,
}: {
  staffId: string;
  startAt: Date;
  endAt: Date;
  excludeShiftId?: string;
}) {
  const conflict = await findStaffConflict({ staffId, startAt, endAt, excludeShiftId });
  if (conflict) {
    throw new Error(`Scheduling conflict: already booked on "${conflict.event.name}"`);
  }
}
