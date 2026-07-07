import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434',
  ollamaChatModel: process.env.OLLAMA_CHAT_MODEL ?? 'phi3',
  ollamaEmbedModel: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
  chromaUrl: process.env.CHROMA_URL ?? 'http://127.0.0.1:8000',
  chromaCollection: process.env.CHROMA_COLLECTION ?? 'incidents',
  dataRawDir: process.env.DATA_RAW_DIR ?? './data/raw',
  dataProcessedDir: process.env.DATA_PROCESSED_DIR ?? './data/processed',
  topK: Number(process.env.TOP_K ?? 3),

  //Token partagé unique, sans expiration : toutes les interconnexions utilisent la même valeur. 
  apiToken: process.env.API_TOKEN
};