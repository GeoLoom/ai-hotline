import { Hono } from 'hono';
import { retrieveSimilarIncidents } from '../rag/retriever.js';
import { buildSupportPrompt } from '../rag/promptBuilder.js';
import { generateAnswer } from '../services/ollama.js';
import type { Context } from 'hono';   
import { answerSchema, feedbackSchema } from './schemas.js';
import { rateLimiter } from './rateLimiter.js';
import { insertFeedback } from '../db.js';

//todo attention on rajoute les version à partir de maintenant mais dés interconnection on rajoutera plus de route 

const app = new Hono();

const v1 = new Hono();

async function parseJsonBody(c: Context): Promise<{ ok: true; data: unknown } | { ok: false }> {
  try {
    return { ok: true, data: await c.req.json() };
  } catch {
    return { ok: false };
  }
}


v1.post('/answer', rateLimiter({ windowMs: 60_000, max: 20 }), async (c) => {
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

v1.post('/feedback', async (c) => {
  
  const body = await parseJsonBody(c);
  if (!body.ok) {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = feedbackSchema.safeParse(body.data)

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  
  insertFeedback(parsed.data);

  return c.json({
    status: 'ok',
    message: 'Feedback received',
    feedback: parsed.data
  });
});

v1.post('/ingest', async (c) => {
  return c.json({
    status: 'todo',
    message: 'Prefer running ingestion through npm run ingest for batch indexing'
  });
});



app.route('/', v1);

app.route('/v1', v1);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.onError((err, c) => {
  console.error('[ai-hotline] Erreur non gérée:', err);
  return c.json({ error: 'Internal server error' }, 500);
});


export default app;