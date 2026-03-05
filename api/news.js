export const config = { runtime: 'edge' };

// ── RSS SOURCES ───────────────────────────────────────────────────────────────
const FEEDS = [
  { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=AAPL,NVDA,TSLA,MSFT,AMZN,COIN,MSTR,BTC-USD&region=US&lang=en-US", src: "Yahoo Finance" },
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", src: "CNBC Markets" },
  { url: "https://www.cnbc.com/id/20409666/device/rss/rss.html", src: "CNBC Tech" },
  { url: "https://feeds.marketwatch.com/marketwatch/topstories/", src: "MarketWatch" },
  { url: "https://rss.cnn.com/rss/money_latest.rss", src: "CNN Business" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", src: "CoinDesk" },
  { url: "https://cointelegraph.com/rss", src: "CoinTelegraph" },
  { url: "https://www.investing.com/rss/news.rss", src: "Investing.com" },
  { url: "https://www.forexlive.com/feed/news", src: "ForexLive" },
  { url: "https://www.fxstreet.com/rss/news", src: "FX Street" },
];

function parseRSS(xml, src) {
  const articles = [];
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const item of items) {
    const title   = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                     item.match(/<title>(.*?)<\/title>/))?.[1]?.trim();
    const link    = (item.match(/<link>(.*?)<\/link>/) ||
                     item.match(/<guid[^>]*>(.*?)<\/guid>/))?.[1]?.trim();
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim();
    if (!title || title.length < 10) continue;
    const ts = pubDate ? new Date(pubDate).getTime() : Date.now();
    if (isNaN(ts)) continue;
    articles.push({ title, link, ts, src });
  }
  return articles;
}

function classifyBias(text) {
  const t = text.toLowerCase();
  const bullish = ['surges','jumps','gains','rises','beats','record','high','rally','boosts',
    'approval','upgrade','bullish','inflows','strong','growth','wins','expands','soars','spikes',
    'breakout','bottom','recovery','rebound','bullrun','halving','etf approval'];
  const bearish = ['falls','drops','slips','plunges','warns','misses','low','selloff','crash',
    'cut','downgrade','bearish','outflows','weak','decline','loses','shrinks','risk','fears',
    'tumbles','recession','inflation','layoffs','investigation','fine','ban','hack','exploit'];
  let score = 0;
  bullish.forEach(w => { if (t.includes(w)) score++; });
  bearish.forEach(w => { if (t.includes(w)) score--; });
  return score > 0 ? 'bull' : score < 0 ? 'bear' : 'neutral';
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' },
    });
  }

  // Fetch all feeds in parallel, ignore failures
  const results = await Promise.allSettled(
    FEEDS.map(async ({ url, src }) => {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/rss+xml, application/xml, text/xml' },
        signal: AbortSignal.timeout(5000),
      });
      const text = await r.text();
      return parseRSS(text, src);
    })
  );

  // Flatten, deduplicate by title, sort by recency
  const seen = new Set();
  const all  = [];
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const a of r.value) {
      const key = a.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) continue;
      seen.add(key);
      all.push(a);
    }
  }

  all.sort((a, b) => b.ts - a.ts);

  const articles = all.slice(0, 50).map((a, i) => ({
    id:   `${i}-${a.ts}`,
    h:    a.title,
    src:  a.src,
    url:  a.link || null,
    ts:   a.ts,
    bias: classifyBias(a.title),
  }));

  return new Response(JSON.stringify({ articles }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 's-maxage=120, stale-while-revalidate=60',
    },
  });
}
