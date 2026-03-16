export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: { orgId: session.user.orgId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    // Return in chronological order
    return Response.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("[API/CHAT] GET error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { body } = await request.json();
    if (!body?.trim()) {
      return Response.json({ error: "Message body is required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        orgId: session.user.orgId,
        userId: session.user.id,
        body: body.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    return Response.json(message, { status: 201 });
  } catch (error) {
    console.error("[API/CHAT] POST error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
