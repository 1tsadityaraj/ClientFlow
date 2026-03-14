import { auth } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";
import { assertPermission } from "../../../../lib/permissions.js";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    assertPermission(session, "deleteOrg"); // Only admins can export
  } catch {
    return new Response("Forbidden", { status: 403 });
  }

  const logs = await prisma.auditLog.findMany({
    where: { orgId: session.user.orgId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  const headers = ["Timestamp", "User", "Email", "Action", "Entity", "Details"];
  const rows = logs.map((log) => [
    new Date(log.createdAt).toISOString(),
    log.user?.name || "Unknown",
    log.user?.email || "N/A",
    log.action,
    log.entity,
    log.metadata?.replace(/\"/g, '""') || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="audit-logs-${session.user.orgId}.csv"`,
    },
  });
}
