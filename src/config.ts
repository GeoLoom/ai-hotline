import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434',
  ollamaChatModel: process.env.OLLAMA_CHAT_MODEL ?? 'phi3',
  ollamaEmbedModel: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
  chromaUrl: process.env.CHROMA_URL ?? 'http://127.0.0.1:8000',
  chromaCollection: process.env.CHROMA_COLLECTION ?? 'incidents',
  dataProcessedDir: process.env.DATA_PROCESSED_DIR ?? './data/processed',
  topK: Number(process.env.TOP_K ?? 3),
  dataRawIncidentsDir: process.env.DATA_RAW_INCIDENTS_DIR ?? path.join(process.env.DATA_RAW_DIR ?? './data/raw', 'Incidents'),
  dataRawDocsDir: process.env.DATA_RAW_DOCS_DIR ?? path.join(process.env.DATA_RAW_DIR ?? './data/raw', 'Documents'),
  dataRawDir: process.env.DATA_RAW_DIR ?? './data/raw',
  
  //Token partagé unique, sans expiration : toutes les interconnexions utilisent la même valeur. 
  apiToken: process.env.API_TOKEN
};