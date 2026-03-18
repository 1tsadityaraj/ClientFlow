import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [userCount, orgCount, projectCount, alice] = await Promise.all([
    prisma.user.count(),
    prisma.org.count(),
    prisma.project.count(),
    prisma.user.findUnique({ where: { email: "alice@pixel.co" } }),
  ]);

  return Response.json({
    seeded: !!alice,
    userCount,
    orgCount,
    projectCount,
  });
}
