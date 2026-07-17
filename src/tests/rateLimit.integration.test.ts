import { describe, it, expect, vi } from 'vitest';
import app from '../api/routes';

vi.mock('../config', () => ({
  config: { apiToken: 'test-token-123' },
}));

vi.mock('../rag/retriever', () => ({
  retrieveSimilarIncidents: vi.fn(async () => []),
}));

vi.mock('../rag/promptBuilder', () => ({
  buildTicketSupportPrompt: vi.fn(() => 'PROMPT_TEST'),
}));

vi.mock('../services/ollama', () => ({
  generateAnswer: vi.fn(async () => 'Réponse IA'),
}));

describe('limitation de débit sur /answer', () => {
  it('bloque avec 429 au-delà de 20 requêtes/minute depuis la même IP', async () => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token-123',
      'x-forwarded-for': '9.9.9.9',
    };
    const body = JSON.stringify({ question: 'Erreur scanner sur le quai de préparation' });

    let lastStatus = 200;
    for (let i = 0; i < 21; i++) {
      const res = await app.request('/answer', { method: 'POST', headers, body });
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  });

  it('un client avec une autre IP n’est pas affecté par le quota du premier', async () => {
    const makeHeaders = (ip: string) => ({
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token-123',
      'x-forwarded-for': ip,
    });
    const body = JSON.stringify({ question: 'Erreur scanner sur le quai de préparation' });

    for (let i = 0; i < 20; i++) {
      await app.request('/answer', { method: 'POST', headers: makeHeaders('1.1.1.1'), body });
    }

    const res = await app.request('/answer', { method: 'POST', headers: makeHeaders('2.2.2.2'), body });

    expect(res.status).toBe(200);
  });
});