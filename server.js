import express from 'express';
import { handler as screen4 } from './api/screen4.js';
import analyse from './api/analyse.js';
import news    from './api/news.js';
import prices  from './api/prices.js';

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
app.get('/api/debug-prices', async (req, res) => {
  const finnhubKey = process.env.FINNHUB_API_KEY;
  const polygonKey = process.env.POLYGON_API_KEY;
  const twelveKey  = process.env.TWELVE_DATA_API_KEY;
  const results = { keys: {
    finnhub: finnhubKey ? finnhubKey.slice(0,8)+'...' : 'MISSING',
    polygon: polygonKey ? polygonKey.slice(0,8)+'...' : 'MISSING',
    twelve:  twelveKey  ? twelveKey.slice(0,8)+'...'  : 'MISSING',
  }};

  // Test Finnhub
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=NVDA&token=${finnhubKey}`);
    const d = await r.json();
    results.finnhub_NVDA = d.c > 0 ? `$${d.c}` : `ERR: ${JSON.stringify(d)}`;
  } catch(e) { results.finnhub_NVDA = `CATCH: ${e.message}`; }

  // Test Polygon
  try {
    const r = await fetch(`https://api.polygon.io/v2/last/trade/NVDA?apiKey=${polygonKey}`);
    const d = await r.json();
    results.polygon_NVDA = d?.results?.p > 0 ? `$${d.results.p}` : `ERR: ${JSON.stringify(d).slice(0,100)}`;
  } catch(e) { results.polygon_NVDA = `CATCH: ${e.message}`; }

  // Test Twelve Data forex
  try {
    const r = await fetch(`https://api.twelvedata.com/price?symbol=EUR/USD&apikey=${twelveKey}`);
    const d = await r.json();
    results.twelve_EURUSD = d?.price ? `$${d.price}` : `ERR: ${JSON.stringify(d).slice(0,100)}`;
  } catch(e) { results.twelve_EURUSD = `CATCH: ${e.message}`; }

  // Test CoinGecko
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const d = await r.json();
    results.coingecko_BTC = d?.bitcoin?.usd ? `$${d.bitcoin.usd}` : `ERR: ${JSON.stringify(d).slice(0,100)}`;
  } catch(e) { results.coingecko_BTC = `CATCH: ${e.message}`; }

  res.json(results);
});
app.post('/api/analyse', (req, res) => analyse(req, res));
app.get('/api/analyse',  (req, res) => analyse(req, res));

app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

app.listen(PORT, () => console.log(`Sentinel backend running on port ${PORT}`));
