import { auth } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";
import { assertPermission } from "../../../lib/permissions.js";
import { inviteLimiter, checkRateLimit } from "../../../lib/rateLimit.js";
import { sendInviteEmail } from "../../../lib/email.js";
import { z } from "zod";
import crypto from "crypto";

const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "manager", "member", "client"]),
});

export async function POST(request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "inviteMembers");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimitResponse = await checkRateLimit(
    inviteLimiter,
    session.user.orgId
  );
  if (rateLimitResponse) return rateLimitResponse;

  const json = await request.json();
  const parsed = createInviteSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const data = parsed.data;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);

  const invite = await prisma.invite.create({
    data: {
      orgId: session.user.orgId,
      email: data.email,
      role: data.role,
      token,
      expiresAt,
    },
  });

  const org = await prisma.org.findUnique({
    where: { id: session.user.orgId },
  });

  let emailSent = false;
  const emailResult = await sendInviteEmail({
    to: data.email,
    inviterName: session.user.name ?? "A team member",
    orgName: org?.name ?? "the workspace",
    role: data.role,
    token: invite.token,
  });

  if (emailResult.success) {
    emailSent = true;
  } else {
    console.error("[invites] Failed to send invite email:", emailResult.error);
  }

  return Response.json(
    {
      invite: {
        id: invite.id,
        token: invite.token,
        email: invite.email,
        role: invite.role,
      },
      emailSent,
    },
    { status: 201 }
  );
}

