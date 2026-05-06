import fs from "fs";
import axios from "axios";
import { db } from "./db";

const files = fs.readdirSync("./incidents");

for (const file of files) {
    const raw = fs.readFileSync(`./incidents/${file}`, "utf-8");
    const json = JSON.parse(raw);

    const documents = json.documents;

    for (const doc of documents) {
        const text = `
        Incident ${doc.id}
        Application: ${doc.application}
        Commentaire: ${doc.commentaire}
        Echange client: ${(doc.echange_client || []).join(" ")}
        Echange tech: ${(doc.echange_tech || []).join(" ")}
        `;

        const embedding = await axios.post(
            "http://localhost:11434/api/embeddings",
            {
                model: "phi3",
                prompt: text
            }
        );

        db.prepare(`
            INSERT OR REPLACE INTO incidents (id, content, embedding)
            VALUES (?, ?, ?)
        `).run(
            String(doc.id),
            text,
            JSON.stringify(embedding.data.embedding)
        );

        console.log("Indexé:", doc.id);
    }
}
