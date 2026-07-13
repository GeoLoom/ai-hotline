import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateAnswer, generateEmbedding } from '../services/ollama';


vi.mock('../config', () => ({
  config: {
    ollamaBaseUrl: 'http://fake-ollama:11434',
    ollamaChatModel: 'phi3',
    ollamaEmbedModel: 'nomic-embed-text'
  },
}));

describe('ollama service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('generateEmbedding retourne un tableau de nombres', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          embedding: [0.1, 0.2, 0.3],
        }),
      }))
    );

    const result = await generateEmbedding('texte test');

    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it('generateEmbedding appelle le modèle nomic-embed-text', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      json: async () => ({
        embedding: [0.1],
      }),
    }));

    vi.stubGlobal('fetch', fetchMock);

    await generateEmbedding('texte test');

    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);

    expect(body.model).toBe('nomic-embed-text');
    expect(body.prompt).toBe('texte test');
    expect(fetchMock.mock.calls[0][0]).toBe('http://fake-ollama:11434/api/embeddings');
  });

  it('generateAnswer retourne une réponse texte', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          response: 'Réponse générée',
        }),
      }))
    );

    const result = await generateAnswer('prompt test');

    expect(result).toBe('Réponse générée');
  });

  it('generateAnswer appelle le modèle phi3', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      json: async () => ({
        response: 'OK',
      }),
    }));

    vi.stubGlobal('fetch', fetchMock);

    await generateAnswer('prompt test');

    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);

    expect(body.model).toBe('phi3');
    expect(body.prompt).toBe('prompt test');
    expect(body.stream).toBe(false);
  });

  it('lève une erreur si Ollama retourne une erreur', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 500,
        text: async () => 'Erreur Ollama',
      }))
    );

    await expect(generateAnswer('prompt')).rejects.toThrow('Ollama generate failed');
  });

  it('generateEmbedding lève une erreur si Ollama retourne une erreur', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 503,
        text: async () => 'Service indisponible',
      }))
    );

    await expect(generateEmbedding('texte test')).rejects.toThrow('Ollama embeddings failed');
  });

  it('generateAnswer retourne une chaîne vide si pas de champ "response"', async () => {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({
    ok: true,
    json: async () => ({}),
  }));

  vi.stubGlobal('fetch', fetchMock);

  const result = await generateAnswer('prompt test');

  expect(result).toBe('');
});
});