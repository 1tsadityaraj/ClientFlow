import { auth } from "@/lib/auth.js";
import { isStripeEnabled } from "@/lib/stripe.js";
import { isS3Enabled } from "@/lib/s3.js";
import { prisma } from "@/lib/prisma.js";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check Database
  let dbConnected = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (e) {
    dbConnected = false;
  }

  // Check Resend
  const resendKey = process.env.RESEND_API_KEY;
  const resendConfigured = !!resendKey && !resendKey.includes("placeholder");

  // Check Pusher
  const pusherConfigured = !!(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET
  );

  // Check NextAuth
  const nextAuthSecret = !!process.env.NEXTAUTH_SECRET;

  return Response.json({
    database: { name: "Database (PostgreSQL)", status: dbConnected },
    pusher: { name: "Pusher (Real-time chat)", status: pusherConfigured },
    nextAuth: { name: "NextAuth", status: nextAuthSecret },
    stripe: { name: "Stripe (Billing)", status: isStripeEnabled(), envVar: "STRIPE_SECRET_KEY" },
    resend: { name: "Resend (Email)", status: resendConfigured, envVar: "RESEND_API_KEY" },
    s3: { name: "AWS S3 (File uploads)", status: isS3Enabled(), envVar: "AWS_ACCESS_KEY_ID" },
  });
}
