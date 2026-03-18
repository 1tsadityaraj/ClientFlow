import { prisma } from './prisma'

export const ACTION_TYPES = {
  // Projects
  PROJECT_CREATED:   'project_created',
  PROJECT_UPDATED:   'project_updated',
  PROJECT_DELETED:   'project_deleted',
  PROJECT_COMPLETED: 'project_completed',

  // Tasks
  TASK_CREATED:      'task_created',
  TASK_COMPLETED:    'task_completed',
  TASK_UPDATED:      'task_updated',
  TASK_ASSIGNED:     'task_assigned',

  // Files
  FILE_UPLOADED:     'file_uploaded',
  FILE_DELETED:      'file_deleted',

  // Comments
  COMMENT_ADDED:     'comment_added',

  // Members
  MEMBER_INVITED:    'member_invited',
  MEMBER_JOINED:     'member_joined',
  MEMBER_REMOVED:    'member_removed',
  ROLE_CHANGED:      'role_changed',
}

export async function logActivity({
  orgId,
  projectId = null,
  userId,
  action,
  entityType,
  entityId = null,
  entityName = null,
  metadata = null,
}) {
  try {
    await prisma.activityLog.create({
      data: {
        orgId,
        projectId,
        userId,
        action,
        entityType,
        entityId,
        entityName,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
  } catch (err) {
    // Never let activity logging crash the main request
    console.error('Activity log failed:', err)
  }
}

// Human readable descriptions for each action
export function getActivityDescription(log) {
  const name = log.entityName || 'item'
  const descriptions = {
    project_created:   `created project "${name}"`,
    project_updated:   `updated project "${name}"`,
    project_deleted:   `deleted project "${name}"`,
    project_completed: `completed project "${name}"`,
    task_created:      `created task "${name}"`,
    task_completed:    `completed task "${name}"`,
    task_updated:      `updated task "${name}"`,
    task_assigned:     `assigned task "${name}"`,
    file_uploaded:     `uploaded file "${name}"`,
    file_deleted:      `deleted file "${name}"`,
    comment_added:     `commented on "${name}"`,
    member_invited:    `invited ${name} to the workspace`,
    member_joined:     `${name} joined the workspace`,
    member_removed:    `removed ${name} from the workspace`,
    role_changed:      `changed ${name}'s role`,
  }
  return descriptions[log.action] || log.action
}

// Icon and color for each action type
export function getActivityMeta(action) {
  const meta = {
    project_created:   { icon: '⊞', color: '#6366f1' },
    project_updated:   { icon: '✎', color: '#6366f1' },
    project_deleted:   { icon: '⊟', color: '#ef4444' },
    project_completed: { icon: '✓', color: '#22d3a0' },
    task_created:      { icon: '+', color: '#6366f1' },
    task_completed:    { icon: '✓', color: '#22d3a0' },
    task_updated:      { icon: '✎', color: '#f59e0b' },
    task_assigned:     { icon: '→', color: '#38bdf8' },
    file_uploaded:     { icon: '↑', color: '#8b5cf6' },
    file_deleted:      { icon: '×', color: '#ef4444' },
    comment_added:     { icon: '💬', color: '#06b6d4' },
    member_invited:    { icon: '✉', color: '#f59e0b' },
    member_joined:     { icon: '⊕', color: '#22d3a0' },
    member_removed:    { icon: '⊖', color: '#ef4444' },
    role_changed:      { icon: '⟳', color: '#8b5cf6' },
  }
  return meta[action] || { icon: '●', color: '#6b6b8a' }
}
