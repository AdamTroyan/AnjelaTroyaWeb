import { NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth";
import { readAuditLog } from "@/lib/auditLog";

export const runtime = "nodejs";

export async function GET() {
  const user = await getUserFromCookies();
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const entries = await readAuditLog();
  return NextResponse.json({ entries });
}
