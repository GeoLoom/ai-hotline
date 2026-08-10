import { describe, it, expect, vi } from 'vitest';
import app from '../api/routes';

describe('GET /status', () => {
  it('retourne 200 et un statut ok si toutes les dépendances répondent', async () => {
    global.fetch = vi.fn(async () => ({ ok: true })) as any;

    const res = await app.request('/status');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.checks.ollama).toBe('ok');
    expect(body.checks.chromadb).toBe('ok');
  });

  it('retourne 503 et un statut dégradé si une dépendance est injoignable', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('connexion refusée');
    }) as any;

    const res = await app.request('/status');
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.checks.ollama).toBe('down');
  });

  it('est accessible sans authentification', async () => {
    global.fetch = vi.fn(async () => ({ ok: true })) as any;
    const res = await app.request('/status');
    expect(res.status).not.toBe(401);
  });
});