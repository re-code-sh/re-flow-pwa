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

// Fallback to static assets with smart anti-cache for HTML and strong caching for hashed assets
app.all('*', async (c) => {
  if (c.env.ASSETS) {
    const url = new URL(c.req.url);
    const response = await c.env.ASSETS.fetch(c.req.raw);
    
    // Create new response to customize headers
    const newHeaders = new Headers(response.headers);
    
    if (url.pathname === '/' || url.pathname.endsWith('.html') || !url.pathname.includes('.')) {
      // Never cache index.html or document routes so mobile always gets latest build
      newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      newHeaders.set('Pragma', 'no-cache');
      newHeaders.set('Expires', '0');
    } else if (url.pathname.startsWith('/assets/')) {
      // Immutable long-term caching for hashed JS/CSS assets
      newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }
  return c.text('Not Found', 404);
});

export default app;
