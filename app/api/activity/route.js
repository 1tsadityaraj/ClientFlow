export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";

export async function GET(request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const actionType = searchParams.get("actionType");
  const dateRange = searchParams.get("dateRange");
  const userId = searchParams.get("userId");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const cursor = searchParams.get("cursor");

  const where = {
    orgId: session.user.orgId,
  };

  if (projectId) {
    where.projectId = projectId;
  }

  if (userId) {
    where.userId = userId;
  }

  if (dateRange && dateRange !== "all") {
    const now = new Date();
    const start = new Date();
    if (dateRange === "today") start.setHours(0, 0, 0, 0);
    else if (dateRange === "week") start.setDate(now.getDate() - 7);
    else if (dateRange === "month") start.setMonth(now.getMonth() - 1);
    
    where.createdAt = { gte: start };
  }

  if (actionType) {
    const actionMap = {
      tasks: ['task_created', 'task_completed', 'task_updated', 'task_assigned'],
      files: ['file_uploaded', 'file_deleted'],
      comments: ['comment_added'],
      members: ['member_invited', 'member_joined', 'member_removed', 'role_changed']
    };
    if (actionMap[actionType]) {
      where.action = { in: actionMap[actionType] };
    }
  }

  // Filter for clients: they only see activity for projects they are assigned to
  if (session.user.role === 'client') {
    const clientProjects = await prisma.project.findMany({
      where: {
        orgId: session.user.orgId,
        clientUserId: session.user.id
      },
      select: { id: true }
    });
    const projectIds = clientProjects.map(p => p.id);
    
    if (projectId) {
      if (!projectIds.includes(projectId)) {
        return Response.json({ logs: [], nextCursor: null, total: 0 });
      }
    } else {
      where.projectId = { in: projectIds };
    }
  }

  const logs = await prisma.activityLog.findMany({
    where,
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  const total = await prisma.activityLog.count({ where });
  const nextCursor = logs.length === limit ? logs[logs.length - 1].id : null;

  return Response.json({
    logs,
    nextCursor,
    total,
  });
}
