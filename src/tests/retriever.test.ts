import { describe, it, expect, vi } from 'vitest';

vi.mock('../rag/chroma', () => ({
  getCollection: vi.fn(async () => ({
    query: vi.fn(async () => ({
      documents: [['Document similaire 1', 'Document similaire 2']],
    })),
  })),
}));

vi.mock('../services/ollama', () => ({
  generateEmbedding: vi.fn(async () => [0.1, 0.2, 0.3]),
}));

import { search } from '../rag/retriever';
import { getCollection } from '../rag/chroma';
import { generateEmbedding } from '../services/ollama';

describe('retriever', () => {
  it('génère un embedding puis interroge ChromaDB', async () => {
    const result = await search('Problème de préparation');

    expect(generateEmbedding).toHaveBeenCalledWith('Problème de préparation');
    expect(getCollection).toHaveBeenCalled();
    expect(result).toEqual(['Document similaire 1', 'Document similaire 2']);
  });
});