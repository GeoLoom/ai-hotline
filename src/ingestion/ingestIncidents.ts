import fs from "fs"
import path from "path"
import { getCollection } from "../rag/chroma"
import { generateEmbedding } from "../services/ollama"

async function main() {

  const collection = await getCollection()

  const files = fs.readdirSync("./data/raw")

  for (const file of files) {

    const content = fs.readFileSync(`./data/raw/${file}`, "utf-8")
    const json = JSON.parse(content)

    for (const doc of json.documents) {

      const text = `
Incident ${doc.id}
Application: ${doc.application}

Commentaire:
${doc.commentaire}

Client:
${(doc.echange_client || []).join("\n")}

Technique:
${(doc.echange_tech || []).join("\n")}
`

      const embedding = await generateEmbedding(text)

      await collection.add({
        ids: [`incident-${doc.id}`],
        documents: [text],
        embeddings: [embedding],
        metadatas: [{
          ticket_id: doc.id,
          application: doc.application
        }]
      })

      console.log("Indexed incident", doc.id)

    }

  }

}

main()