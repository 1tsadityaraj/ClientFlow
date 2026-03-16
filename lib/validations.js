import { z } from "zod";

// ─── Project ────────────────────────────────────────────
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be under 100 characters"),
  description: z.string().max(500).optional().nullable(),
  clientUserId: z.string().min(1).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color")
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(["active", "completed", "on_hold"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  clientUserId: z.string().min(1).optional().nullable(),
});

// ─── Task ───────────────────────────────────────────────
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Task title must be under 200 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
  assigneeId: z.string().min(1).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assigneeId: z.string().min(1).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

// ─── Comment ────────────────────────────────────────────
export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, "Comment body is required")
    .max(2000, "Comment must be under 2000 characters"),
});

// ─── Organization ───────────────────────────────────────
export const createOrgSchema = z.object({
  orgName: z
    .string()
    .min(1, "Organization name is required")
    .max(100),
  orgSlug: z
    .string()
    .min(1, "Slug is required")
    .max(60)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  name: z.string().min(1, "Your name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  logoUrl: z.string().url().optional().nullable(),
});

// ─── Members ────────────────────────────────────────────
export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "manager", "member", "client"]),
});

export const updateRoleSchema = z.object({
  role: z.enum(["admin", "manager", "member", "client"]),
});

// ─── File Presign ───────────────────────────────────────
export const presignFileSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
});

export const createFileSchema = z.object({
  name: z.string().min(1).max(255),
  key: z.string().min(1),
  size: z.string().min(1),
  type: z.string().min(1).max(100),
});

// ─── Helper ─────────────────────────────────────────────
/**
 * Parse and validate request body against a Zod schema.
 * Returns { data, error }
 */
export function validate(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join(", ");
    return { data: null, error: messages };
  }
  return { data: result.data, error: null };
}
