import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { normalizeIncident } from '../rag/cleaner';
import app from '../api/routes';
import { retrieveSimilarIncidents } from '../rag/retriever';
import { generateAnswer } from '../services/ollama';

vi.mock('../rag/retriever', () => ({
  retrieveSimilarIncidents: vi.fn(async () => []),
}));

vi.mock('../services/ollama', () => ({
  generateAnswer: vi.fn(async () => 'Réponse IA'),
}));

vi.mock('../config', () => ({
  config: { apiToken: 'test-token-123' },
}));


describe('robustesse — API /answer', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('accepte une question très longue sans planter', async () => {
    const longQuestion = 'Erreur de préparation répétée sur le pool '.repeat(40);

    const res = await app.request('/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123' },
      body: JSON.stringify({ question: longQuestion }),
    });

    expect(res.status).toBe(200);
  });


  it('rejette une question dépassant la limite de 2000 caractères', async () => {
    const tooLongQuestion = 'Erreur de préparation répétée sur le quai '.repeat(60);

    const res = await app.request('/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123' },
      body: JSON.stringify({ question: tooLongQuestion }),
    });

    expect(res.status).toBe(400);
  });

  it('gère correctement les caractères unicode et emojis', async () => {
    const res = await app.request('/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123' },
      body: JSON.stringify({ question: 'Erreur étrange 🚨  à Lyon, é/à/ü' }),
    });

    expect(res.status).toBe(200);
  });

  it('retourne 500 si le service de récupération d’incidents échoue (ChromaDB down)', async () => {
    (retrieveSimilarIncidents as any).mockRejectedValueOnce(new Error('ChromaDB indisponible'));

    const res = await app.request('/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123' },
      body: JSON.stringify({ question: 'Erreur bloquante sur le scanner du pool de préparation' }),
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });

  it('retourne 500 si Ollama échoue à générer une réponse', async () => {
    (generateAnswer as any).mockRejectedValueOnce(new Error('Ollama indisponible'));

    const res = await app.request('/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123' },
      body: JSON.stringify({ question: 'Erreur bloquante sur le scanner du pool de préparation' }),
    });
    expect(res.status).toBe(500);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('rejette une question composée uniquement d’espaces (grâce au .trim())', async () => {
    const res = await app.request('/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123' },
      body: JSON.stringify({ question: '   ' }),
    });

    expect(res.status).toBe(400);
  });
});

describe('robustesse — fonctions pures', () => {

  it('normalizeIncident ne plante pas avec un incident minimal', () => {
    const incident = normalizeIncident({
      id: 1,
    });

    expect(incident.ticketId).toBe('1');
    expect(incident.cleanedText).toContain('Commentaire:');
  });

  it('normalizeIncident ignore les échanges vides', () => {
    const incident = normalizeIncident({
      id: 2,
      echange_client: ['', '   '],
      echange_tech: ['', '   '],
    });

    expect(incident.echangeClient).toEqual([]);
    expect(incident.echangeTech).toEqual([]);
  });
});