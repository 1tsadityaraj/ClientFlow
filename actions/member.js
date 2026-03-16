"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/permissions";
import { logAudit, ACTIONS } from "@/lib/audit";
import { z } from "zod";

// ─── Zod Schemas ────────────────────────────────────────
const deleteSchema = z.object({
  memberId: z.string().cuid(),
  action: z.literal("DELETE"),
});

const updateRoleSchema = z.object({
  memberId: z.string().cuid(),
  action: z.literal("UPDATE_ROLE"),
  data: z.object({
    role: z.enum(["admin", "manager", "member", "client"]),
  }),
});

const manageMemberSchema = z.discriminatedUnion("action", [
  deleteSchema,
  updateRoleSchema,
]);

// ─── Role Hierarchy (higher number = more powerful) ─────
const ROLE_HIERARCHY = {
  client: 0,
  member: 1,
  manager: 2,
  admin: 3,
};

/**
 * Unified Server Action for managing members.
 * 
 * @param {string} memberId - The ID of the member to manage
 * @param {"DELETE" | "UPDATE_ROLE"} action - The action to perform
 * @param {object} [data] - Extra data (e.g. { role: "manager" })
 * @returns {{ success: boolean, error?: string }}
 */
export async function manageMember(memberId, action, data) {
  const session = await auth();
  if (!session) {
    return { error: "Unauthorized" };
  }

  // ── Validate input with Zod ───────────────────────────
  const input = { memberId, action, ...(data ? { data } : {}) };
  const parsed = manageMemberSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    return { error: `Validation failed: ${msg}` };
  }

  // ── Permission: Only ADMIN can change roles / delete ──
  const callerRole = session.user.role;
  if (callerRole !== "admin") {
    return { error: "Only admins can manage member roles and removal" };
  }

  // ── Cannot modify yourself ────────────────────────────
  if (memberId === session.user.id) {
    return { error: "Cannot modify your own account" };
  }

  // ── Fetch target member (scoped to org) ───────────────
  const target = await prisma.user.findFirst({
    where: { id: memberId, orgId: session.user.orgId },
  });

  if (!target) {
    return { error: "Member not found" };
  }

  // ── Security: Manager cannot delete or change an Admin ─
  // (extended: no one can modify a user of equal or higher rank unless you're admin)
  if (
    ROLE_HIERARCHY[target.role] >= ROLE_HIERARCHY[callerRole] &&
    callerRole !== "admin"
  ) {
    return { error: "Cannot modify a member of equal or higher rank" };
  }

  // ─────────────────────────────────────────────────────────
  // ACTION: DELETE
  // ─────────────────────────────────────────────────────────
  if (action === "DELETE") {
    try {
      await prisma.$transaction([
        prisma.comment.deleteMany({ where: { userId: target.id } }),
        prisma.task.updateMany({
          where: { assigneeId: target.id },
          data: { assigneeId: null },
        }),
        prisma.file.deleteMany({ where: { uploadedById: target.id } }),
        prisma.auditLog.deleteMany({ where: { userId: target.id } }),
        prisma.message.deleteMany({ where: { userId: target.id } }),
        prisma.project.updateMany({
          where: { managerId: target.id, orgId: session.user.orgId },
          data: { managerId: session.user.id },
        }),
        prisma.project.updateMany({
          where: { clientUserId: target.id },
          data: { clientUserId: null },
        }),
        prisma.user.delete({ where: { id: target.id } }),
      ]);

      await logAudit({
        orgId: session.user.orgId,
        userId: session.user.id,
        action: ACTIONS.MEMBER_REMOVED,
        entity: "User",
        entityId: target.id,
        metadata: {
          name: target.name,
          email: target.email,
          role: target.role,
          message: `${session.user.name || "Admin"} removed ${target.name} (${target.email}) from the workspace`,
        },
      });

      return { success: true };
    } catch (err) {
      console.error("[manageMember] DELETE error:", err);
      return { error: "Failed to remove member" };
    }
  }

  // ─────────────────────────────────────────────────────────
  // ACTION: UPDATE_ROLE
  // ─────────────────────────────────────────────────────────
  if (action === "UPDATE_ROLE") {
    const newRole = parsed.data.data.role;

    // Extra guard: only admin can promote someone to admin
    if (newRole === "admin" && callerRole !== "admin") {
      return { error: "Only admins can promote to admin" };
    }

    try {
      const previousRole = target.role;

      await prisma.user.update({
        where: { id: target.id },
        data: { role: newRole },
      });

      await logAudit({
        orgId: session.user.orgId,
        userId: session.user.id,
        action: ACTIONS.MEMBER_ROLE_CHANGED,
        entity: "User",
        entityId: target.id,
        metadata: {
          name: target.name,
          from: previousRole,
          to: newRole,
          message: `${session.user.name || "Admin"} changed ${target.name}'s role from ${previousRole} to ${newRole}`,
        },
      });

      return { success: true, newRole };
    } catch (err) {
      console.error("[manageMember] UPDATE_ROLE error:", err);
      return { error: "Failed to update role" };
    }
  }

  return { error: "Unknown action" };
}
