import { describe, it, expect, vi } from 'vitest';
import { rateLimiter } from '../api/rateLimiter';

function fakeContext(ip: string) {
  return {
    req: { header: (name: string) => (name === 'x-forwarded-for' ? ip : undefined) },
    json: vi.fn((body: unknown, status: number) => ({ body, status })),
  } as any;
}

describe('rateLimiter', () => {
  it('laisse passer les requêtes sous la limite', async () => {
    const middleware = rateLimiter({ windowMs: 60_000, max: 3 });
    const next = vi.fn();
    const c = fakeContext('1.2.3.4');

    await middleware(c, next);
    await middleware(c, next);
    await middleware(c, next);

    expect(next).toHaveBeenCalledTimes(3);
    expect(c.json).not.toHaveBeenCalled();
  });

  it('bloque avec 429 au-delà de la limite', async () => {
    const middleware = rateLimiter({ windowMs: 60_000, max: 2 });
    const next = vi.fn();
    const c = fakeContext('5.6.7.8');

    await middleware(c, next);
    await middleware(c, next);
    await middleware(c, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(c.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
      429
    );
  });

  it('applique un quota indépendant par IP', async () => {
    const middleware = rateLimiter({ windowMs: 60_000, max: 1 });
    const next = vi.fn();

    await middleware(fakeContext('1.1.1.1'), next);
    await middleware(fakeContext('2.2.2.2'), next);

    expect(next).toHaveBeenCalledTimes(2);
  });
});