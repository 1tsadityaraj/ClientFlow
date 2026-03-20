export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";

export async function GET() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.orgId;

  const members = await prisma.user.findMany({
    where: { orgId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
      status: {
        select: { status: true, currentWork: true, updatedAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Get all tasks for the org in one query
  const allTasks = await prisma.task.findMany({
    where: { orgId },
    select: {
      assigneeId: true,
      status: true,
      projectId: true,
    },
  });

  // Get all projects for the org
  const allProjects = await prisma.project.findMany({
    where: { orgId },
    select: { id: true, name: true, color: true },
  });

  const projectMap = Object.fromEntries(allProjects.map((p) => [p.id, p]));

  const result = members.map((member) => {
    const memberTasks = allTasks.filter((t) => t.assigneeId === member.id);
    const done = memberTasks.filter((t) => t.status === "DONE").length;
    const inProgress = memberTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const todo = memberTasks.filter((t) => t.status === "TODO").length;
    const total = memberTasks.length;

    // Unique active projects (where user has tasks)
    const projectIds = [...new Set(memberTasks.map((t) => t.projectId))];
    const activeProjects = projectIds
      .map((pid) => projectMap[pid])
      .filter(Boolean);

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      avatar: member.avatar,
      role: member.role,
      createdAt: member.createdAt,
      status: member.status || { status: "offline", currentWork: null, updatedAt: null },
      taskStats: {
        total,
        done,
        inProgress,
        todo,
        completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
      },
      activeProjects,
    };
  });

  return Response.json(result);
}

export async function PATCH(request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { status, currentWork, userId } = body;

  // Only admins can update other users' status
  const targetUserId = userId && session.user.role === "admin" ? userId : session.user.id;

  const validStatuses = ["available", "busy", "away", "offline"];
  if (status && !validStatuses.includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const userStatus = await prisma.userStatus.upsert({
    where: { userId: targetUserId },
    update: {
      ...(status && { status }),
      ...(currentWork !== undefined && { currentWork }),
    },
    create: {
      orgId: session.user.orgId,
      userId: targetUserId,
      status: status || "available",
      currentWork: currentWork || null,
    },
  });

  // Broadcast via Pusher if available
  try {
    const Pusher = (await import("pusher")).default;
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });
    await pusher.trigger(`org-${session.user.orgId}`, "member-status-update", {
      userId: targetUserId,
      status: userStatus.status,
      currentWork: userStatus.currentWork,
    });
  } catch (e) {
    console.error("Pusher broadcast failed:", e);
  }

  return Response.json(userStatus);
}
