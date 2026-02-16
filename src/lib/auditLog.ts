import { mkdir, readFile, appendFile } from "node:fs/promises";
import path from "node:path";

export type AuditLogEntry = {
  ts: string;
  actorId: string;
  actorEmail: string;
  action: string;
  ip: string;
  metadata?: Record<string, unknown>;
};

const logDir = path.join(process.cwd(), "data");
const logPath = path.join(logDir, "auditlog.jsonl");

export async function appendAuditLog(entry: AuditLogEntry) {
  await mkdir(logDir, { recursive: true });
  await appendFile(logPath, `${JSON.stringify(entry)}\n`, "utf8");
}

export async function readAuditLog(limit = 500) {
  try {
    const raw = await readFile(logPath, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    const entries = lines
      .slice(-limit)
      .map((line) => JSON.parse(line) as AuditLogEntry)
      .reverse();
    return entries;
  } catch (error) {
    return [] as AuditLogEntry[];
  }
}
