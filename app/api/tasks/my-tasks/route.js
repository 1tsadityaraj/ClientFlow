export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";

export async function GET() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: {
      orgId: session.user.orgId,
      assigneeId: session.user.id,
      status: { not: "DONE" },
    },
    orderBy: [
      { priority: "asc" },
      { dueDate: "asc" },
    ],
    take: 5,
    include: {
      project: {
        select: { id: true, name: true, color: true },
      },
    },
  });

  // Also get total counts
  const [totalAssigned, totalDone] = await Promise.all([
    prisma.task.count({
      where: { orgId: session.user.orgId, assigneeId: session.user.id },
    }),
    prisma.task.count({
      where: { orgId: session.user.orgId, assigneeId: session.user.id, status: "DONE" },
    }),
  ]);

  return Response.json({
    tasks,
    totalAssigned,
    totalDone,
    totalPending: totalAssigned - totalDone,
  });
}
