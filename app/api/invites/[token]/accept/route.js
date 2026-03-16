import { prisma } from "@/lib/prisma.js";
import { z } from "zod";
import bcrypt from "bcryptjs";

const acceptSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request, { params }) {
  const { token } = await params;

  const json = await request.json();
  const parsed = acceptSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const invite = await prisma.invite.findFirst({
    where: { token },
  });

  if (!invite) {
    return Response.json({ error: "Invalid invite token" }, { status: 404 });
  }

  if (invite.expiresAt < new Date()) {
    return Response.json({ error: "Invite has expired" }, { status: 410 });
  }

  if (invite.acceptedAt) {
    return Response.json(
      { error: "Invite has already been used" },
      { status: 409 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
  });

  if (existingUser) {
    return Response.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const { name, password } = parsed.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email: invite.email,
        hashedPassword,
        orgId: invite.orgId,
        role: invite.role,
      },
    });

    await tx.invite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    return user;
  });

  return Response.json(
    { success: true, email: result.email },
    { status: 201 }
  );
}

