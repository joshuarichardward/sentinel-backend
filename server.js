import express from 'express';
import screen4Module  from './api/screen4.js';
import analyseModule  from './api/analyse.js';
import newsModule     from './api/news.js';
import pricesModule   from './api/prices.js';

// Handle both named and default exports
const screen4 = screen4Module.handler || screen4Module.default || screen4Module;
const analyse = analyseModule.handler || analyseModule.default || analyseModule;
const news    = newsModule.handler    || newsModule.default    || newsModule;
const prices  = pricesModule.handler  || pricesModule.default  || pricesModule;

const app  = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Adapter: converts Express req/res to fetch-style Request, pipes Response back
async function adapt(handler, req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host  = req.headers.host || 'localhost';
  const url   = `${proto}://${host}${req.originalUrl}`;
  const fakeReq = new Request(url, { method: req.method, headers: req.headers });
  try {
    const response = await handler(fakeReq);
    const text     = await response.text();
    response.headers.forEach((val, key) => res.setHeader(key, val));
    res.status(response.status).send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

app.get('/api/screen4',  (req, res) => adapt(screen4, req, res));
app.get('/api/news',     (req, res) => adapt(news,    req, res));
app.get('/api/prices',   (req, res) => adapt(prices,  req, res));
app.get('/api/analyse',  (req, res) => adapt(analyse, req, res));

app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

app.listen(PORT, () => console.log(`Sentinel backend running on port ${PORT}`));
