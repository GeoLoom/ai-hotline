import { Hono } from 'hono';
import { z } from 'zod';
import { retrieveSimilarIncidents } from '../rag/retriever.js';
import { buildSupportPrompt } from '../rag/promptBuilder.js';
import { generateAnswer } from '../services/ollama.js';
import type { Context } from 'hono';   

const app = new Hono();

const answerSchema = z.object({
  question: z.string().min(3),
  application: z.string().optional()
});

const feedbackSchema = z.object({
  question: z.string(),
  answer: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

async function parseJsonBody(c: Context): Promise<{ ok: true; data: unknown } | { ok: false }> {
  try {
    return { ok: true, data: await c.req.json() };
  } catch {
    return { ok: false };
  }
}


app.post('/answer', async (c) => {
  const body = await parseJsonBody(c);
  if (!body.ok) {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = answerSchema.safeParse(body.data);
 
   if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { question, application } = parsed.data;
  const retrieved = await retrieveSimilarIncidents(question, application);
  const prompt = buildSupportPrompt(question, retrieved);
  const answer = await generateAnswer(prompt);

  return c.json({
    answer,
    sources: retrieved.map((doc) => ({
      ticket_id: doc.metadata.ticket_id ?? doc.id,
      score: doc.score,
      application: doc.metadata.application ?? null,
      site: doc.metadata.site ?? null
    }))
  });
});

app.post('/feedback', async (c) => {
  
  const body = await parseJsonBody(c);
  if (!body.ok) {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = feedbackSchema.safeParse(body.data)

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  return c.json({
    status: 'ok',
    message: 'Feedback received',
    feedback: parsed.data
  });
});

app.post('/ingest', async (c) => {
  return c.json({
    status: 'todo',
    message: 'Prefer running ingestion through npm run ingest for batch indexing'
  });
});


app.onError((err, c) => {
  console.error('[ai-hotline] Erreur non gérée:', err);
  return c.json({ error: 'Internal server error' }, 500);
});


export default app;