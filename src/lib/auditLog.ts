import { prisma } from "@/lib/prisma";

export type AuditLogEntry = {
  ts: string;
  actorId: string;
  actorEmail: string;
  action: string;
  ip: string;
  metadata?: Record<string, unknown>;
};

export async function appendAuditLog(entry: AuditLogEntry) {
  await prisma.auditLog.create({
    data: {
      actorId: entry.actorId,
      actorEmail: entry.actorEmail,
      action: entry.action,
      ip: entry.ip,
      metadata: entry.metadata ? (entry.metadata as object) : undefined,
    },
  });
}

export async function readAuditLog(limit = 500) {
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return entries.map((e) => ({
    ts: e.createdAt.toISOString(),
    actorId: e.actorId,
    actorEmail: e.actorEmail,
    action: e.action,
    ip: e.ip,
    metadata: (e.metadata as Record<string, unknown>) ?? undefined,
  })) as AuditLogEntry[];
}
