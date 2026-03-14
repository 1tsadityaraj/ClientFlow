import { auth } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";
import { assertPermission } from "../../../../lib/permissions.js";
import { logAudit, ACTIONS } from "../../../../lib/audit.js";
import { updateProjectSchema, validate } from "../../../../lib/validations.js";

export async function GET(_request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      orgId: session.user.orgId,
    },
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

  return Response.json(project);
}

export async function PATCH(request, { params }) {
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
  const { data, error } = validate(updateProjectSchema, json);
  if (error) {
    return Response.json({ error }, { status: 422 });
  }

  const existing = await prisma.project.findFirst({
    where: { id: params.id, orgId: session.user.orgId },
  });

  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const project = await prisma.project.update({
    where: { id: existing.id },
    data,
  });

  await logAudit({
    orgId: session.user.orgId,
    userId: session.user.id,
    action: ACTIONS.PROJECT_UPDATED,
    entity: "Project",
    entityId: project.id,
    metadata: { name: project.name, changes: Object.keys(data) },
  });

  return Response.json(project);
}

export async function DELETE(_request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "deleteProject");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.project.findFirst({
    where: { id: params.id, orgId: session.user.orgId },
  });

  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.project.delete({
    where: { id: existing.id },
  });

  await logAudit({
    orgId: session.user.orgId,
    userId: session.user.id,
    action: ACTIONS.PROJECT_DELETED,
    entity: "Project",
    entityId: existing.id,
    metadata: { name: existing.name },
  });

  return Response.json({ success: true });
}
