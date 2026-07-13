import path from 'node:path';
import { getCollection } from '../rag/chroma.js';
import { chunkDocument } from '../rag/docChunker.js';
import { embedText } from '../rag/embedder.js';
import { config } from '../config.js';
import { walkFiles } from '../utils/walkFiles.js';
import { getExtractorFor, getSupportedFormats } from './extractors/index.js';
async function main() {
  const collection = await getCollection();
  const allFiles = walkFiles(config.dataRawDocsDir);

  let indexedChunks = 0;
  let skippedFiles = 0;
  let failedFiles = 0;
  console.log(`Formats supportés : ${getSupportedFormats().join(', ')}`);
  console.log(`${allFiles.length} fichier(s) trouvé(s) dans ${config.dataRawDocsDir}`);

  for (const filePath of allFiles) {
    const extractor = getExtractorFor(filePath);
    const relativePath = path.relative(config.dataRawDocsDir, filePath);

    if (!extractor) {
      skippedFiles++;
      console.warn(`Ignoré (format non supporté) : ${relativePath}`);
      continue;
    }

    try {
      const text = await extractor(filePath);

      if (!text || text.trim().length === 0) {
        console.warn(`Ignoré (vide) : ${relativePath}`);
        skippedFiles++;
        continue;
      }

      const chunks = chunkDocument(text, relativePath);

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

      console.log(`Indexed: ${relativePath} (${chunks.length} chunk(s))`);
    } catch (error) {
      failedFiles++;
      console.error(`Échec de l'indexation de ${relativePath} :`, error);
    }
  }

  console.log(`\nTerminé : ${indexedChunks} chunk(s) indexé(s), ${skippedFiles} ignoré(s), ${failedFiles} échec(s).`);
}

main().catch((error) => {
  console.error("Erreur fatale pendant l'ingestion des documents :", error);
  process.exit(1);
});