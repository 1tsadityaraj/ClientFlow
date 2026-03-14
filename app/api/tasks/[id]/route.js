import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";
import { assertPermission } from "../../../../lib/permissions.js";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
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
  const parsed = updateTaskSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;

  const task = await prisma.task.update({
    where: { id: existing.id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : existing.dueDate,
    },
  });

  return Response.json(task);
}

