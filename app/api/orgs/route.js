export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email.js";

const createOrgSchema = z.object({
  orgName: z.string().min(1),
  orgSlug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request) {
  try {
    // 1. Database Connection Check
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error("Database connection check failed:", dbError);
      return Response.json(
        { error: "Database unavailable", message: "Failed to connect to the database" },
        { status: 503 }
      );
    }

    const json = await request.json();
    console.log("[API/ORGS] Signup attempt for email:", json.email);

    const parsed = createOrgSchema.safeParse(json);
    if (!parsed.success) {
      console.log("[API/ORGS] Validation failed:", parsed.error.issues);
      return Response.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // Check for existing org slug (though unique constraint will catch it too)
    const existingSlug = await prisma.org.findUnique({
      where: { slug: data.orgSlug },
    });

    if (existingSlug) {
      return Response.json(
        { error: "Workspace slug already taken" },
        { status: 409 }
      );
    }

    // Check for existing user email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return Response.json(
        { error: "User with this email already exists" },
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

    console.log("[API/ORGS] Successfully created org and user:", result.org.slug);

    // Send welcome email (asynchronously, don't block response)
    sendWelcomeEmail({
      to: result.user.email,
      name: result.user.name,
      orgName: result.org.name,
      plan: result.org.plan,
    }).catch((err) => console.error("Failed to send welcome email:", err));
    return Response.json(
      { org: result.org, user: result.user },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orgs error:", error);

    // Prisma specific error codes
    if (error.code === "P2002") {
      return Response.json(
        { error: "Unique constraint failed", message: "Email or slug already exists" },
        { status: 409 }
      );
    }

    if (error.code === "P1001") {
      return Response.json(
        { error: "Database connection failed", message: "Could not reach the database server" },
        { status: 503 }
      );
    }

    return Response.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

