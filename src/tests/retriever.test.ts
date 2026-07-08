import { describe, it, expect, vi, beforeEach } from 'vitest';

const { queryMock, getCollectionMock } = vi.hoisted(() => {
  const queryMock = vi.fn(async () => ({
    ids: [['incident-001', 'incident-002']],
    documents: [['Document similaire 1', 'Document similaire 2']],
    metadatas: [[{ ticket_id: 'INC-001', application: 'WMS' }, { ticket_id: 'INC-002', application: 'WMS' }]],
    // distance cosinus : 0.08 -> score de similarité 0.92
    distances: [[0.08, 0.2]],
  }));
  const getCollectionMock = vi.fn(async () => ({ query: queryMock }));
  return { queryMock, getCollectionMock };
});

vi.mock('../rag/chroma', () => ({
  getCollection: getCollectionMock,
}));

vi.mock('../services/ollama', () => ({
  generateEmbedding: vi.fn(async () => [0.1, 0.2, 0.3]),
}));

vi.mock('../config', () => ({
  config: {
    topK: 3 
  },
}));

import { retrieveSimilarIncidents } from '../rag/retriever';
import { getCollection } from '../rag/chroma';
import { generateEmbedding } from '../services/ollama';

describe('retriever.retrieveSimilarIncidents', () => {
  beforeEach(() => {
    queryMock.mockClear();
    getCollectionMock.mockClear();
    (generateEmbedding as any).mockClear();
    queryMock.mockImplementation(async () => ({
      ids: [['incident-001', 'incident-002']],
      documents: [['Document similaire 1', 'Document similaire 2']],
      metadatas: [[{ ticket_id: 'INC-001', application: 'WMS' }, { ticket_id: 'INC-002', application: 'WMS' }]],
      distances: [[0.08, 0.2]],
    }));
  });

  it('génère un embedding puis interroge ChromaDB', async () => {
    const result = await retrieveSimilarIncidents('Problème de préparation');

    expect(generateEmbedding).toHaveBeenCalledWith('Problème de préparation');
    expect(getCollection).toHaveBeenCalled();
    expect(result).toHaveLength(2);
  });

  it('interroge la collection avec l’embedding généré et nResults = config.topK', async () => {
    await retrieveSimilarIncidents('question');

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryEmbeddings: [[0.1, 0.2, 0.3]],
        nResults: 3,
      })
    );
  });

  it('transmet un filtre "where" sur application quand il est fourni', async () => {
    await retrieveSimilarIncidents('question', 'WMS');

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { application: 'WMS' } })
    );
  });

  it('transmet un filtre combiné application + source_type', async () => {
  await retrieveSimilarIncidents('question', 'WMS', 'incident');

  expect(queryMock).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { $and: [{ application: 'WMS' }, { source_type: 'incident' }] },
    })
  );
});

  it('ne transmet aucun filtre "where" quand application est omis', async () => {
    await retrieveSimilarIncidents('question');

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined })
    );
  });

  it('recompose id, text, metadata et score pour chaque document trouvé', async () => {
    const [first] = await retrieveSimilarIncidents('question');

    expect(first.id).toBe('incident-001');
    expect(first.text).toBe('Document similaire 1');
    expect(first.metadata).toEqual({ ticket_id: 'INC-001', application: 'WMS' });
  });

  it('convertit la distance Chroma en score de similarité (1 - distance)', async () => {
    const [first, second] = await retrieveSimilarIncidents('question');

    expect(first.score).toBeCloseTo(0.92, 5);
    expect(second.score).toBeCloseTo(0.8, 5);
  });

  it('retourne un tableau vide si ChromaDB ne trouve aucun document', async () => {
    queryMock.mockResolvedValueOnce({
      ids: [[]],
      documents: [[]],
      metadatas: [[]],
      distances: [[]],
    });

    const result = await retrieveSimilarIncidents('question sans résultat');

    expect(result).toEqual([]);
  });

  it('propage l’erreur si la génération de l’embedding échoue', async () => {
    (generateEmbedding as any).mockRejectedValueOnce(new Error('Ollama indisponible'));

    await expect(retrieveSimilarIncidents('question')).rejects.toThrow('Ollama indisponible');
  });

  it('propage l’erreur si l’interrogation de ChromaDB échoue', async () => {
    queryMock.mockRejectedValueOnce(new Error('ChromaDB indisponible'));

    await expect(retrieveSimilarIncidents('question')).rejects.toThrow('ChromaDB indisponible');
  });
});
