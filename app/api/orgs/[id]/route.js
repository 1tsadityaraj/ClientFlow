export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";
import { logAudit, ACTIONS } from "@/lib/audit.js";
import { updateOrgSchema, validate } from "@/lib/validations.js";

export async function PATCH(request, { params }) {
  const session = await auth();
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
  const { data, error } = validate(updateOrgSchema, json);
  
  if (error) {
    return Response.json(
      { error: "Validation failed", issues: error },
      { status: 422 }
    );
  }

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

  await logAudit({
    orgId: session.user.orgId,
    userId: session.user.id,
    action: ACTIONS.ORG_UPDATED,
    entity: "Org",
    entityId: updated.id,
    metadata: { changedFields: Object.keys(data) },
  });

  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  const session = await auth();
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

  await logAudit({
    orgId: session.user.orgId,
    userId: session.user.id,
    action: ACTIONS.ORG_DELETED,
    entity: "Org",
    entityId: org.id,
    metadata: { orgName: org.name },
  });

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.deleteMany({ where: { orgId: org.id } });
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
