import { config } from '../config.js';

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${config.ollamaBaseUrl}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.ollamaEmbedModel,
      prompt: text
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama embeddings failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.embedding;
}

export async function generateAnswer(prompt: string): Promise<string> {
  const response = await fetch(`${config.ollamaBaseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.ollamaChatModel,
      prompt,
      stream: false,
      stop: ["Question de l'utilisateur"],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama generate failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.response ?? '';
}