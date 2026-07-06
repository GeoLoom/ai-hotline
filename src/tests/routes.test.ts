import { describe, it, expect, vi } from 'vitest';
import app from '../api/routes';
import { retrieveSimilarIncidents } from '../rag/retriever.js';
import { buildSupportPrompt } from '../rag/promptBuilder.js';
import { generateAnswer } from '../services/ollama.js';


vi.mock('../rag/retriever.js', () => ({
  retrieveSimilarIncidents: vi.fn(async () => [
    {
      id: 'ticket-001',
      score: 0.92,
      metadata: {
        ticket_id: 'INC-001',
        application: 'WMS',
        site: 'Lyon',
      },
    },
  ]),
}));

vi.mock('../rag/promptBuilder.js', () => ({
  buildSupportPrompt: vi.fn(() => 'PROMPT_TEST'),
}));

vi.mock('../services/ollama.js', () => ({
  generateAnswer: vi.fn(async () => 'Réponse IA structurée'),
}));


describe('API routes', () => {
  describe('POST /answer', () => {
    it('retourne 400 si la question est absente', async () => {
      const res = await app.request('/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body).toHaveProperty('error');
    });

    it('retourne 400 si la question est trop courte', async () => {
      const res = await app.request('/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'ok' }),
      });

      expect(res.status).toBe(400);
    });

    it('retourne une réponse IA et les sources pour une question valide', async () => {
      const res = await app.request('/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Comment résoudre un problème de préparation ?',
          application: 'WMS',
        }),
      });

      expect(res.status).toBe(200);

      const body = await res.json();

      expect(body.answer).toBe('Réponse IA structurée');
      expect(body.sources).toHaveLength(1);
      expect(body.sources[0]).toEqual({
        ticket_id: 'INC-001',
        score: 0.92,
        application: 'WMS',
        site: 'Lyon',
      });

      expect(retrieveSimilarIncidents).toHaveBeenCalledWith(
        'Comment résoudre un problème de préparation ?',
        'WMS'
      );
      expect(buildSupportPrompt).toHaveBeenCalled();
      expect(generateAnswer).toHaveBeenCalledWith('PROMPT_TEST');
    });

    it('fonctionne sans le champ optionnel "application"', async () => {
      const res = await app.request('/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Comment résoudre un problème de préparation ?',
        }),
      });

      expect(res.status).toBe(200);
      expect(retrieveSimilarIncidents).toHaveBeenCalledWith(
        'Comment résoudre un problème de préparation ?',
        undefined
      );
    });
  });

  describe('POST /feedback', () => {
    it('retourne 400 si le rating est invalide', async () => {
      const res = await app.request('/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Question test',
          answer: 'Réponse test',
          rating: 6,
        }),
      });

      expect(res.status).toBe(400);
    });

    it('accepte un feedback valide', async () => {
      const res = await app.request('/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Question test',
          answer: 'Réponse test',
          rating: 5,
          comment: 'Très utile',
        }),
      });

      expect(res.status).toBe(200);

      const body = await res.json();

      expect(body.status).toBe('ok');
      expect(body.message).toBe('Feedback received');
      expect(body.feedback.rating).toBe(5);
    });
  });

  describe('POST /ingest', () => {
    it('retourne un message indiquant d’utiliser npm run ingest', async () => {
      const res = await app.request('/ingest', {
        method: 'POST',
      });

      expect(res.status).toBe(200);

      const body = await res.json();

      expect(body.status).toBe('todo');
      expect(body.message).toContain('npm run ingest');
    });
  });
});