import type { ChunkedIncidentDocument, NormalizedIncident } from '../types/incident.js';


const MAX_CHUNK_CHARS = 1500;
const CHUNK_OVERLAP_CHARS = 200;


export function splitIntoChunks(
  text: string,
  maxChars = MAX_CHUNK_CHARS,
  overlapChars = CHUNK_OVERLAP_CHARS
): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start = end - overlapChars;
  }

  return chunks;
}

export function chunkIncident(incident: NormalizedIncident): ChunkedIncidentDocument[] {
  const baseMetadata = {
    ticket_id: incident.ticketId,
    groupe: incident.groupe ?? '',
    site: incident.site ?? '',
    application: incident.application ?? '',
    date_creation: incident.dateCreation ?? '',
    source_type: 'incident' as const,
  };

  const pieces = splitIntoChunks(incident.cleanedText);

  if (pieces.length === 1) {
    return [
      {
        id: `incident-${incident.ticketId}`,
        ticketId: incident.ticketId,
        text: pieces[0],
        metadata: baseMetadata,
      },
    ];
  }

  return pieces.map((text, index) => ({
    id: `incident-${incident.ticketId}-${index}`,
    ticketId: incident.ticketId,
    text,
    metadata: baseMetadata,
  }));
}