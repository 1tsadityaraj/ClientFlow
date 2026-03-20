import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";
import { logAudit, ACTIONS } from "@/lib/audit.js";
import { logActivity, ACTION_TYPES } from "@/lib/activity.js";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["admin", "manager", "member", "client"]),
});

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    assertPermission(session, 'manageMembers')

    const { id: memberId } = await params;

    // Prevent self-removal
    if (memberId === session.user.id) {
      return Response.json(
        { error: 'You cannot remove yourself' },
        { status: 400 }
      )
    }

    // Find member and verify same org (tenant isolation)
    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        orgId: session.user.orgId,  // CRITICAL: must be same org
      }
    })

    if (!member) {
      return Response.json(
        { error: 'Member not found or access denied' },
        { status: 404 }
      )
    }

    // Delete in correct order to avoid foreign key violations
    await prisma.$transaction([
      // Delete their files
      prisma.file.deleteMany({
        where: { uploadedById: memberId }
      }),
      // Delete their audit logs
      prisma.auditLog.deleteMany({
        where: { userId: memberId }
      }),
      // Delete their activity logs
      prisma.activityLog.deleteMany({
        where: { userId: memberId, orgId: session.user.orgId }
      }),
      // Delete their messages
      prisma.message.deleteMany({
        where: { userId: memberId, orgId: session.user.orgId }
      }),
      // Delete their comments
      prisma.comment.deleteMany({
        where: { userId: memberId, orgId: session.user.orgId }
      }),
      // Unassign their tasks (don't delete, just unassign)
      prisma.task.updateMany({
        where: { assigneeId: memberId, orgId: session.user.orgId },
        data: { assigneeId: null }
      }),
      // Remove as project manager (set to current user)
      prisma.project.updateMany({
        where: { managerId: memberId, orgId: session.user.orgId },
        data: { managerId: session.user.id }
      }),
      // Remove as client from projects
      prisma.project.updateMany({
        where: { clientUserId: memberId, orgId: session.user.orgId },
        data: { clientUserId: null }
      }),
      // Finally delete the user
      prisma.user.delete({
        where: { id: memberId }
      })
    ])

    await logAudit({
      orgId: session.user.orgId,
      userId: session.user.id,
      action: ACTIONS.MEMBER_REMOVED,
      entity: "User",
      entityId: memberId,
      metadata: {
        name: member.name,
        email: member.email,
        role: member.role,
        message: `${session.user.name || "Admin"} removed ${member.name} (${member.email}) from the workspace`,
      },
    });

    // Log the activity
    await logActivity({
      orgId: session.user.orgId,
      userId: session.user.id,
      action: ACTION_TYPES.MEMBER_REMOVED,
      entityType: 'member',
      entityId: memberId,
      entityName: member.name,
    })

    return Response.json({ success: true, message: 'Member removed successfully' })

  } catch (err) {
    console.error('Remove member error:', err)
    
    if (err.message === 'FORBIDDEN') {
      return Response.json({ error: 'Permission denied' }, { status: 403 })
    }
    
    return Response.json(
      { error: 'Failed to remove member', details: err.message },
      { status: 500 }
    )
  }
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
