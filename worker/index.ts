import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { syncRouter } from './routes/sync';
import { authRouter } from './routes/auth';

export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
}

const app = new Hono<{ Bindings: Env }>();

// Middlewares
app.use('*', cors());

// API Routes
app.route('/api/sync', syncRouter);
app.route('/api/auth', authRouter);

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', time: new Date().toISOString() });
});

// Fallback to static assets
app.all('*', async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Not Found', 404);
});

export default app;
