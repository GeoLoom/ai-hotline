import type { RetrievedDocument } from './retriever.js';

export function buildSupportPrompt(question: string, docs: RetrievedDocument[]): string {
  const context = docs
    .map((doc, index) => {
      const ticketId = String(doc.metadata.ticket_id ?? doc.id);
      return [
        `### Incident ${index + 1}`,
        `Ticket ID: ${ticketId}`,
        `Similarity score: ${doc.score.toFixed(3)}`,
        doc.text
      ].join('\n');
    })
    .join('\n\n');

  return `
You are an expert technical support engineer for warehouse logistics software.

You must answer using the retrieved historical incidents.
If the incidents are insufficient, say that the diagnosis is uncertain.

User question:
${question}

Similar incidents from history:
${context}

Provide your answer in this structure:
1. Probable root cause
2. Diagnostic steps
3. Possible fix
4. Risks / precautions
5. References to incidents

Do not invent a fix if not grounded in the retrieved incidents.
`.trim();
}