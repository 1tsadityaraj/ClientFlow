export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";
import { logAudit, ACTIONS } from "@/lib/audit.js";
import { createProjectSchema, validate } from "@/lib/validations.js";
import { revalidatePath } from "next/cache";

export async function GET() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = { orgId: session.user.orgId };

  if (session.user.role === "client") {
    where.clientUserId = session.user.id;
  }

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return Response.json(projects);
}

export async function POST(request) {
  console.log(">>> [API/PROJECTS] POST request entry");
  try {
    const session = await auth();
    console.log("[API/PROJECTS] POST - Session user:", session?.user?.email, "Role:", session?.user?.role);
    
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      assertPermission(session, "createProject");
    } catch {
      console.log("[API/PROJECTS] POST - Permission denied for role:", session.user.role);
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await request.json();
    console.log("[API/PROJECTS] POST - Incoming Body:", JSON.stringify(json, null, 2));

    const { data, error } = validate(createProjectSchema, json);
    if (error) {
      console.log("[API/PROJECTS] POST - Validation failed. Errors:", error);
      return Response.json({ error }, { status: 422 });
    }

    console.log("[API/PROJECTS] POST - Validation successful. Data:", JSON.stringify(data));

    const project = await prisma.project.create({
      data: {
        orgId: session.user.orgId,
        name: data.name,
        description: data.description,
        color: data.color ?? "#6366f1",
        clientUserId: data.clientUserId ?? null,
        managerId: session.user.id,
      },
    });
    console.log("[API/PROJECTS] POST - Project created successfully:", project.id);

    await logAudit({
      orgId: session.user.orgId,
      userId: session.user.id,
      action: ACTIONS.PROJECT_CREATED,
      entity: "Project",
      entityId: project.id,
      metadata: { name: project.name },
    });

    revalidatePath("/dashboard");

    return Response.json(project, { status: 201 });
  } catch (err) {
    console.error("[API/PROJECTS] POST - Internal Error:", err);
    return Response.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
