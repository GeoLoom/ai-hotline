import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const originalEnv = process.env;

describe('config', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('charge les valeurs par défaut', async () => {
    delete process.env.PORT;
    delete process.env.TOP_K;

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
    expect(config.topK).toBe(5);
  });
});