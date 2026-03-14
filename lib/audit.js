import { prisma } from "./prisma.js";

/**
 * Log an auditable action.
 *
 * @param {{
 *   orgId: string,
 *   userId: string,
 *   action: string,
 *   entity: string,
 *   entityId?: string,
 *   metadata?: Record<string, any>
 * }} params
 */
export async function logAudit({
  orgId,
  userId,
  action,
  entity,
  entityId,
  metadata,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        orgId,
        userId,
        action,
        entity,
        entityId: entityId ?? null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (err) {
    // Audit failures should never break the main operation
    console.error("[audit] Failed to log:", err?.message);
  }
}

// ─── Action Constants ───────────────────────────────────
export const ACTIONS = {
  // Projects
  PROJECT_CREATED: "project.created",
  PROJECT_UPDATED: "project.updated",
  PROJECT_DELETED: "project.deleted",

  // Tasks
  TASK_CREATED: "task.created",
  TASK_UPDATED: "task.updated",
  TASK_STATUS_CHANGED: "task.status_changed",

  // Comments
  COMMENT_ADDED: "comment.added",

  // Files
  FILE_UPLOADED: "file.uploaded",

  // Members
  MEMBER_INVITED: "member.invited",
  MEMBER_ROLE_CHANGED: "member.role_changed",
  MEMBER_REMOVED: "member.removed",

  // Org
  ORG_UPDATED: "org.updated",
  ORG_DELETED: "org.deleted",
};
