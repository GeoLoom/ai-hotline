import { describe, it, expect } from 'vitest';
import { isLogisticsRelated } from '../api/domainFilter';


describe('isLogisticsRelated', () => {
  it('accepte une question contenant un mot-clé métier', () => {
    expect(isLogisticsRelated('Le scanner du bac ne répond plus')).toBe(true);
  });

  it('accepte un mot-clé sans accent alors que la liste l’a avec accent', () => {
    expect(isLogisticsRelated('Erreur de preparation sur le pool')).toBe(true);
  });

  it('accepte un mot-clé avec accent tapé par l’utilisateur', () => {
    expect(isLogisticsRelated('Erreur de préparation sur le pool')).toBe(true);
  });

  it('rejette une question hors domaine', () => {
    expect(isLogisticsRelated('Quelle est la capitale de la France ?')).toBe(false);
  });


  it('est insensible à la casse', () => {
    expect(isLogisticsRelated('ERREUR SCANNER BLOQUÉ')).toBe(true);
  });
});