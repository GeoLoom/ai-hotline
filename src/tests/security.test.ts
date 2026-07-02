import { describe, it, expect } from 'vitest';
import { stripHtml } from '../utils/htmlCleaner';

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