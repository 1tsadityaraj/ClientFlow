import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/** Sliding window: 10 requests per 15 minutes (auth sign-in). */
export const authLimiter =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "15 m"),
  });

/** Sliding window: 20 requests per 1 hour (invites per org). */
export const inviteLimiter =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
  });

/**
 * Run a rate limit check. Returns a 429 Response if over limit, otherwise null.
 * @param {Ratelimit | null} limiter
 * @param {string} identifier
 * @returns {Promise<Response | null>}
 */
export async function checkRateLimit(limiter, identifier) {
  if (!limiter) return null;

  const { success, reset } = await limiter.limit(identifier);

  if (!success) {
    const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return Response.json(
      { error: "Too many requests", retryAfter: reset },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  return null;
}
