import { generateEmbedding } from '../services/ollama.js';

export async function embedText(text: string): Promise<number[]> {
  return generateEmbedding(text);
}