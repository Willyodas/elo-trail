import { prisma } from "@/services/database";

export const OPERATIONAL_EVENT_RETENTION_DAYS = 90;

export function getOperationalEventRetentionCutoff(now = new Date()): Date {
  const cutoff = new Date(now);

  cutoff.setUTCDate(cutoff.getUTCDate() - OPERATIONAL_EVENT_RETENTION_DAYS);

  return cutoff;
}

export async function deleteExpiredOperationalEvents(
  now = new Date(),
): Promise<{ deletedEvents: number }> {
  const cutoff = getOperationalEventRetentionCutoff(now);

  const result = await prisma.operationalEvent.deleteMany({
    where: {
      createdAt: {
        lt: cutoff,
      },
    },
  });

  return {
    deletedEvents: result.count,
  };
}
