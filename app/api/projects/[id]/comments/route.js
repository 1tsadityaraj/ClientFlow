import { auth } from "../../../../../lib/auth.js";
import { prisma } from "../../../../../lib/prisma.js";
import { assertPermission } from "../../../../../lib/permissions.js";
import { z } from "zod";

const createCommentSchema = z.object({
  body: z.string().min(1).max(5000),
});

export async function GET(_request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, orgId: session.user.orgId },
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
      projectId: params.id,
    },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(comments);
}

export async function POST(request, { params }) {
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
    where: { id: params.id, orgId: session.user.orgId },
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
  const parsed = createCommentSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;

  const comment = await prisma.comment.create({
    data: {
      orgId: session.user.orgId,
      projectId: project.id,
      userId: session.user.id,
      body: data.body,
    },
  });

  return Response.json(comment, { status: 201 });
}

