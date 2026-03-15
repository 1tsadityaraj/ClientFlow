import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["admin", "manager", "member", "client"]),
});

export async function DELETE(_request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "manageMembers");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (params.id === session.user.id) {
    return Response.json(
      { error: "Cannot remove yourself" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: params.id, orgId: session.user.orgId },
  });

  if (!user) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.user.delete({
    where: { id: user.id },
  });

  return Response.json({ success: true });
}

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session, "changeRoles");
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json();
  const parsed = updateRoleSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { id: params.id, orgId: session.user.orgId },
  });

  if (!user) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: parsed.data.role },
  });

  return Response.json(updated);
}

