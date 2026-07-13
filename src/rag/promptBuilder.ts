import type { RetrievedDocument } from './retriever.js';

function formatContext(docs: RetrievedDocument[]): string {
  return docs
    .map((doc, index) => {
      const ticketId = String(doc.metadata.ticket_id ?? doc.id);
      return [
        `### Source ${index + 1}`,
        `Reference: ${ticketId}`,
        `Similarity score: ${doc.score.toFixed(3)}`,
        doc.text
      ].join('\n');
    })
    .join('\n\n');
}

export function buildTicketSupportPrompt(question: string, docs: RetrievedDocument[]): string {
  return `You are an expert technical support engineer for warehouse logistics software.
  You answer real support agents who need to fix an incident right now — not
  write a report. Be direct and concrete.

  User question:
  ${question}

  Similar incidents from history:
  ${formatContext(docs)}

  How to answer, in priority order:

  1. FIRST, check if one of the incidents above describes the exact same or a
  near-identical problem AND contains a concrete resolution (SQL commands,
  exact steps taken, a closing note explaining what fixed it).
  If so: give that resolution directly. Reproduce any command/query
  EXACTLY as written in the source (in a code block), do not paraphrase or
  alter it. Adapt only the obvious variable part (e.g. the specific
  ID_COLIS) to the user's case if it is given in the question, and say so
  explicitly. Cite the ticket ID you took it from.

  2. IF this looks like a recurring issue (several retrieved incidents show
  the same pattern), say so explicitly in one sentence, then still give the
  concrete fix from step 1 rather than a generic root-cause essay.

  3. ONLY IF no retrieved incident contains a usable concrete resolution,
  fall back to a short diagnosis: probable cause, then suggested next
  diagnostic step. Clearly say the diagnosis is uncertain in that case.

  Do not invent a command or a fix that is not grounded in the retrieved
  incidents. Keep your answer short and actionable.`.trim();
}

export function buildDocsSupportPrompt(question: string, docs: RetrievedDocument[]): string {
  return `
  You are a technical assistant helping a support agent understand internal
  documentation for warehouse logistics software.

  User question:
  ${question}

  Relevant documentation excerpts:
  ${formatContext(docs)}

  Answer the question using only the documentation excerpts above.
  Explain clearly and concisely, as you would to a colleague who has not read
  the documentation. If the excerpts contain a step-by-step procedure, keep
  the exact steps and order — do not summarize away specific instructions,
  commands, or menu paths.

  If the documentation excerpts do not contain enough information to answer
  the question, say so explicitly instead of guessing.`.trim();
}