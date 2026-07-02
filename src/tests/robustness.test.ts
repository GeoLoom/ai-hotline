import { describe, it, expect } from 'vitest';
import { buildSupportPrompt } from '../rag/promptBuilder';
import { normalizeIncident } from '../rag/cleaner';

describe('robustesse', () => {
  it('buildSupportPrompt ne plante pas sans contexte', () => {
    const prompt = buildSupportPrompt('Question sans résultat', []);

    expect(prompt).toContain('Question sans résultat');
    expect(prompt).toContain('If the incidents are insufficient');
  });

  it('normalizeIncident ne plante pas avec un incident minimal', () => {
    const incident = normalizeIncident({
      id: 1,
    });

    expect(incident.ticketId).toBe('1');
    expect(incident.cleanedText).toContain('Incident: 1');
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