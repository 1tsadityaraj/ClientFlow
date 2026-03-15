"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/permissions";
import { logAudit, ACTIONS } from "@/lib/audit";
import { z } from "zod";

const statusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export async function updateTaskStatus(taskId, newStatus, orgId) {
  const session = await auth();
  if (!session) {
    return { error: "Unauthorized" };
  }

  if (session.user.orgId !== orgId) {
    return { error: "Organization mismatch" };
  }

  try {
    assertPermission(session, "updateTask");
  } catch {
    return { error: "Forbidden" };
  }

  const parseResult = statusSchema.safeParse(newStatus);
  if (!parseResult.success) {
    return { error: "Invalid status" };
  }

  const existing = await prisma.task.findFirst({
    where: { id: taskId, orgId: session.user.orgId },
  });

  if (!existing) {
    return { error: "Task not found" };
  }

  if (existing.status === newStatus) {
    return { success: true, task: existing };
  }

  try {
    const task = await prisma.task.update({
      where: { id: existing.id },
      data: { status: newStatus },
    });

    await logAudit({
      orgId: session.user.orgId,
      userId: session.user.id,
      action: ACTIONS.TASK_STATUS_CHANGED,
      entity: "Task",
      entityId: task.id,
      metadata: {
        title: task.title,
        from: existing.status,
        to: newStatus,
        message: `${session.user.name || "User"} moved ${task.title} from ${existing.status} to ${newStatus}`,
      },
    });

    return { success: true, task };
  } catch (error) {
    console.error("Task update error:", error);
    return { error: "Failed to update task" };
  }
}
