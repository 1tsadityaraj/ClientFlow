export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma.js";

export async function GET(request) {
  // Only works with secret header for security
  const secret = request.headers.get("x-seed-secret");
  if (!secret || !process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userCount = await prisma.user.count();
    const orgCount = await prisma.org.count();

    return Response.json({
      environment: process.env.NODE_ENV,
      database: {
        connected: true,
        userCount,
        orgCount,
      },
      envVars: {
        SEED_SECRET: !!process.env.SEED_SECRET,
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        AUTH_SECRET: !!process.env.AUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        AUTH_URL: process.env.AUTH_URL,
        DATABASE_URL: process.env.DATABASE_URL ? "set" : "missing",
        RESEND_API_KEY: !!process.env.RESEND_API_KEY,
        AWS_ENDPOINT_URL: !!process.env.AWS_ENDPOINT_URL,
        PUSHER_APP_ID: !!process.env.PUSHER_APP_ID,
        UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_SHOW_DEMO_HINT: process.env.NEXT_PUBLIC_SHOW_DEMO_HINT,
      },
    });
  } catch (err) {
    return Response.json(
      {
        error: "Database connection failed",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
