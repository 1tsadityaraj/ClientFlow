export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth.js";
import { prisma } from "@/lib/prisma.js";
import { assertPermission } from "@/lib/permissions.js";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      assertPermission(session, "sendMessage");
    } catch {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = 50;

    const where = { orgId: session.user.orgId };

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
      },
    });

    return Response.json({
      messages: messages.reverse(), // Return in chronological order
      nextCursor: messages.length === limit ? messages[0].id : null,
    });
  } catch (error) {
    console.error("[API/MESSAGES] GET error:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      assertPermission(session, "sendMessage");
    } catch {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await request.json();
    const body = json.body?.trim();

    if (!body || body.length === 0) {
      return Response.json({ error: "Message body is required" }, { status: 422 });
    }

    if (body.length > 2000) {
      return Response.json(
        { error: "Message must be under 2000 characters" },
        { status: 422 }
      );
    }

    const message = await prisma.message.create({
      data: {
        orgId: session.user.orgId,
        userId: session.user.id,
        body,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
      },
    });

    return Response.json(message, { status: 201 });
  } catch (error) {
    console.error("[API/MESSAGES] POST error:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
