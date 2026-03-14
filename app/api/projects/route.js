import { auth } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";
import { assertPermission } from "../../../lib/permissions.js";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().max(2000).optional(),
  color: z.string().optional(),
  clientUserId: z.string().nullable().optional(),
  managerId: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = { orgId: session.user.orgId };

  if (session.user.role === "client") {
    where.clientUserId = session.user.id;
  }

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return Response.json(projects);
}

export async function POST(request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "createProject");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json();
  const parsed = createProjectSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;

  const project = await prisma.project.create({
    data: {
      orgId: session.user.orgId,
      name: data.name,
      description: data.description,
      color: data.color ?? "#6366f1",
      clientUserId: data.clientUserId ?? null,
      managerId: data.managerId,
    },
  });

  return Response.json(project, { status: 201 });
}

