import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('dotenv', () => ({
  default: { config: vi.fn() },
  config: vi.fn(),
}));

const originalEnv = process.env;

const ALL_ENV_KEYS = [
  'PORT',
  'OLLAMA_BASE_URL',
  'OLLAMA_CHAT_MODEL',
  'OLLAMA_EMBED_MODEL',
  'CHROMA_URL',
  'CHROMA_COLLECTION',
  'DATA_RAW_DIR',
  'DATA_PROCESSED_DIR',
  'TOP_K',
];

describe('config', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    for (const key of ALL_ENV_KEYS) delete process.env[key];
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('charge les valeurs par défaut', async () => {
    const { config } = await import('../config');

    expect(config.port).toBe(3000);
    expect(config.ollamaBaseUrl).toBe('http://127.0.0.1:11434');
    expect(config.ollamaChatModel).toBe('phi3');
    expect(config.ollamaEmbedModel).toBe('nomic-embed-text');
    expect(config.chromaUrl).toBe('http://127.0.0.1:8000');
    expect(config.chromaCollection).toBe('incidents');
    expect(config.dataRawDir).toBe('./data/raw');
    expect(config.dataProcessedDir).toBe('./data/processed');
    expect(config.topK).toBe(3);
  });

  it('convertit PORT et TOP_K en nombres', async () => {
    process.env.PORT = '8080';
    process.env.TOP_K = '5';

    const { config } = await import('../config');

    expect(config.port).toBe(8080);
    expect(typeof config.port).toBe('number');
    expect(config.topK).toBe(5);
    expect(typeof config.topK).toBe('number');
  });

  it('utilise les variables OLLAMA_* et CHROMA_* quand elles sont définies', async () => {
    process.env.OLLAMA_BASE_URL = 'http://ollama-prod:11434';
    process.env.OLLAMA_CHAT_MODEL = 'mistral';
    process.env.OLLAMA_EMBED_MODEL = 'bge-m3';
    process.env.CHROMA_URL = 'http://chroma-prod:8000';
    process.env.CHROMA_COLLECTION = 'incidents_prod';

    const { config } = await import('../config');

    expect(config.ollamaBaseUrl).toBe('http://ollama-prod:11434');
    expect(config.ollamaChatModel).toBe('mistral');
    expect(config.ollamaEmbedModel).toBe('bge-m3');
    expect(config.chromaUrl).toBe('http://chroma-prod:8000');
    expect(config.chromaCollection).toBe('incidents_prod');
  });

  it('utilise les répertoires DATA_RAW_DIR et DATA_PROCESSED_DIR personnalisés', async () => {
    process.env.DATA_RAW_DIR = '/data/raw-custom';
    process.env.DATA_PROCESSED_DIR = '/data/processed-custom';

    const { config } = await import('../config');

    expect(config.dataRawDir).toBe('/data/raw-custom');
    expect(config.dataProcessedDir).toBe('/data/processed-custom');
  });
});