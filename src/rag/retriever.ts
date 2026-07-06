import { getCollection } from "./chroma.js";
import { generateEmbedding } from "../services/ollama.js";
import { config } from "../config.js";

export interface RetrievedDocument {
  id: string;
  score: number;
  text: string;
  metadata: Record<string, unknown>;
}

export async function retrieveSimilarIncidents(
  question: string,
  application?: string
): Promise<RetrievedDocument[]> {
  const collection = await getCollection();
  const embedding = await generateEmbedding(question);

  const result = await collection.query({
    queryEmbeddings: [embedding],
    nResults: config.topK,
    where: application ? { application } : undefined,
  });

  const ids = result.ids?.[0] ?? [];
  const documents = result.documents?.[0] ?? [];
  const metadatas = result.metadatas?.[0] ?? [];
  const distances = result.distances?.[0] ?? [];

  return ids.map((id, i) => ({
    id,
    text: documents[i] ?? '',
    metadata: (metadatas[i] ?? {}) as Record<string, unknown>,
    score: distances[i] != null ? 1 - distances[i] : 0,
  }));
}
