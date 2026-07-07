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
    expect(incident.cleanedText).toContain('Incident: 999');
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
});