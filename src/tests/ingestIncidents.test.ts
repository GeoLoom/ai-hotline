import { describe, it, expect } from 'vitest';
import { normalizeIncident } from '../rag/cleaner';
import { chunkIncident } from '../rag/chunker';


describe('ingestion incidents', () => {
  it('normalise un incident JSON valide', () => {
    const incident = normalizeIncident({
      id: 123,
      groupe: 'Support',
      site: 'Lyon',
      application: 'WMS',
      date_creation: '2026-06-01',
      commentaire: '<p>Erreur préparation</p>',
      echange_client: ['<p>Le client signale une erreur</p>'],
      echange_tech: ['<p>Correction effectuée</p>'],
    });

    expect(incident.ticketId).toBe('123');
    expect(incident.application).toBe('WMS');
    expect(incident.cleanedText).toContain('Erreur préparation');
    expect(incident.cleanedText).not.toContain('<p>');
  });

  it('découpe un incident normalisé en chunk', () => {
    const incident = normalizeIncident({
      id: 123,
      application: 'WMS',
      commentaire: 'Erreur préparation',
      echange_client: ['Message client'],
      echange_tech: ['Message technique'],
    });

    const chunks = chunkIncident(incident);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].id).toBe('incident-123');
    expect(chunks[0].metadata.ticket_id).toBe('123');
    expect(chunks[0].metadata.application).toBe('WMS');
    expect(chunks[0].text).toContain('Erreur préparation');
  });

  it('gère les champs optionnels absents', () => {
    const incident = normalizeIncident({
      id: 999,
    });

    expect(incident.ticketId).toBe('999');
    expect(incident.echangeClient).toEqual([]);
    expect(incident.echangeTech).toEqual([]);
    expect(incident.cleanedText).toContain('Commentaire:');
  });

  it('remplace les métadonnées manquantes par une chaîne vide dans le chunk', () => {
    const incident = normalizeIncident({ id: 999 });

    const [chunk] = chunkIncident(incident);

    expect(chunk.metadata.groupe).toBe('');
    expect(chunk.metadata.site).toBe('');
    expect(chunk.metadata.application).toBe('');
    expect(chunk.metadata.date_creation).toBe('');
    expect(chunk.metadata.source_type).toBe('incident');
  });
  it('découpe un texte long en plusieurs chunks avec chevauchement', () => {
  const longText = 'Erreur de préparation répétée sur le quai '.repeat(60); // > 1500 caractères
  const incident = normalizeIncident({
    id: 555,
    application: 'WMS',
    commentaire: longText,
  });

  const chunks = chunkIncident(incident);

  expect(chunks.length).toBeGreaterThan(1);
  expect(chunks[0].id).toBe('incident-555-0');
  expect(chunks[1].id).toBe('incident-555-1');
  const endOfFirst = chunks[0].text.slice(-100);
  expect(chunks[1].text).toContain(endOfFirst.slice(0, 50));
});

it('chaque chunk d’un même incident porte le même ticketId', () => {
  const longText = 'Contenu répété '.repeat(200);
  const incident = normalizeIncident({ id: 777, commentaire: longText });

  const chunks = chunkIncident(incident);

  expect(chunks.length).toBeGreaterThan(1);
  chunks.forEach((chunk) => expect(chunk.ticketId).toBe('777'));
});
});