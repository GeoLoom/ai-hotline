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
});