import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { config } from './config.js';
import routes from './api/routes.js';

const app = new Hono();

app.get('/', (c) => c.json({ status: 'ok', service: 'ai-hotline' }));
app.route('/', routes);

serve(
  {
    fetch: app.fetch,
    port: config.port
  },
  (info) => {
    console.log(`AI Hotline API listening on http://localhost:${info.port}`);
  }
);