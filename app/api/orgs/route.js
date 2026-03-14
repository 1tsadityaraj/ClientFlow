import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";
import { assertPermission } from "../../../lib/permissions.js";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createOrgSchema = z.object({
  orgName: z.string().min(1),
  orgSlug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (session) {
    // Already signed in, cannot create another org via this endpoint
    try {
      assertPermission(session, "updateOrg");
    } catch {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const json = await request.json();
  const parsed = createOrgSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;

  const existingSlug = await prisma.org.findUnique({
    where: { slug: data.orgSlug },
  });

  if (existingSlug) {
    return Response.json(
      { error: "Slug already taken" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.org.create({
      data: {
        name: data.orgName,
        slug: data.orgSlug,
      },
    });

    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        hashedPassword: passwordHash,
        orgId: org.id,
        role: "admin",
      },
    });

    return { org, user };
  });

  return Response.json(
    { org: result.org, user: result.user },
    { status: 201 }
  );
}

