export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";
import { logAudit, ACTIONS } from "@/lib/audit.js";
import { logActivity, ACTION_TYPES } from "@/lib/activity.js";
import { createCommentSchema, validate } from "@/lib/validations.js";

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id: id, orgId: session.user.orgId },
  });

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (
    session.user.role === "client" &&
    project.clientUserId !== session.user.id
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const comments = await prisma.comment.findMany({
    where: {
      orgId: session.user.orgId,
      projectId: id,
    },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(comments);
}

export async function POST(request, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "comment");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await prisma.project.findFirst({
    where: { id: id, orgId: session.user.orgId },
  });

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (
    session.user.role === "client" &&
    project.clientUserId !== session.user.id
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json();
  const { data, error } = validate(createCommentSchema, json);

  if (error) {
    return Response.json({ error }, { status: 422 });
  }

  const comment = await prisma.comment.create({
    data: {
      orgId: session.user.orgId,
      projectId: project.id,
      userId: session.user.id,
      body: data.body,
    },
    include: { user: { select: { name: true } } }
  });

  await logAudit({
    orgId: session.user.orgId,
    userId: session.user.id,
    action: ACTIONS.COMMENT_ADDED,
    entity: "Comment",
    entityId: comment.id,
    metadata: { project: project.name },
  });

  logActivity({
    orgId: session.user.orgId,
    userId: session.user.id,
    projectId: project.id,
    action: ACTION_TYPES.COMMENT_ADDED,
    entityType: 'comment',
    entityId: comment.id,
    entityName: project.name
  });

  return Response.json(comment, { status: 201 });
}
