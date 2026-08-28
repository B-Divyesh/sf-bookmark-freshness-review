import { defineConfig } from 'vite';
import path from 'node:path';

interface LinkProbe { path: string; at: number; cookie: string; }

function linkCheckFixture() {
  const requests = new Map<string, LinkProbe[]>();
  return {
    name: 'link-check-fixture',
    configureServer(server: { middlewares: { use: (handler: (request: import('node:http').IncomingMessage, response: import('node:http').ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://127.0.0.1');
        const linkMatch = url.pathname.match(/^\/__test-link\/([^/]+)\/([^/]+)$/);
        const logMatch = url.pathname.match(/^\/__test-log\/([^/]+)$/);
        if (linkMatch) {
          const session = decodeURIComponent(linkMatch[1]);
          const log = requests.get(session) ?? [];
          log.push({ path: decodeURIComponent(linkMatch[2]), at: Date.now(), cookie: request.headers.cookie ?? '' });
          requests.set(session, log);
          const status = Number(url.searchParams.get('status')) || 200;
          response.statusCode = status;
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.setHeader('Cache-Control', 'no-store');
          if (url.searchParams.has('retryAfter')) response.setHeader('Retry-After', url.searchParams.get('retryAfter') ?? '2');
          response.end('<!doctype html><title>Link check fixture</title><link rel="canonical" href="/checked">');
          return;
        }
        if (logMatch) {
          response.setHeader('Content-Type', 'application/json');
          response.setHeader('Cache-Control', 'no-store');
          response.end(JSON.stringify(requests.get(decodeURIComponent(logMatch[1])) ?? []));
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  root: path.resolve(import.meta.dirname),
  publicDir: 'public',
  plugins: [linkCheckFixture()],
  build: {
    outDir: path.resolve(import.meta.dirname, '../dist/site'),
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: true
  }
});
