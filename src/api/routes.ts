import fs from 'node:fs';
import path from 'node:path';
import { Hono } from 'hono';
import { retrieveSimilarIncidents } from '../rag/retriever.js';
import { buildTicketSupportPrompt, buildDocsSupportPrompt } from '../rag/promptBuilder.js';
import { generateAnswer } from '../services/ollama.js';
import type { Context } from 'hono';   
import { answerSchema, feedbackSchema } from './schemas.js';
import { rateLimiter } from './rateLimiter.js';
import { insertFeedback } from '../db.js';
import { checkAuth } from './checkAuth.js';
import { openApiDocument } from './openapi.js';
import { serveStatic } from '@hono/node-server/serve-static';

const app = new Hono();
const v1 = new Hono();

v1.use('*', checkAuth);

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
  const retrieved = await retrieveSimilarIncidents(question, application, 'incident');
  const prompt = buildTicketSupportPrompt(question, retrieved);
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

v1.post('/answer/docs', rateLimiter({ windowMs: 60_000, max: 20 }), async (c) => {
  const body = await parseJsonBody(c);
  if (!body.ok) {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }
  const parsed = answerSchema.safeParse(body.data);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const { question, application } = parsed.data;
  const retrieved = await retrieveSimilarIncidents(question, application, 'doc');
  const prompt = buildDocsSupportPrompt(question, retrieved);
  const answer = await generateAnswer(prompt);
  return c.json({
    answer,
    sources: retrieved.map((doc) => ({
      reference: doc.metadata.ticket_id ?? doc.id,
      score: doc.score
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





app.get('/health', (c) => c.json({ status: 'ok' }));
app.get('/openapi.json', (c) => c.json(openApiDocument));

app.get('/demo', (c) => {
  const html = fs.readFileSync(path.join(process.cwd(), 'public/demo/index.html'), 'utf-8');
  return c.html(html);
});

app.use('/demo/assets/*', serveStatic({ root: './public' }));

app.route('/', v1);
app.route('/v1', v1);



app.onError((err, c) => {
  console.error('[ai-hotline] Erreur non gérée:', err);
  return c.json({ error: 'Internal server error' }, 500);
});


export default app;