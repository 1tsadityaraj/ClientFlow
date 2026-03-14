import { auth } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";
import { assertPermission } from "../../../../lib/permissions.js";
import { z } from "zod";

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["active", "completed", "archived"]).optional(),
  color: z.string().optional(),
  clientUserId: z.string().nullable().optional(),
  managerId: z.string().optional(),
});

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
  const parsed = updateProjectSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const existing = await prisma.project.findFirst({
    where: { id: params.id, orgId: session.user.orgId },
  });

  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const project = await prisma.project.update({
    where: { id: existing.id },
    data: parsed.data,
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

  return Response.json({ success: true });
}

