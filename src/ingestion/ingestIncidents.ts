import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from '../rag/chroma.js';
import { normalizeIncident } from '../rag/cleaner.js';
import { chunkIncident } from '../rag/chunker.js';
import { embedText } from '../rag/embedder.js';
import { config } from '../config.js';
import type { RawIncidentDocument } from '../types/incident.js';

async function main() {

  const collection = await getCollection()

  const files = fs.readdirSync(config.dataRawDir);

  let indexedChunks = 0;
  let failedIncidents = 0;

  for (const file of files) {
    const filePath = path.join(config.dataRawDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);

    for (const rawDoc of json.documents as RawIncidentDocument[]) {
      try {
        const incident = normalizeIncident(rawDoc);
        const chunks = chunkIncident(incident);

        for (const chunk of chunks) {
          const embedding = await embedText(chunk.text);

          await collection.add({
            ids: [chunk.id],
            documents: [chunk.text],
            embeddings: [embedding],
            metadatas: [chunk.metadata],
          });

          indexedChunks++;
        }

        console.log(`Indexed incident ${incident.ticketId} (${chunks.length} chunk(s))`);
      } catch (error) {
        failedIncidents++;
        console.error(`Échec de l'indexation de l'incident ${rawDoc?.id ?? '?'} :`, error);
      }
    }
  }

  console.log(`\nTerminé : ${indexedChunks} chunk(s) indexé(s), ${failedIncidents} incident(s) en échec.`);
}

main().catch((error) => {
  console.error("Erreur fatale pendant l'ingestion :", error);
  process.exit(1);
});
