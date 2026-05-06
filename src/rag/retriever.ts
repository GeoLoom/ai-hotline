import { getCollection } from "./chroma"
import { generateEmbedding } from "../services/ollama"

export async function search(question: string) {

  const collection = await getCollection()

  const embedding = await generateEmbedding(question)

  const result = await collection.query({
    queryEmbeddings: [embedding],
    nResults: 3
  })

  return result.documents[0]

}