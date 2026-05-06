export interface RawIncidentDocument {
  id: number;
  groupe?: string | null;
  site?: string | null;
  application?: string | null;
  num_incident?: number | null;
  date_creation?: string | null;
  provenance?: string | null;
  commentaire?: string | null;
  echange_client?: string[];
  echange_tech?: string[];
  mdate?: string | null;
}

export interface IncidentExportFile {
  metadata?: Record<string, unknown>;
  documents: RawIncidentDocument[];
}

export interface NormalizedIncident {
  ticketId: string;
  groupe?: string;
  site?: string;
  application?: string;
  dateCreation?: string;
  commentaire?: string;
  echangeClient: string[];
  echangeTech: string[];
  rawText: string;
  cleanedText: string;
}

export interface ChunkedIncidentDocument {
  id: string;
  ticketId: string;
  text: string;
  metadata: Record<string, string | number | boolean>;
}