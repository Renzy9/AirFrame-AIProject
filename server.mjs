// Small backend server. The visible page is index.html + styles.css + app.js.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { handlePrediction } from './backend/predict.js';

const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
  ['/ICONS-LICENSE.txt', ['ICONS-LICENSE.txt', 'text/plain; charset=utf-8']],
]);

const server = createServer(async (req, res) => {
  try {
    const origin = `http://${req.headers.host || 'localhost'}`;
    const url = new URL(req.url, origin);
    if (url.pathname === '/api/predict') {
      if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }); res.end(); return; }
      const chunks = [];
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > 4096) {
          res.writeHead(413, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
          res.end(JSON.stringify({ error: 'The request is too large.' })); return;
        }
        chunks.push(chunk);
      }
      const request = new Request(url, { method: 'POST', headers: req.headers, body: Buffer.concat(chunks) });
      const response = await handlePrediction(request);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer())); return;
    }
    const asset = assets.get(url.pathname);
    if (!asset) { res.writeHead(404); res.end('Not found'); return; }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
    const content = await readFile(new URL(asset[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': asset[1], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ error: 'Your result is temporarily unavailable. Please try again.' }));
  }
});
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '127.0.0.1';
server.listen(port, host, () => console.log(`Airframe: http://${host}:${port}`));
