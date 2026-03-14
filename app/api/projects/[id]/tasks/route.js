import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth.js";
import { prisma } from "../../../../../lib/prisma.js";
import { assertPermission } from "../../../../../lib/permissions.js";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export async function GET(_request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, orgId: session.user.orgId },
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
      projectId: params.id,
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(tasks);
}

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "createTask");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, orgId: session.user.orgId },
  });

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const json = await request.json();
  const parsed = createTaskSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;

  const task = await prisma.task.create({
    data: {
      orgId: session.user.orgId,
      projectId: project.id,
      title: data.title,
      status: data.status ?? "TODO",
      priority: data.priority ?? "MEDIUM",
      assigneeId: data.assigneeId ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });

  return Response.json(task, { status: 201 });
}

