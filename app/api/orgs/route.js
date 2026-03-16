export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";
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
  try {
    const session = await auth();
    if (session) {
      // Already signed in, cannot create another org via this endpoint
      try {
        assertPermission(session, "updateOrg");
      } catch {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const json = await request.json();
    console.log("[API/ORGS] Received signup request for:", json.email);
    const parsed = createOrgSchema.safeParse(json);

    if (!parsed.success) {
      console.log("[API/ORGS] Validation failed:", parsed.error.issues);
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

    console.log("[API/ORGS] Successfully created org:", result.org.slug);
    return Response.json(
      { org: result.org, user: result.user },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API/ORGS] Critical error during signup:", error);
    return Response.json(
      { 
        error: "Internal Server Error", 
        message: error.message,
        details: error.stack
      },
      { status: 500 }
    );
  }
}

