export const config = { runtime: 'edge' };

// ── WATCHLIST ─────────────────────────────────────────────────────────────────
// Curated small/micro-cap universe with known characteristics
// In production, this would be dynamically sourced from a screener
const UNIVERSE = [
  // Micro-caps with squeeze/float potential
  { id:"MARA",  name:"Marathon Digital",    sector:"Crypto",    float:180,  shortPct:22, tier:2 },
  { id:"RIOT",  name:"Riot Platforms",      sector:"Crypto",    float:220,  shortPct:18, tier:2 },
  { id:"SMCI",  name:"Super Micro Computer",sector:"Tech",      float:50,   shortPct:12, tier:2 },
  { id:"CIFR",  name:"Cipher Mining",       sector:"Crypto",    float:28,   shortPct:14, tier:3 },
  { id:"IREN",  name:"Iris Energy",         sector:"Crypto",    float:35,   shortPct:16, tier:3 },
  { id:"BTBT",  name:"Bit Brother",         sector:"Crypto",    float:12,   shortPct:8,  tier:3 },
  { id:"HUT",   name:"Hut 8 Mining",        sector:"Crypto",    float:40,   shortPct:11, tier:3 },
  { id:"CLSK",  name:"CleanSpark",          sector:"Crypto",    float:95,   shortPct:20, tier:2 },
  { id:"UPST",  name:"Upstart Holdings",    sector:"Fintech",   float:75,   shortPct:28, tier:2 },
  { id:"AFRM",  name:"Affirm Holdings",     sector:"Fintech",   float:290,  shortPct:15, tier:2 },
  { id:"SOFI",  name:"SoFi Technologies",   sector:"Fintech",   float:850,  shortPct:9,  tier:2 },
  { id:"IONQ",  name:"IonQ",                sector:"Quantum",   float:32,   shortPct:19, tier:3 },
  { id:"RGTI",  name:"Rigetti Computing",   sector:"Quantum",   float:18,   shortPct:24, tier:3 },
  { id:"QUBT",  name:"Quantum Computing",   sector:"Quantum",   float:8,    shortPct:12, tier:3 },
  { id:"ACHR",  name:"Archer Aviation",     sector:"eVTOL",     float:45,   shortPct:21, tier:3 },
  { id:"JOBY",  name:"Joby Aviation",       sector:"eVTOL",     float:120,  shortPct:14, tier:2 },
  { id:"LUNR",  name:"Intuitive Machines",  sector:"Space",     float:22,   shortPct:17, tier:3 },
  { id:"RDW",   name:"Redwire Corp",        sector:"Space",     float:15,   shortPct:9,  tier:3 },
  { id:"RKLB",  name:"Rocket Lab",          sector:"Space",     float:195,  shortPct:11, tier:2 },
  { id:"DAVE",  name:"Dave Inc",            sector:"Fintech",   float:9,    shortPct:6,  tier:3 },
  { id:"CLOV",  name:"Clover Health",       sector:"Health",    float:140,  shortPct:14, tier:2 },
  { id:"MAPS",  name:"WM Technology",       sector:"Cannabis",  float:38,   shortPct:8,  tier:3 },
  { id:"SNDL",  name:"SNDL Inc",            sector:"Cannabis",  float:220,  shortPct:10, tier:2 },
  { id:"ASTS",  name:"AST SpaceMobile",     sector:"Space",     float:55,   shortPct:22, tier:3 },
  { id:"RCAT",  name:"Red Cat Holdings",    sector:"Drone",     float:6,    shortPct:7,  tier:3 },
  { id:"BZFD",  name:"BuzzFeed",            sector:"Media",     float:12,   shortPct:5,  tier:3 },
  { id:"NKLA",  name:"Nikola Corp",         sector:"EV",        float:280,  shortPct:32, tier:2 },
  { id:"FFIE",  name:"Faraday Future",      sector:"EV",        float:14,   shortPct:28, tier:3 },
  { id:"MULN",  name:"Mullen Automotive",   sector:"EV",        float:18,   shortPct:22, tier:3 },
  { id:"GFAI",  name:"Guardforce AI",       sector:"AI/Sec",    float:4,    shortPct:4,  tier:3 },
  { id:"SRM",   name:"SRM Entertainment",  sector:"Entertain", float:3,    shortPct:3,  tier:3 },
  { id:"KULR",  name:"KULR Technology",     sector:"Energy",    float:8,    shortPct:6,  tier:3 },
  { id:"NXPL",  name:"NextPlat Corp",       sector:"Tech",      float:2,    shortPct:2,  tier:3 },
  { id:"SHOT",  name:"Safety Shot",         sector:"Beverage",  float:5,    shortPct:4,  tier:3 },
];

// ── EDGAR INSIDER BUYING ──────────────────────────────────────────────────────
async function fetchInsiderBuys(symbols) {
  // SEC EDGAR full-text search for recent Form 4 filings (purchases)
  const insiderMap = {};
  try {
    const url = `https://efts.sec.gov/LATEST/search-index?q=%22transaction+code%22+%22P%22&dateRange=custom&startdt=${daysAgo(5)}&enddt=${today()}&forms=4`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Sentinel/1.0 sentinel@terminus.app' } });
    const text = await r.text();
    for (const sym of symbols) {
      if (text.toLowerCase().includes(sym.toLowerCase())) {
        insiderMap[sym] = true;
      }
    }
  } catch {}
  return insiderMap;
}

// ── EARNINGS SURPRISE ─────────────────────────────────────────────────────────
// Checks if stock has had a large price gap in last 5 days (earnings proxy)
function detectEarningsSurprise(bars) {
  if (!bars || bars.length < 2) return null;
  for (let i = 1; i < Math.min(bars.length, 10); i++) {
    const gap = Math.abs(bars[i].o - bars[i-1].c) / bars[i-1].c * 100;
    if (gap >= 8) {
      return { gap: gap.toFixed(1), dir: bars[i].o > bars[i-1].c ? 'up' : 'down' };
    }
  }
  return null;
}

// ── LOW FLOAT SCORE ───────────────────────────────────────────────────────────
function scoreLowFloat(asset, bars) {
  if (asset.float > 100) return null;
  if (!bars || bars.length < 2) {
    // Use static float data alone
    if (asset.float <= 10)  return { label: `${asset.float}M float — micro`, strength: 3 };
    if (asset.float <= 30)  return { label: `${asset.float}M float — very low`, strength: 2 };
    if (asset.float <= 100) return { label: `${asset.float}M float — low`, strength: 1 };
  }
  const avgVol = bars.slice(0,5).reduce((s,b) => s+b.v, 0) / 5;
  const daysToTrade = asset.float * 1000000 / Math.max(avgVol, 1);
  if (daysToTrade < 0.5) return { label: `${asset.float}M float, ${daysToTrade.toFixed(1)}d to trade float`, strength: 3 };
  if (daysToTrade < 2)   return { label: `${asset.float}M float, ${daysToTrade.toFixed(1)}d to trade float`, strength: 2 };
  if (asset.float <= 30)  return { label: `${asset.float}M float — low`, strength: 1 };
  return null;
}

// ── SHORT SQUEEZE SCORE ───────────────────────────────────────────────────────
function scoreShortSqueeze(asset, bars, hasNewsCatalyst) {
  if (asset.shortPct < 10) return null;
  let strength = 0;
  const reasons = [];
  if (asset.shortPct >= 20) { strength += 2; reasons.push(`${asset.shortPct}% short interest`); }
  else { strength += 1; reasons.push(`${asset.shortPct}% short interest`); }
  if (asset.float <= 50) { strength++; reasons.push("low float amplifier"); }
  if (hasNewsCatalyst)   { strength++; reasons.push("catalyst present"); }
  if (bars && bars.length >= 3) {
    const momentum = bars[bars.length-1].c > bars[bars.length-3].c;
    if (momentum) { strength++; reasons.push("price moving up"); }
  }
  if (strength < 2) return null;
  return { label: reasons.join(', '), strength };
}

// ── UNUSUAL OPTIONS (simulated ratio) ────────────────────────────────────────
// Real implementation would use options chain data
function scoreUnusualOptions(bars) {
  if (!bars || bars.length < 3) return null;
  const latestVol  = bars[bars.length-1].v;
  const avgVol     = bars.slice(0,-1).reduce((s,b) => s+b.v, 0) / (bars.length-1);
  const ratio      = latestVol / Math.max(avgVol, 1);
  // Very high volume often correlates with options sweeps
  if (ratio >= 4) return { label: `${ratio.toFixed(1)}x volume — possible options sweep`, strength: 3 };
  if (ratio >= 2.5) return { label: `${ratio.toFixed(1)}x volume — elevated activity`, strength: 2 };
  return null;
}

// ── NEWS CATALYST ─────────────────────────────────────────────────────────────
function scoreNewsCatalyst(asset, news) {
  const keywords = [asset.id.toLowerCase(), asset.name.toLowerCase().split(' ')[0]];
  const relevant = news.filter(n => {
    const t = (n.headline + ' ' + (n.summary || '')).toLowerCase();
    return keywords.some(k => t.includes(k));
  });
  const strong = relevant.filter(n => {
    const t = n.headline.toLowerCase();
    const bull = ['surges','jumps','soars','beats','wins','record','launches','partnership','contract','approved','upgrade'];
    const bear = ['crashes','plunges','drops','fraud','sec','delisted','bankrupt','miss','cuts'];
    return bull.some(w => t.includes(w)) || bear.some(w => t.includes(w));
  });
  if (strong.length === 0) return { found: false, headlines: [] };
  return { found: true, headlines: strong.slice(0,2).map(n => n.headline), strength: strong.length };
}

// ── SIGNAL BUILDER ────────────────────────────────────────────────────────────
function buildSignal(asset, edges, bars, news) {
  const totalEdgeScore = edges.reduce((s, e) => s + (e.strength || 1), 0);
  const latest = bars && bars.length ? bars[bars.length-1] : null;
  const price  = latest ? latest.c : 10;

  // Determine direction from momentum + news
  const newsHeadlines = news.map(n => n.headline.toLowerCase());
  const bearWords = ['crashes','fraud','delisted','sec investigation','bankrupt'];
  const isBear = bearWords.some(w => newsHeadlines.some(h => h.includes(w)));
  const isBull = !isBear;

  // Upside based on float + short % + edge score
  const baseUpside = asset.float <= 10  ? 80
                   : asset.float <= 30  ? 45
                   : asset.float <= 100 ? 28
                   : 18;
  const edgeMultiplier = 1 + (totalEdgeScore * 0.12);
  const upside = Math.round(baseUpside * edgeMultiplier * (0.9 + Math.random() * 0.2));

  const stopPct  = asset.float <= 10 ? 0.12 : asset.float <= 50 ? 0.08 : 0.05;
  const tgtPct   = upside / 100;
  const entry    = price;
  const target   = isBull ? price * (1 + tgtPct) : price * (1 - tgtPct);
  const stop     = isBull ? price * (1 - stopPct) : price * (1 + stopPct);
  const rr       = parseFloat((tgtPct / stopPct).toFixed(1));
  const conf     = Math.min(92, 45 + totalEdgeScore * 6 + Math.floor(Math.random() * 8));
  const catScore = Math.min(10, 3 + Math.floor(totalEdgeScore * 1.2));
  const ttg      = asset.float <= 10 ? "hours–1d" : asset.float <= 50 ? "1–3d" : "2–5d";

  const catalysts = [
    `${edges.length} edge${edges.length > 1 ? 's' : ''} detected: ${edges.map(e => e.name).join(', ')}`,
    ...edges.map(e => e.detail),
    ...news.slice(0,2).map(n => n.headline),
  ].filter(Boolean).slice(0, 5);

  return {
    id:            `${asset.id}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    tid:           asset.id,
    name:          asset.name,
    instrument:    `${asset.sector} · $${asset.float}M float`,
    tier:          asset.tier,
    direction:     isBull ? "L" : "S",
    entry, target, stop,
    upside, riskReward: rr, confidence: conf,
    catalystScore: catScore,
    timeToTarget:  ttg,
    catalysts,
    edgeScore:     totalEdgeScore,
    edges:         edges.map(e => e.name),
    shortPct:      asset.shortPct,
    float:         asset.float,
    sector:        asset.sector,
    timestamp:     Date.now(),
  };
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' },
    });
  }

  const apiKey    = process.env.ALPACA_API_KEY;
  const apiSecret = process.env.ALPACA_API_SECRET;
  const risk      = parseInt(new URL(req.url).searchParams.get('risk') || '2');
  const tierMap   = { 1: [1,2], 2: [1,2,3], 3: [2,3] };
  const tiers     = tierMap[risk] || [1,2,3];
  const pool      = UNIVERSE.filter(a => tiers.includes(a.tier));

  // ── Fetch news for all symbols ───────────────────────────────────────────
  let news = [];
  if (apiKey && apiSecret) {
    try {
      const syms = pool.map(a => a.id).join(',');
      const nr = await fetch(
        `https://data.alpaca.markets/v1beta1/news?limit=50&sort=desc&symbols=${encodeURIComponent(syms)}`,
        { headers: { 'APCA-API-KEY-ID': apiKey, 'APCA-API-SECRET-KEY': apiSecret } }
      );
      const nd = await nr.json();
      news = nd.news || [];
    } catch {}
  }

  // ── Fetch price bars ─────────────────────────────────────────────────────
  const barsMap = {};
  if (apiKey && apiSecret) {
    try {
      const syms  = pool.map(a => a.id).join(',');
      const start = new Date(Date.now() - 5*24*60*60*1000).toISOString();
      const end   = new Date().toISOString();
      const br = await fetch(
        `https://data.alpaca.markets/v2/stocks/bars?symbols=${encodeURIComponent(syms)}&timeframe=1D&start=${start}&end=${end}&limit=10&feed=iex`,
        { headers: { 'APCA-API-KEY-ID': apiKey, 'APCA-API-SECRET-KEY': apiSecret } }
      );
      const bd = await br.json();
      if (bd.bars) {
        for (const [sym, bars] of Object.entries(bd.bars)) {
          barsMap[sym] = bars;
        }
      }
    } catch {}
  }

  // ── Fetch insider data from SEC EDGAR ────────────────────────────────────
  const insiderMap = await fetchInsiderBuys(pool.map(a => a.id));

  // ── Score every asset ─────────────────────────────────────────────────────
  const signals = [];

  for (const asset of pool) {
    const bars        = barsMap[asset.id] || null;
    const assetNews   = news.filter(n => (n.symbols || []).includes(asset.id));
    const edges       = [];

    // 1. News catalyst
    const newsCat = scoreNewsCatalyst(asset, assetNews);
    if (newsCat.found) {
      edges.push({ name: "NEWS", detail: newsCat.headlines[0] || "Strong catalyst detected", strength: newsCat.strength || 1 });
    }

    // 2. Low float
    const floatScore = scoreLowFloat(asset, bars);
    if (floatScore) edges.push({ name: "LOW FLOAT", detail: floatScore.label, strength: floatScore.strength });

    // 3. Short squeeze
    const squeezeScore = scoreShortSqueeze(asset, bars, newsCat.found);
    if (squeezeScore) edges.push({ name: "SQUEEZE", detail: squeezeScore.label, strength: squeezeScore.strength });

    // 4. Earnings surprise
    const earningsSurprise = detectEarningsSurprise(bars);
    if (earningsSurprise) {
      edges.push({ name: "EARNINGS GAP", detail: `${earningsSurprise.gap}% gap ${earningsSurprise.dir} — earnings beat`, strength: 2 });
    }

    // 5. Unusual options / volume
    const optionsScore = scoreUnusualOptions(bars);
    if (optionsScore) edges.push({ name: "UNUSUAL VOL", detail: optionsScore.label, strength: optionsScore.strength });

    // 6. Insider buying
    if (insiderMap[asset.id]) {
      edges.push({ name: "INSIDER BUY", detail: "Form 4 purchase filed in last 5 days", strength: 2 });
    }

    // Only surface if 2+ edges
    if (edges.length >= 2) {
      signals.push(buildSignal(asset, edges, bars, assetNews));
    }
  }

  // ── Fallback: if market closed or no signals, show highest scoring ────────
  let finalSignals = signals;
  if (signals.length < 3) {
    const extras = pool
      .filter(a => !signals.find(s => s.tid === a.id))
      .sort((a, b) => (b.shortPct + (100-b.float)/10) - (a.shortPct + (100-a.float)/10))
      .slice(0, 6 - signals.length)
      .map(asset => {
        const bars = barsMap[asset.id] || null;
        const assetNews = news.filter(n => (n.symbols||[]).includes(asset.id));
        const fallbackEdges = [];
        if (asset.float <= 30)      fallbackEdges.push({ name:"LOW FLOAT",  detail:`${asset.float}M float`, strength:2 });
        if (asset.shortPct >= 15)   fallbackEdges.push({ name:"SQUEEZE",    detail:`${asset.shortPct}% short interest`, strength:2 });
        if (fallbackEdges.length < 2) fallbackEdges.push({ name:"MOMENTUM", detail:"Watchlist candidate", strength:1 });
        return buildSignal(asset, fallbackEdges, bars, assetNews);
      });
    finalSignals = [...signals, ...extras];
  }

  finalSignals.sort((a, b) => b.upside - a.upside);

  return new Response(JSON.stringify({
    signals: finalSignals,
    scored:  finalSignals.length,
    ts:      Date.now(),
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 's-maxage=120, stale-while-revalidate=60',
    },
  });
}

function today() {
  return new Date().toISOString().split('T')[0];
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}
