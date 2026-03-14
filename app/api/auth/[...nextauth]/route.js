import { handlers } from "../../../../lib/auth.js";
import { authLimiter, checkRateLimit } from "../../../../lib/rateLimit.js";

export const GET = handlers.GET;

export async function POST(request, context) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimitResponse = await checkRateLimit(authLimiter, ip);
  if (rateLimitResponse) return rateLimitResponse;

  return handlers.POST(request, context);
}

