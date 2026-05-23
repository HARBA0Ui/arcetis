import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/server/config/env";

let redis: Redis | null = null;

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN
  });
}

const ratelimiters = new Map<string, Ratelimit>();

export async function rateLimit(
  identifier: string,
  limit: number,
  window: `${number} s` | `${number} m` | `${number} h` | `${number} d` = "10 m"
) {
  // If Redis is not configured, fall back to allowing the request
  // (or you can rely on Vercel WAF if no Redis keys are provided)
  if (!redis) {
    return { success: true, pending: Promise.resolve(), limit, remaining: limit, reset: 0 };
  }

  const key = `${limit}_${window}`;
  
  if (!ratelimiters.has(key)) {
    ratelimiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, window),
        analytics: true,
        prefix: "arcetis_ratelimit"
      })
    );
  }

  const limiter = ratelimiters.get(key)!;
  return limiter.limit(identifier);
}
