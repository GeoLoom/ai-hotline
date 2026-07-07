import { describe, it, expect, vi } from 'vitest';
import app from '../api/routes';

vi.mock('../config', () => ({
  config: { apiToken: 'test-token-123' },
}));

vi.mock('../rag/retriever', () => ({
  retrieveSimilarIncidents: vi.fn(async () => []),
}));

vi.mock('../services/ollama', () => ({
  generateAnswer: vi.fn(async () => 'Réponse IA'),
}));

vi.mock('../db', () => ({
  insertFeedback: vi.fn(),
}));

describe('authentification', () => {
  it('rejette une requête sans en-tête Authorization', async () => {
    const res = await app.request('/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Erreur scanner sur le quai de préparation' }),
    });

    expect(res.status).toBe(401);
  });

  it('rejette un token invalide', async () => {
    const res = await app.request('/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mauvais-token',
      },
      body: JSON.stringify({ question: 'Erreur scanner sur le quai de préparation' }),
    });

    expect(res.status).toBe(401);
  });

  it('accepte une requête avec le bon token', async () => {
    const res = await app.request('/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123',
      },
      body: JSON.stringify({ question: 'Erreur scanner sur le quai de préparation' }),
    });

    expect(res.status).toBe(200);
  });

  it('laisse /health accessible sans authentification', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
  });
});