import type { ChunkedIncidentDocument, NormalizedIncident } from '../types/incident.js';


const MAX_CHUNK_CHARS = 1500;
const CHUNK_OVERLAP_CHARS = 200;

export function chunkIncident(incident: NormalizedIncident): ChunkedIncidentDocument[] {
  const baseMetadata = {
    ticket_id: incident.ticketId,
    groupe: incident.groupe ?? '',
    site: incident.site ?? '',
    application: incident.application ?? '',
    date_creation: incident.dateCreation ?? '',
    source_type: 'incident' as const,
  };
  
  const text = incident.cleanedText;

  if (text.length <= MAX_CHUNK_CHARS) {
    return [{ id: `incident-${incident.ticketId}`, ticketId: incident.ticketId, text, metadata: baseMetadata }];
  }

  const chunks: ChunkedIncidentDocument[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + MAX_CHUNK_CHARS, text.length);
    chunks.push({
      id: `incident-${incident.ticketId}-${index}`,
      ticketId: incident.ticketId,
      text: text.slice(start, end),
      metadata: baseMetadata,
    });
    index++;
    if (end === text.length) break;
    start = end - CHUNK_OVERLAP_CHARS;
  }

  return chunks;
}
