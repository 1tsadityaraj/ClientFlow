import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";
import { assertPermission } from "../../../../lib/permissions.js";
import { z } from "zod";

const updateOrgSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
});

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "updateOrg");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (params.id !== session.user.orgId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const org = await prisma.org.findUnique({
    where: { id: params.id },
  });

  if (!org) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const json = await request.json();
  const parsed = updateOrgSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;
  if (data.slug && data.slug !== org.slug) {
    const existing = await prisma.org.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return Response.json({ error: "Slug already taken" }, { status: 409 });
    }
  }

  const updated = await prisma.org.update({
    where: { id: params.id },
    data: data || {},
  });

  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "deleteOrg");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (params.id !== session.user.orgId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const org = await prisma.org.findUnique({
    where: { id: params.id },
  });

  if (!org) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const json = await request.json().catch(() => ({}));
  const { confirmName } = json;
  if (confirmName !== org.name) {
    return Response.json(
      { error: "Organization name does not match" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.comment.deleteMany({ where: { orgId: org.id } });
    await tx.file.deleteMany({ where: { orgId: org.id } });
    await tx.task.deleteMany({ where: { orgId: org.id } });
    await tx.project.deleteMany({ where: { orgId: org.id } });
    await tx.invite.deleteMany({ where: { orgId: org.id } });
    await tx.user.deleteMany({ where: { orgId: org.id } });
    await tx.org.delete({ where: { id: org.id } });
  });

  return Response.json({ success: true });
}
