export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";
import { logAudit, ACTIONS } from "@/lib/audit.js";
import { createProjectSchema, validate } from "@/lib/validations.js";

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
  const { data, error } = validate(createProjectSchema, json);
  if (error) {
    return Response.json({ error }, { status: 422 });
  }

  const project = await prisma.project.create({
    data: {
      orgId: session.user.orgId,
      name: data.name,
      description: data.description,
      color: data.color ?? "#6366f1",
      clientUserId: data.clientUserId ?? null,
      managerId: session.user.id,
    },
  });

  await logAudit({
    orgId: session.user.orgId,
    userId: session.user.id,
    action: ACTIONS.PROJECT_CREATED,
    entity: "Project",
    entityId: project.id,
    metadata: { name: project.name },
  });

  return Response.json(project, { status: 201 });
}
