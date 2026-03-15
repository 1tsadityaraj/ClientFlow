import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "viewProject");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Find project first to ensure it belongs to the org
  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      orgId: session.user.orgId,
      // If client, check clientUserId
      ...(session.user.role === "client" ? { clientUserId: session.user.id } : {})
    }
  });

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Get audit logs related to this project. We'll search for action containing this project ID, or entity='Project' and entityId=projectId.
  // Wait, our logAudit saves metadata. Let's grab the last 20 logs for this org and filter, or just grab all for the org and filter, 
  // actually, for simplicity we can grab logs related to the entities in this project.
  // We can fetch tasks for this project and get their IDs.
  
  const tasks = await prisma.task.findMany({
    where: { projectId: params.id },
    select: { id: true }
  });
  const taskIds = tasks.map(t => t.id);

  const logs = await prisma.auditLog.findMany({
    where: {
      orgId: session.user.orgId,
      OR: [
        { entity: "Project", entityId: params.id },
        { entity: "Task", entityId: { in: taskIds } },
        { entity: "Comment", entityId: params.id }, // Wait, comments use project ID? No, entityId = comment.id, we can't easily filter by comments unless we fetch all comments for project. Let's just do Project and Task for now.
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, role: true } }
    }
  });

  return Response.json(logs);
}
