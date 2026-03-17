import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { z } from "zod";
import { pusher } from "@/lib/pusher";

const messageSchema = z.object({
  text: z.string().min(1).max(2000),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const messages = await prisma.message.findMany({
      where: { 
        orgId: session.user.orgId,
        createdAt: { gte: ninetyDaysAgo }
      },
      orderBy: { createdAt: "asc" },
      take: 50,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const count = await prisma.message.count({
      where: { orgId: session.user.orgId }
    });

    return Response.json({ messages, totalCount: count });
  } catch (error) {
    console.error("[API/CHAT] GET error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.orgId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const result = messageSchema.safeParse(json);

    if (!result.success) {
      return Response.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        orgId: session.user.orgId,
        userId: session.user.id,
        body: result.data.text,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Trigger Pusher event
    await pusher.trigger(`org-${session.user.orgId}`, "new-message", {
      id: message.id,
      text: message.body,
      createdAt: message.createdAt,
      user: message.user
    });

    return Response.json(message, { status: 201 });
  } catch (error) {
    console.error("[API/CHAT] POST error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
