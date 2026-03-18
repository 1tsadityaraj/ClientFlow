export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";
import { logAudit, ACTIONS } from "@/lib/audit.js";
import { logActivity, ACTION_TYPES } from "@/lib/activity.js";
import { createTaskSchema, validate } from "@/lib/validations.js";

export async function GET(_request, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id: id, orgId: session.user.orgId },
  });

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (
    session.user.role === "client" &&
    project.clientUserId !== session.user.id
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const tasks = await prisma.task.findMany({
    where: {
      orgId: session.user.orgId,
      projectId: id,
    },
    orderBy: { createdAt: "asc" },
    include: {
      assignee: { select: { name: true, email: true } },
    },
  });

  return Response.json(tasks);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "createTask");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await prisma.project.findFirst({
    where: { id: id, orgId: session.user.orgId },
  });

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const json = await request.json();
  const { data, error } = validate(createTaskSchema, json);

  if (error) {
    return Response.json({ error }, { status: 422 });
  }

  const task = await prisma.task.create({
    data: {
      orgId: session.user.orgId,
      projectId: project.id,
      title: data.title,
      status: "TODO",
      priority: data.priority ?? "MEDIUM",
      assigneeId: data.assigneeId ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });

  await logAudit({
    orgId: session.user.orgId,
    userId: session.user.id,
    action: ACTIONS.TASK_CREATED,
    entity: "Task",
    entityId: task.id,
    metadata: { title: task.title, project: project.name },
  });

  logActivity({
    orgId: session.user.orgId,
    userId: session.user.id,
    projectId: project.id,
    action: ACTION_TYPES.TASK_CREATED,
    entityType: 'task',
    entityId: task.id,
    entityName: task.title
  });

  return Response.json(task, { status: 201 });
}
