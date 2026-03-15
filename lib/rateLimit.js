import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const _authLimiter =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "15 m"),
  });

const _inviteLimiter =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
  });

export const authLimiter = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    return _authLimiter ? _authLimiter[prop] : undefined;
  }
});

export const inviteLimiter = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    return _inviteLimiter ? _inviteLimiter[prop] : undefined;
  }
});

export async function checkRateLimit(limiter, identifier) {
  if (!limiter || (limiter.limit === undefined)) return null;

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
