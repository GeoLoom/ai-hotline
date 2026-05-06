import type { ChunkedIncidentDocument, NormalizedIncident } from '../types/incident.js';

export function chunkIncident(incident: NormalizedIncident): ChunkedIncidentDocument[] {
  return [
    {
      id: `incident-${incident.ticketId}`,
      ticketId: incident.ticketId,
      text: incident.cleanedText,
      metadata: {
        ticket_id: incident.ticketId,
        groupe: incident.groupe ?? '',
        site: incident.site ?? '',
        application: incident.application ?? '',
        date_creation: incident.dateCreation ?? '',
        source_type: 'incident'
      }
    }
  ];
}