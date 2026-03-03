export const config = { runtime: 'edge' };

export default async function handler(req) {
  const allowedOrigins = ['http://localhost:3000', 'https://sentinel.vercel.app'];
  const origin = req.headers.get('origin') || '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'NEWS_API_KEY not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // Financial news queries — rotated to stay within rate limits
  const queries = [
    'forex OR "currency" OR "interest rates" OR "central bank"',
    'cryptocurrency OR bitcoin OR ethereum OR altcoin',
    'stocks OR "earnings" OR "options" OR "short squeeze"',
    '"emerging markets" OR "commodities" OR "oil" OR "gold"',
  ];
  const q = queries[Math.floor(Math.random() * queries.length)];

  const sources = 'bloomberg,reuters,the-wall-street-journal,financial-times,cnbc,business-insider';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sources=${sources}&pageSize=20&sortBy=publishedAt&language=en&apiKey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'ok') {
      return new Response(JSON.stringify({ error: data.message || 'NewsAPI error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Clean and tag articles
    const articles = (data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]')
      .map(a => ({
        id: a.url,
        h: a.title,
        src: a.source?.name || 'Unknown',
        url: a.url,
        ts: new Date(a.publishedAt).getTime(),
        bias: classifyBias(a.title + ' ' + (a.description || '')),
      }));

    return new Response(JSON.stringify({ articles }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=120, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

// Simple rule-based sentiment classifier
function classifyBias(text) {
  const t = text.toLowerCase();
  const bullish = ['surges','jumps','gains','rises','beats','record','high','rally','boosts',
    'approval','upgrade','bullish','inflows','strong','growth','wins','expands'];
  const bearish = ['falls','drops','slips','plunges','warns','misses','low','selloff','crash',
    'cut','downgrade','bearish','outflows','weak','decline','loses','shrinks','risk','fears'];
  let score = 0;
  bullish.forEach(w => { if (t.includes(w)) score++; });
  bearish.forEach(w => { if (t.includes(w)) score--; });
  return score > 0 ? 'bull' : score < 0 ? 'bear' : 'neutral';
}
