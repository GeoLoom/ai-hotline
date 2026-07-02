import { describe, it, expect } from 'vitest';
import { stripHtml } from '../utils/htmlCleaner';

describe('ingestion documentation', () => {
  it('nettoie un contenu documentaire avant indexation', () => {
    const content = '<p>Procédure de diagnostic WMS</p>';

    const cleaned = stripHtml(content);

    expect(cleaned).toBe('Procédure de diagnostic WMS');
  });

  it('conserve le texte métier utile', () => {
    const content = 'Étape 1 : vérifier le stock\nÉtape 2 : relancer la préparation';

    const cleaned = stripHtml(content);

    expect(cleaned).toContain('vérifier le stock');
    expect(cleaned).toContain('relancer la préparation');
  });
});