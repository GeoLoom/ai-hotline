import { describe, it, expect } from 'vitest';
import app from '../api/routes';

describe('GET /openapi.json', () => {
  it('est accessible sans authentification', async () => {
    const res = await app.request('/openapi.json');
    expect(res.status).toBe(200);
  });

  it('renvoie un document OpenAPI valide contenant les routes principales', async () => {
    const res = await app.request('/openapi.json');
    const body = await res.json();

    expect(body.openapi).toBe('3.0.0');
    expect(body.paths['/v1/answer']).toBeDefined();
    expect(body.paths['/v1/feedback']).toBeDefined();
  });
});