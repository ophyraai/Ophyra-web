import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Redis singleton — lazy-initialized so the app still works without Upstash
// configured (rate limiting simply becomes a no-op).
// ---------------------------------------------------------------------------
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

// ---------------------------------------------------------------------------
// Pre-configured limiters
// ---------------------------------------------------------------------------

function createLimiter(prefix: string, requests: number, window: `${number} s` | `${number} m`) {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `rl:${prefix}`,
    analytics: false,
  });
}

export const diagnosisLimiter = () => createLimiter('diagnosis', 10, '60 s');
export const uploadLimiter = () => createLimiter('upload', 6, '60 s');
export const analyzeLimiter = () => createLimiter('analyze', 5, '60 s');
export const checkoutLimiter = () => createLimiter('checkout', 5, '60 s');
export const couponLimiter = () => createLimiter('coupon', 5, '60 s');
export const generalLimiter = () => createLimiter('general', 10, '60 s');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'anonymous';
}

/**
 * Returns null if allowed, or a 429 response if rate-limited.
 * If Upstash is not configured, always allows (graceful degradation).
 */
export async function checkRateLimit(
  limiterFn: () => Ratelimit | null,
  identifier: string,
): Promise<NextResponse | null> {
  const limiter = limiterFn();
  if (!limiter) return null; // Upstash not configured — allow

  try {
    const { success, reset } = await limiter.limit(identifier);
    if (success) return null;

    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.max(retryAfter, 1)) },
      },
    );
  } catch (err) {
    // If Redis is down, fail open (allow the request)
    console.error('Rate limit check failed:', err);
    return null;
  }
}
