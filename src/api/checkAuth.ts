import type { MiddlewareHandler } from 'hono';
import { timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

// Authentification par token unique et partagé : pas de compte par interconnexion pour l'instant, un seul secret protège l'accès à l'API.
export const checkAuth: MiddlewareHandler = async (c, next) => {
  if (!config.apiToken) {
    
    console.error('[ai-hotline] API_TOKEN manquant dans la configuration');
    return c.json({ error: 'Server misconfiguration' }, 500);
  }

  const header = c.req.header('Authorization');
  const providedToken = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!providedToken) {
    return c.json({ error: 'Missing Authorization header' }, 401);
  }

  if (!safeEqual(providedToken, config.apiToken)) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  return next();
};