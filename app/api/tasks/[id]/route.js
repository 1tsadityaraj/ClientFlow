import { auth } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";
import { assertPermission } from "../../../../lib/permissions.js";
import { logAudit, ACTIONS } from "../../../../lib/audit.js";
import { updateTaskSchema, validate } from "../../../../lib/validations.js";

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
  const action = data.status && data.status !== existing.status
    ? ACTIONS.TASK_STATUS_CHANGED
    : ACTIONS.TASK_UPDATED;

  await logAudit({
    orgId: session.user.orgId,
    userId: session.user.id,
    action,
    entity: "Task",
    entityId: task.id,
    metadata: {
      title: task.title,
      ...(data.status ? { from: existing.status, to: data.status } : {}),
    },
  });

  return Response.json(task);
}

