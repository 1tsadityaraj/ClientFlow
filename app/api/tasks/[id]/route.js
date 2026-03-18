export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";
import { logAudit, ACTIONS } from "@/lib/audit.js";
import { logActivity, ACTION_TYPES } from "@/lib/activity.js";
import { updateTaskSchema, validate } from "@/lib/validations.js";

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "updateTask");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.task.findFirst({
    where: { id: params.id, orgId: session.user.orgId },
  });

  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const json = await request.json();
  const { data, error } = validate(updateTaskSchema, json);

  if (error) {
    return Response.json({ error }, { status: 422 });
  }

  const task = await prisma.task.update({
    where: { id: existing.id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : existing.dueDate,
    },
  });

  // Audit log
  const auditAction = data.status && data.status !== existing.status
    ? ACTIONS.TASK_STATUS_CHANGED
    : ACTIONS.TASK_UPDATED;

  await logAudit({
    orgId: session.user.orgId,
    userId: session.user.id,
    action: auditAction,
    entity: "Task",
    entityId: task.id,
    metadata: {
      title: task.title,
      ...(data.status ? { from: existing.status, to: data.status } : {}),
    },
  });

  // Activity log
  let activityAction = ACTION_TYPES.TASK_UPDATED;
  if (data.status === 'DONE' && existing.status !== 'DONE') {
    activityAction = ACTION_TYPES.TASK_COMPLETED;
  }

  logActivity({
    orgId: session.user.orgId,
    userId: session.user.id,
    projectId: task.projectId,
    action: activityAction,
    entityType: 'task',
    entityId: task.id,
    entityName: task.title
  });

  return Response.json(task);
}

