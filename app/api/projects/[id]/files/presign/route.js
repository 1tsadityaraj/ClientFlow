import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth.js";
import { prisma } from "../../../../../../lib/prisma.js";
import { assertPermission } from "../../../../../../lib/permissions.js";
import { generatePresignedUrl } from "../../../../../../lib/s3.js";
import { z } from "zod";

const presignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
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
  const parsed = presignSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { filename, contentType } = parsed.data;
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const key = `${session.user.orgId}/${project.id}/${timestamp}-${safeName}`;

  let uploadUrl;
  try {
    uploadUrl = await generatePresignedUrl(key, contentType);
  } catch (error) {
    return Response.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }

  const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(
    key
  )}`;

  return Response.json({
    uploadUrl,
    key,
    publicUrl,
  });
}

