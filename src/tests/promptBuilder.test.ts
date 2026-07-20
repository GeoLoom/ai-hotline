import { describe, it, expect } from 'vitest';
import { buildTicketSupportPrompt, buildDocsSupportPrompt } from '../rag/promptBuilder';

describe('buildSupportPrompt', () => {
  it('contient la question utilisateur', () => {
    const prompt = buildTicketSupportPrompt('Problème de préparation', []);

    expect(prompt).toContain('Problème de préparation');
  });

  it('contient les incidents récupérés', () => {
    const prompt = buildTicketSupportPrompt('Erreur stock', [
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
    const prompt = buildTicketSupportPrompt('Question test', []);
    expect(prompt).toContain('Commence par vérifier si l\'un des incidents ci-dessus décrit exactement le même problème');
    expect(prompt).toContain('Si plusieurs incidents montrent qu\'il s\'agit d\'un problème récurrent');
    expect(prompt).toContain('Si aucun incident ne contient de solution exploitable');
   
  });

  it('demande de ne pas inventer de correction', () => {
    const prompt = buildTicketSupportPrompt('Question test', []);

    expect(prompt).toContain('Ne jamais inventer une commande, une procédure ou une correction');
  });

  it('retombe sur l’id du document si ticket_id est absent des métadonnées', () => {
    const prompt = buildTicketSupportPrompt('Question test', [
      {
        id: 'doc-sans-ticket-id',
        text: 'Contenu de secours',
        score: 0.5,
        metadata: {},
      },
    ]);

    expect(prompt).toContain('Reference: doc-sans-ticket-id');
  });


  it('numérote correctement plusieurs incidents récupérés', () => {
    const prompt = buildTicketSupportPrompt('Question test', [
      { id: 'a', text: 'Premier incident', score: 0.9, metadata: { ticket_id: 'INC-1' } },
      { id: 'b', text: 'Deuxième incident', score: 0.8, metadata: { ticket_id: 'INC-2' } },
    ]);

    expect(prompt).toContain('### Source 1');
    expect(prompt).toContain('INC-1');
    expect(prompt).toContain('### Source 2');
    expect(prompt).toContain('INC-2');
  });
});

describe('buildDocsSupportPrompt', () => {
  it('inclut la question et les extraits de documentation', () => {
    const prompt = buildDocsSupportPrompt('Comment faire X ?', [
      { id: 'doc-1', score: 0.9, text: 'Procédure de X', metadata: {} } as any,
    ]);
    expect(prompt).toContain('Comment faire X ?');
    expect(prompt).toContain('Procédure de X');
  });

  it('demande de ne pas résumer les étapes précises', () => {
    const prompt = buildDocsSupportPrompt('question', []);
    expect(prompt).toContain('reproduis-les exactement tels qu\'écrits');
  });
});