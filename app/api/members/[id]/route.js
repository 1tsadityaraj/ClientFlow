import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";
import { logAudit, ACTIONS } from "@/lib/audit.js";
import { logActivity, ACTION_TYPES } from "@/lib/activity.js";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["admin", "manager", "member", "client"]),
});

export async function DELETE(_request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "manageMembers");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return Response.json(
      { error: "Cannot remove yourself" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { id, orgId: session.user.orgId },
  });

  if (!user) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Cascade: delete all related records before deleting the user
  // Use a transaction for data integrity
  await prisma.$transaction([
    // Delete comments by this user
    prisma.comment.deleteMany({ where: { userId: user.id } }),
    // Delete tasks assigned to this user (unassign instead of delete)
    prisma.task.updateMany({
      where: { assigneeId: user.id },
      data: { assigneeId: null },
    }),
    // Delete files uploaded by this user
    prisma.file.deleteMany({ where: { uploadedById: user.id } }),
    // Delete audit logs by this user
    prisma.auditLog.deleteMany({ where: { userId: user.id } }),
    // Delete messages by this user
    prisma.message.deleteMany({ where: { userId: user.id } }),
    // Unassign from managed projects
    prisma.project.updateMany({
      where: { managerId: user.id, orgId: session.user.orgId },
      data: { managerId: session.user.id }, // Transfer to current admin
    }),
    // Unassign from client projects
    prisma.project.updateMany({
      where: { clientUserId: user.id },
      data: { clientUserId: null },
    }),
    // Finally, delete the user
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  // Log after transaction succeeds (with the session user, since the removed user's logs are deleted)
  await logAudit({
    orgId: session.user.orgId,
    userId: session.user.id,
    action: ACTIONS.MEMBER_REMOVED,
    entity: "User",
    entityId: user.id,
    metadata: {
      name: user.name,
      email: user.email,
      role: user.role,
      message: `${session.user.name || "Admin"} removed ${user.name} (${user.email}) from the workspace`,
    },
  });

  logActivity({
    orgId: session.user.orgId,
    userId: session.user.id,
    action: ACTION_TYPES.MEMBER_REMOVED,
    entityType: 'member',
    entityId: user.id,
    entityName: user.name
  });

  return Response.json({ success: true });
}

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "changeRoles");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const json = await request.json();
  const parsed = updateRoleSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { id, orgId: session.user.orgId },
  });

  if (!user) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const previousRole = user.role;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: parsed.data.role },
  });

  await logAudit({
    orgId: session.user.orgId,
    userId: session.user.id,
    action: ACTIONS.MEMBER_ROLE_CHANGED,
    entity: "User",
    entityId: user.id,
    metadata: {
      name: user.name,
      from: previousRole,
      to: parsed.data.role,
      message: `${session.user.name || "Admin"} changed ${user.name}'s role from ${previousRole} to ${parsed.data.role}`,
    },
  });

  logActivity({
    orgId: session.user.orgId,
    userId: session.user.id,
    action: ACTION_TYPES.ROLE_CHANGED,
    entityType: 'member',
    entityId: user.id,
    entityName: user.name,
    metadata: { oldRole: previousRole, newRole: parsed.data.role }
  });

  return Response.json(updated);
}
