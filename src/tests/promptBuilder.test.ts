import { describe, it, expect } from 'vitest';
import { buildSupportPrompt } from '../rag/promptBuilder';

describe('buildSupportPrompt', () => {
  it('contient la question utilisateur', () => {
    const prompt = buildSupportPrompt('Problème de préparation', []);

    expect(prompt).toContain('Problème de préparation');
  });

  it('contient les incidents récupérés', () => {
    const prompt = buildSupportPrompt('Erreur stock', [
      {
        id: 'incident-1',
        text: 'Erreur de stock corrigée par recalcul inventaire',
        score: 0.91,
        metadata: {
          ticket_id: 'INC-001',
        },
      },
    ]);

    expect(prompt).toContain('INC-001');
    expect(prompt).toContain('Erreur de stock corrigée');
    expect(prompt).toContain('Similarity score: 0.910');
  });

  it('impose une réponse structurée', () => {
    const prompt = buildSupportPrompt('Question test', []);

    expect(prompt).toContain('1. Probable root cause');
    expect(prompt).toContain('2. Diagnostic steps');
    expect(prompt).toContain('3. Possible fix');
    expect(prompt).toContain('4. Risks / precautions');
    expect(prompt).toContain('5. References to incidents');
  });

  it('demande de ne pas inventer de correction', () => {
    const prompt = buildSupportPrompt('Question test', []);

    expect(prompt).toContain('Do not invent a fix');
  });

  it('retombe sur l’id du document si ticket_id est absent des métadonnées', () => {
    const prompt = buildSupportPrompt('Question test', [
      {
        id: 'doc-sans-ticket-id',
        text: 'Contenu de secours',
        score: 0.5,
        metadata: {},
      },
    ]);

    expect(prompt).toContain('Ticket ID: doc-sans-ticket-id');
  });


  it('numérote correctement plusieurs incidents récupérés', () => {
    const prompt = buildSupportPrompt('Question test', [
      { id: 'a', text: 'Premier incident', score: 0.9, metadata: { ticket_id: 'INC-1' } },
      { id: 'b', text: 'Deuxième incident', score: 0.8, metadata: { ticket_id: 'INC-2' } },
    ]);

    expect(prompt).toContain('### Incident 1');
    expect(prompt).toContain('INC-1');
    expect(prompt).toContain('### Incident 2');
    expect(prompt).toContain('INC-2');
  });
});