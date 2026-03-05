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

// ── POLITICAL BIAS CLASSIFIER ─────────────────────────────────────────────────
// First checks source-level bias (most reliable), then falls back to keywords

const SOURCE_BIAS = {
  // LEFT-LEANING
  'CNN Business':     'left',
  'CNN':              'left',
  'The Guardian':     'left',
  'HuffPost':         'left',
  'MSNBC':            'left',
  'New York Times':   'left',
  'NPR':              'left',
  'Vox':              'left',
  'Mother Jones':     'left',
  'The Atlantic':     'left',
  'Salon':            'left',

  // RIGHT-LEANING
  'Fox Business':     'right',
  'Fox News':         'right',
  'Breitbart':        'right',
  'Daily Wire':       'right',
  'Washington Times': 'right',
  'New York Post':    'right',
  'Newsmax':          'right',
  'The Federalist':   'right',
  'Daily Caller':     'right',

  // Truly neutral wire services — always centre regardless of headline
  'Reuters':          'centre',
  'AP':               'centre',
  'Associated Press': 'centre',
};

const LEFT_KEYWORDS  = [
  // Environment & energy
  'climate change','green energy','renewable','clean energy','solar','wind power',
  'carbon','emissions','esg','sustainability','electric vehicle','ev mandate',
  'paris agreement','net zero','green new deal','carbon tax','climate crisis',
  // Economic policy
  'regulation','regulations','regulated','regulator','sec charges','ftc',
  'antitrust','wealth tax','billionaire tax','minimum wage','workers','union',
  'inequality','income gap','wage gap','living wage','universal basic',
  'student debt','student loan','debt forgiveness','affordable housing',
  'public housing','rent control','price controls','windfall tax',
  // Healthcare & social
  'universal healthcare','medicare','medicaid','obamacare','aca','welfare',
  'food stamps','snap','social security','disability','affordable care',
  // Tech & finance regulation
  'crypto crackdown','crypto ban','sec investigation','sec lawsuit','fined',
  'penalty','consumer protection','cfpb','data privacy','antitrust probe',
  'monopoly','big tech regulation','social media regulation',
  // Political
  'progressive','liberal','democrat','biden','harris','left wing',
  'social justice','diversity','inclusion','equity','dei',
  'lgbtq','trans','abortion rights','reproductive','immigration reform',
  'refugee','asylum','gun control','gun reform','police reform',
  'defund','systemic','reparations','voting rights',
];

const RIGHT_KEYWORDS = [
  // Economic policy
  'deregulation','tax cut','tax cuts','tax relief','lower taxes','flat tax',
  'free market','free trade','privatize','privatisation','privatization',
  'less government','small government','big government','government overreach',
  'spending cuts','deficit reduction','balanced budget','austerity',
  // Energy
  'drill','drilling','fossil fuel','coal','oil production','lng',
  'energy independence','pipeline','keystone','fracking','offshore drilling',
  // Trade & borders
  'tariff','tariffs','trade war','sanctions','border security','border wall',
  'illegal immigration','illegal alien','deportation','america first',
  'buy american','reshoring','protectionist',
  // Finance & crypto
  'debank','debanking','bank deregulation','crypto freedom','bitcoin strategic',
  'strategic reserve','gold standard','fed audit','end the fed',
  // Security & defense
  'defense spending','military spending','nato','pentagon','weapons',
  'second amendment','gun rights','law and order','tough on crime',
  'death penalty','mandatory minimum',
  // Political
  'conservative','republican','trump','maga','right wing','gop',
  'traditional values','pro-life','school choice','vouchers',
  'election integrity','voter id','deep state','woke','anti-woke',
  'censorship','free speech','first amendment','big tech bias',
  'socialist','socialism','marxist','communist',
];

function classifyBias(headline, source) {
  // 1. Source-level classification
  const srcBias = SOURCE_BIAS[source];
  if (srcBias) return srcBias;

  // 2. Keyword fallback
  const t = (headline || '').toLowerCase();
  let score = 0;
  LEFT_KEYWORDS.forEach(w  => { if (t.includes(w)) score--; });
  RIGHT_KEYWORDS.forEach(w => { if (t.includes(w)) score++; });

  if (score > 0) return 'right';
  if (score < 0) return 'left';
  return 'unknown';
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
    bias: classifyBias(a.title, a.src),
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
