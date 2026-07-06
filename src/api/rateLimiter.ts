import type { MiddlewareHandler } from 'hono';

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

// TODO : Faire des test quand on sera connecter à SAVOYE D, MIR et autre, ç
export function rateLimiter({ windowMs, max }: RateLimitOptions): MiddlewareHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return async (c, next) => {
    const key = c.req.header('x-forwarded-for') ?? 'unknown';
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      return c.json({ error: 'Too many requests, please try again later' }, 429);
    }

    entry.count++;
    return next();
  };
}