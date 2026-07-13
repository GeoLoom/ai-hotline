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
  application?: string,
  sourceType?: 'incident' | 'doc'
): Promise<RetrievedDocument[]> {
  const collection = await getCollection();
  const embedding = await generateEmbedding(question);

  const filters: Record<string, string>[] = [];
  if (application) filters.push({ application });
  if (sourceType) filters.push({ source_type: sourceType });

  const where =
    filters.length === 0 ? undefined :
    filters.length === 1 ? filters[0] :
    { $and: filters };

  const result = await collection.query({
    queryEmbeddings: [embedding],
    nResults: config.topK,
    where,
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
