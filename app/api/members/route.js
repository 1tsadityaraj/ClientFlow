import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth.js";
import { prisma } from "../../../lib/prisma.js";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { orgId: session.user.orgId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      avatar: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(users);
}

