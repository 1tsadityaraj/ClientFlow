import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth.js";
import { authLimiter, checkRateLimit } from "../../../../lib/rateLimit.js";

const handler = NextAuth(authOptions);

export { handler as GET };

export async function POST(request, context) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimitResponse = await checkRateLimit(authLimiter, ip);
  if (rateLimitResponse) return rateLimitResponse;

  return handler(request, context);
}

