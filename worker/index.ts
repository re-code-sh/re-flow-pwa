import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import type { Bindings, Variables } from './types';
import { authRouter } from './routes/auth';
import { syncRouter } from './routes/sync';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Global Middlewares
app.use('*', logger());
app.use('*', prettyJSON());
app.use(
  '/api/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Sync-Key'],
    maxAge: 86400,
  })
);

// Health check & API Info
app.get('/api', (c) => {
  return c.json({
    service: 're.flow sync engine',
    version: '1.0.0',
    runtime: 'Cloudflare Workers + D1',
    status: 'online',
    server_time: Date.now(),
  });
});

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: Date.now(),
  });
});

// Mount API route modules
app.route('/api/auth', authRouter);
app.route('/api/sync', syncRouter);

// Global Exception handler
app.onError((err, c) => {
  console.error('[API Error]:', err);
  return c.json(
    {
      error: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
    },
    500
  );
});

export default app;
