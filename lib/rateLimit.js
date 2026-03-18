import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Lazy initialization to avoid build-time issues
let redis = null;
let authLimiterInstance = null;
let inviteLimiterInstance = null;

function getRedis() {
  if (redis) return redis;
  
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const isPlaceholder = redisUrl?.includes("placeholder") || !redisUrl;

  if (!isPlaceholder && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }
  return redis;
}

function getAuthLimiter() {
  if (authLimiterInstance) return authLimiterInstance;
  const r = getRedis();
  if (r) {
    authLimiterInstance = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
    });
  }
  return authLimiterInstance;
}

function getInviteLimiter() {
  if (inviteLimiterInstance) return inviteLimiterInstance;
  const r = getRedis();
  if (r) {
    inviteLimiterInstance = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
    });
  }
  return inviteLimiterInstance;
}

export const authLimiter = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    const limiter = getAuthLimiter();
    return limiter ? limiter[prop] : undefined;
  }
});

export const inviteLimiter = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    const limiter = getInviteLimiter();
    return limiter ? limiter[prop] : undefined;
  }
});

export async function checkRateLimit(limiterProxy, identifier) {
  // Use the proxy directly; the Proxy handler will call getAuthLimiter/getInviteLimiter
  // But wait, if we use the proxy, it might be tricky.
  // Actually, let's just use the instances directly for the check function.
  
  let targetLimiter = null;
  if (limiterProxy === authLimiter) targetLimiter = getAuthLimiter();
  if (limiterProxy === inviteLimiter) targetLimiter = getInviteLimiter();

  if (!targetLimiter) return null;

  try {
    const { success, reset } = await targetLimiter.limit(identifier);

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
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fallback: allow the request if rate limiting fails
    return null;
  }

  return null;
}
