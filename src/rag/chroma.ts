import { ChromaClient } from "chromadb"

export const chroma = new ChromaClient({
  path: "http://localhost:8000"
})

export async function getCollection() {
  return chroma.getOrCreateCollection({
    name: "incidents",
    metadata: { "hnsw:space": "cosine" },
    embeddingFunction: undefined 
  })
}
