import { auth } from "../../../../../lib/auth.js";
import { prisma } from "../../../../../lib/prisma.js";
import { assertPermission } from "../../../../../lib/permissions.js";
import { generateDownloadUrl } from "../../../../../lib/s3.js";
import { z } from "zod";

const createFileSchema = z.object({
  name: z.string().min(1),
  key: z.string().min(1),
  size: z.string().min(1),
  type: z.string().min(1),
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

  const files = await prisma.file.findMany({
    where: {
      orgId: session.user.orgId,
      projectId: params.id,
    },
    include: { uploadedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const filesWithDownloadUrl = await Promise.all(
    files.map(async (file) => {
      let downloadUrl = null;
      try {
        downloadUrl = await generateDownloadUrl(file.url);
      } catch {
        // If S3 is not configured or URL generation fails, omit the download URL
      }
      return {
        ...file,
        downloadUrl,
      };
    })
  );

  return Response.json(filesWithDownloadUrl);
}

export async function POST(request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "uploadFiles");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, orgId: session.user.orgId },
  });

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const json = await request.json();
  const parsed = createFileSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;

  const file = await prisma.file.create({
    data: {
      orgId: session.user.orgId,
      projectId: project.id,
      name: data.name,
      url: data.key,
      size: data.size,
      type: data.type,
      uploadedById: session.user.id,
    },
    include: { uploadedBy: { select: { name: true } } },
  });

  return Response.json(file, { status: 201 });
}

