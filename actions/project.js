"use server";

import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { assertPermission } from "../lib/permissions.js";
import { logAudit, ACTIONS } from "../lib/audit.js";
import { createProjectSchema, validate } from "../lib/validations.js";
import { revalidatePath } from "next/cache";
import { withOrgScope } from "../lib/orgScope.js";

export async function createProject(formData) {
  console.log("[ACTION/PROJECT] createProject called with:", JSON.stringify(formData));
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    assertPermission(session, "createProject");
  } catch {
    throw new Error("Forbidden");
  }

  const { data, error } = validate(createProjectSchema, formData);
  if (error) {
    return { error };
  }

  try {
    const scopedPrisma = !!withOrgScope ? withOrgScope(session.user.orgId) : prisma;
    
    // Instead of raw prisma.project, use scoped
    const project = await scopedPrisma.project.create({
      data: {
        orgId: session.user.orgId, // needed because create withOrgScope only sets where not data
        name: data.name,
        description: data.description || null,
        color: data.color || "#6366f1",
        clientUserId: data.clientUserId || null,
        managerId: session.user.id,
      },
    });

    await logAudit({
      orgId: session.user.orgId,
      userId: session.user.id,
      action: ACTIONS.PROJECT_CREATED,
      entity: "Project",
      entityId: project.id,
      metadata: { name: project.name },
    });

    revalidatePath("/dashboard");
    return { success: true, project };
  } catch (err) {
    console.error("[actions/project] createProject error:", err);
    return { error: err.message || "Failed to create project" };
  }
}
