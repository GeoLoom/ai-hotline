import { stripHtml } from '../utils/htmlCleaner.js';
import type { NormalizedIncident, RawIncidentDocument } from '../types/incident.js';

function cleanArray(values?: string[]): string[] {
  return (values ?? [])
    .map((v) => stripHtml(v))
    .map((v) => v.trim())
    .filter(Boolean);
}

export function normalizeIncident(doc: RawIncidentDocument): NormalizedIncident {
  const commentaire = stripHtml(doc.commentaire ?? '');

  const echangeClient = cleanArray(doc.echange_client);
  const echangeTech = cleanArray(doc.echange_tech);

  const rawText = [
    `Incident: ${doc.id}`,
    `Groupe: ${doc.groupe ?? ''}`,
    `Site: ${doc.site ?? ''}`,
    `Application: ${doc.application ?? ''}`,
    `Date: ${doc.date_creation ?? ''}`,
    '',
    'Commentaire:',
    commentaire,
    '',
    'Echange client:',
    echangeClient.join('\n'),
    '',
    'Echange technique:',
    echangeTech.join('\n')
  ].join('\n');

  const cleanedText = rawText
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    ticketId: String(doc.id),
    groupe: doc.groupe ?? undefined,
    site: doc.site ?? undefined,
    application: doc.application ?? undefined,
    dateCreation: doc.date_creation ?? undefined,
    commentaire,
    echangeClient,
    echangeTech,
    rawText,
    cleanedText
  };
}