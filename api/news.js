export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const apiKey    = process.env.ALPACA_API_KEY;
  const apiSecret = process.env.ALPACA_API_SECRET;

  if (!apiKey || !apiSecret) {
    return new Response(JSON.stringify({ error: 'Alpaca credentials not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // Alpaca news endpoint — pulls latest 30 financial news articles
  // Broad symbol list triggers wider news coverage from all Alpaca sources
  // (Benzinga, Reuters, MT Newswires, Seeking Alpha, GlobeNewswire etc)
  const stockSyms  = "AAPL,NVDA,TSLA,MSFT,AMZN,MARA,RIOT,COIN,MSTR,SMCI,IONQ,RGTI,RKLB,SOUN,UPST,AFRM,SOFI,BBAI,QBTS,ASTS,ACHR,JOBY,PLUG,FCEL,BLNK,NIO,XPEV,SAVA,OCGN,NKLA,MULN,SPY,QQQ,GLD,USO";
  const cryptoSyms = "BTC/USD,ETH/USD,SOL/USD,DOGE/USD,AVAX/USD,LINK/USD,MATIC/USD,BNB/USD";
  const url = `https://data.alpaca.markets/v1beta1/news?limit=50&sort=desc&symbols=${encodeURIComponent(stockSyms + "," + cryptoSyms)}`;

  try {
    const res = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID':     apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Accept': 'application/json',
      },
    });

    const data = await res.json();

    if (!data.news) {
      return new Response(JSON.stringify({ error: 'No news returned', raw: data }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const articles = data.news.map(item => ({
      id:   item.id?.toString() || item.url,
      h:    item.headline,
      src:  item.source || 'Alpaca News',
      url:  item.url,
      ts:   new Date(item.created_at).getTime(),
      bias: classifyBias(item.headline + ' ' + (item.summary || '')),
    }));

    return new Response(JSON.stringify({ articles }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

function classifyBias(text) {
  const t = text.toLowerCase();
  const bullish = ['surges','jumps','gains','rises','beats','record','high','rally','boosts',
    'approval','upgrade','bullish','inflows','strong','growth','wins','expands','soars','spikes'];
  const bearish = ['falls','drops','slips','plunges','warns','misses','low','selloff','crash',
    'cut','downgrade','bearish','outflows','weak','decline','loses','shrinks','risk','fears','tumbles'];
  let score = 0;
  bullish.forEach(w => { if (t.includes(w)) score++; });
  bearish.forEach(w => { if (t.includes(w)) score--; });
  return score > 0 ? 'bull' : score < 0 ? 'bear' : 'neutral';
}
