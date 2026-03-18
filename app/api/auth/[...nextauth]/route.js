export const dynamic = "force-dynamic";
import { handlers } from "@/lib/auth.js";
import { authLimiter, checkRateLimit } from "@/lib/rateLimit.js";

export const GET = handlers.GET;

export async function POST(request, context) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimitResponse = await checkRateLimit(authLimiter, ip);
    if (rateLimitResponse) return rateLimitResponse;

    return await handlers.POST(request, context);
  } catch (error) {
    console.error("NextAuth API Route Error (POST):", error);
    return Response.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
