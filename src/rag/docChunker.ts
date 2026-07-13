import { splitIntoChunks } from './chunker.js';

export interface ChunkedDocument {
  id: string;
  text: string;
  metadata: {
    source_path: string;
    file_name: string;
    source_type: 'doc';
  };
}

export function chunkDocument(text: string, relativePath: string): ChunkedDocument[] {
  const fileName = relativePath.split(/[\\/]/).pop() ?? relativePath;
  const safeId = relativePath.replace(/[\\/]/g, '__').replace(/[^a-zA-Z0-9._-]/g, '_');

  const pieces = splitIntoChunks(text);

  return pieces.map((chunkText, index) => ({
    id: pieces.length === 1 ? `doc-${safeId}` : `doc-${safeId}-${index}`,
    text: chunkText,
    metadata: {
      source_path: relativePath,
      file_name: fileName,
      source_type: 'doc' as const,
    },
  }));
}