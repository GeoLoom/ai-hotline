import { describe, it, expect, vi } from 'vitest';
import { stripHtml } from '../utils/htmlCleaner';
import app from '../api/routes';


vi.mock('../rag/retriever', () => ({
  retrieveSimilarIncidents: vi.fn(async () => []),
}));

vi.mock('../rag/promptBuilder', () => ({
  buildSupportPrompt: vi.fn(() => 'PROMPT_TEST'),
}));

vi.mock('../services/ollama', () => ({
  generateAnswer: vi.fn(async () => 'Réponse IA'),
}));

vi.mock('../db', () => ({
  insertFeedback: vi.fn(),
}));

vi.mock('../config', () => ({
  config: { apiToken: 'test-token-123' },
}));

describe('sécurité — API /answer et /feedback', () => {
  it('renvoie une 400 propre sur un corps JSON malformé (au lieu d’une 500 générique)', async () => {
    const res = await app.request('/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123' },
      body: '{ ceci n\'est pas du json valide',
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid JSON body');
  });


  it('n’exécute jamais un contenu de type script injecté dans la question', async () => {
    const res = await app.request('/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123' },
      body: JSON.stringify({
        question: '<script>alert(document.cookie)</script> comment résoudre ce bug ?',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.answer).toBe('Réponse IA');
  });

  it('ignore les champs additionnels/non prévus sans planter (ex: tentative de pollution)', async () => {
    const res = await app.request('/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123' },
      body: JSON.stringify({
        question: 'Question valide concernant une erreur de stock en préparation',
        admin: true,
        __proto__: { polluted: true },
      }),
    });

    expect(res.status).toBe(200);
  });

  it('rejette un rating hors bornes sur /feedback (négatif)', async () => {
    const res = await app.request('/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123' },
      body: JSON.stringify({ question: 'q', answer: 'a', rating: -1 }),
    });

    expect(res.status).toBe(400);
  });

  it('rejette un rating non numérique sur /feedback', async () => {
    const res = await app.request('/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123' },
      body: JSON.stringify({ question: 'q', answer: 'a', rating: 'cinq' }),
    });

    expect(res.status).toBe(400);
  });

  it('retourne 404 sur une route inexistante', async () => {
    const res = await app.request('/route-inexistante', { method: 'GET', headers: { Authorization: 'Bearer test-token-123' }});
    
    expect(res.status).toBe(404);
  });

  it('retourne 404 sur /answer appelée avec une méthode non supportée (GET)', async () => {
    const res = await app.request('/answer', { method: 'GET',headers: { Authorization: 'Bearer test-token-123' } });
    expect(res.status).toBe(404);
  });
});

describe('sécurité et nettoyage', () => {
  it('supprime les balises HTML', () => {
    const result = stripHtml('<p>Erreur préparation</p>');

    expect(result).toBe('Erreur préparation');
  });

  it('supprime les tableaux HTML', () => {
    const result = stripHtml('<table><tr><td>secret</td></tr></table>');

    expect(result).toContain('[TABLE_REMOVED]');
    expect(result).not.toContain('<table>');
  });

  it('nettoie les espaces multiples', () => {
    const result = stripHtml('Erreur     préparation');

    expect(result).toBe('Erreur préparation');
  });
});