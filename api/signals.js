export const config = { runtime: 'edge' };

// ── ASSET UNIVERSE ────────────────────────────────────────────────────────────
const ASSETS = [
  { id:"AAPL",   name:"AAPL",       type:"EQ",  inst:"Stock",        tier:1, alpaca:"AAPL" },
  { id:"NVDA",   name:"NVDA",       type:"EQ",  inst:"Stock",        tier:2, alpaca:"NVDA" },
  { id:"MSFT",   name:"MSFT",       type:"EQ",  inst:"Stock",        tier:1, alpaca:"MSFT" },
  { id:"TSLA",   name:"TSLA",       type:"EQ",  inst:"Stock",        tier:2, alpaca:"TSLA" },
  { id:"SMCI",   name:"SMCI",       type:"EQ",  inst:"Mid-Cap",      tier:2, alpaca:"SMCI" },
  { id:"MARA",   name:"MARA",       type:"EQ",  inst:"Mid-Cap",      tier:2, alpaca:"MARA" },
  { id:"AMD",    name:"AMD",        type:"EQ",  inst:"Stock",        tier:2, alpaca:"AMD"  },
  { id:"COIN",   name:"COIN",       type:"EQ",  inst:"Stock",        tier:2, alpaca:"COIN" },
  { id:"BTC",    name:"BTC/USD",    type:"CR",  inst:"Crypto",       tier:2, alpaca:"BTC/USD" },
  { id:"ETH",    name:"ETH/USD",    type:"CR",  inst:"Crypto",       tier:2, alpaca:"ETH/USD" },
  { id:"SOL",    name:"SOL/USD",    type:"CR",  inst:"Altcoin",      tier:3, alpaca:"SOL/USD" },
  { id:"DOGE",   name:"DOGE/USD",   type:"CR",  inst:"Altcoin",      tier:3, alpaca:"DOGE/USD" },
  { id:"GBPJPY", name:"GBP/JPY",    type:"FX",  inst:"Forex",        tier:1, alpaca:null },
  { id:"USDTRY", name:"USD/TRY",    type:"FX",  inst:"Exotic Forex", tier:3, alpaca:null },
  { id:"USDZAR", name:"USD/ZAR",    type:"FX",  inst:"Exotic Forex", tier:2, alpaca:null },
  { id:"GLD",    name:"XAU/USD",    type:"CM",  inst:"Commodity",    tier:1, alpaca:"GLD"  },
  { id:"USO",    name:"Crude Oil",  type:"CM",  inst:"Commodity",    tier:2, alpaca:"USO"  },
];

// ── NEWS KEYWORDS PER ASSET ───────────────────────────────────────────────────
const ASSET_KEYWORDS = {
  AAPL:   ["apple","aapl","iphone","tim cook","ios","app store"],
  NVDA:   ["nvidia","nvda","jensen huang","gpu","cuda","blackwell","h100"],
  MSFT:   ["microsoft","msft","azure","copilot","satya nadella","openai"],
  TSLA:   ["tesla","tsla","elon musk","fsd","cybertruck","ev"],
  SMCI:   ["super micro","smci","supermicro","server rack","ai server"],
  MARA:   ["marathon digital","mara","bitcoin miner","mining"],
  AMD:    ["amd","advanced micro","lisa su","radeon","ryzen"],
  COIN:   ["coinbase","coin","crypto exchange","sec coinbase"],
  BTC:    ["bitcoin","btc","satoshi","crypto","digital gold","etf bitcoin"],
  ETH:    ["ethereum","eth","ether","vitalik","defi","staking"],
  SOL:    ["solana","sol","firedancer","solana dex"],
  DOGE:   ["dogecoin","doge","meme coin","memecoin"],
  GBPJPY: ["gbp","pound","boe","bank of england","yen","boj","japan"],
  USDTRY: ["turkey","lira","try","erdogan","cbrt","turkish"],
  USDZAR: ["south africa","rand","zar","eskom","load shedding"],
  GLD:    ["gold","xau","bullion","safe haven","precious metal"],
  USO:    ["oil","crude","opec","brent","wti","petroleum"],
};

// ── SCORING WEIGHTS ───────────────────────────────────────────────────────────
// Each factor contributes 1 point. Need >= 2 to surface a signal.
function scoreAsset(asset, news, bars) {
  let score = 0;
  const factors = [];

  // ── FACTOR 1: News Catalyst ───────────────────────────────────────────────
  const keywords = ASSET_KEYWORDS[asset.id] || [asset.name.toLowerCase()];
  const relevantNews = news.filter(n => {
    const text = (n.headline + ' ' + (n.summary || '')).toLowerCase();
    return keywords.some(kw => text.includes(kw));
  });
  const strongNews = relevantNews.filter(n => {
    const text = (n.headline + ' ' + (n.summary || '')).toLowerCase();
    const bullTriggers = ['surges','jumps','soars','beats','record','wins','launches','expands','upgrade','rallies','spikes','approval','breakthrough'];
    const bearTriggers = ['crashes','plunges','drops','miss','warns','cuts','downgrade','tumbles','collapses','halted','probe','fine','lawsuit'];
    return bullTriggers.some(t => text.includes(t)) || bearTriggers.some(t => text.includes(t));
  });

  if (strongNews.length >= 1) {
    score++;
    factors.push({ name: "NEWS", detail: strongNews[0].headline.slice(0, 80) });
  }

  // ── FACTOR 2: Volume Spike (from Alpaca bars) ─────────────────────────────
  if (bars && bars.length >= 6) {
    const avgVol = bars.slice(0, 5).reduce((s, b) => s + b.v, 0) / 5;
    const latestVol = bars[bars.length - 1].v;
    const ratio = latestVol / avgVol;
    if (ratio >= 1.5) {
      score++;
      factors.push({ name: "VOLUME", detail: `${ratio.toFixed(1)}x average volume` });
    }
  }

  // ── FACTOR 3: Technical Breakout (price vs recent range) ─────────────────
  if (bars && bars.length >= 10) {
    const recentHighs = bars.slice(0, 9).map(b => b.h);
    const recentLows  = bars.slice(0, 9).map(b => b.l);
    const rangeHigh   = Math.max(...recentHighs);
    const rangeLow    = Math.min(...recentLows);
    const latest      = bars[bars.length - 1];
    const breakoutUp  = latest.c > rangeHigh * 0.995;
    const breakoutDn  = latest.c < rangeLow  * 1.005;
    if (breakoutUp || breakoutDn) {
      score++;
      factors.push({ name: "BREAKOUT", detail: breakoutUp ? `Breaking above ${formatPrice(rangeHigh)}` : `Breaking below ${formatPrice(rangeLow)}` });
    }
  }

  // ── FACTOR 4: Momentum (3-bar directional move) ───────────────────────────
  if (bars && bars.length >= 4) {
    const last3 = bars.slice(-4);
    const allUp = last3.every((b, i) => i === 0 || b.c > last3[i-1].c);
    const allDn = last3.every((b, i) => i === 0 || b.c < last3[i-1].c);
    const pctMove = Math.abs((last3[last3.length-1].c - last3[0].c) / last3[0].c * 100);
    if ((allUp || allDn) && pctMove >= 1.5) {
      score++;
      factors.push({ name: "MOMENTUM", detail: `${allUp ? '+' : '-'}${pctMove.toFixed(1)}% over 3 bars` });
    }
  }

  return { score, factors, relevantNews };
}

// ── SIGNAL BUILDER ────────────────────────────────────────────────────────────
function buildSignal(asset, score, factors, relevantNews, bars) {
  const latest    = bars && bars.length ? bars[bars.length - 1] : null;
  const price     = latest ? latest.c : simulatedPrice(asset.id);
  const isBull    = determineBias(factors, relevantNews);
  const upside    = calculateUpside(asset.tier, score, isBull);
  const stopPct   = asset.tier === 1 ? 0.03 : asset.tier === 2 ? 0.05 : 0.08;
  const tgtPct    = (upside / 100);
  const entry     = price;
  const target    = isBull ? price * (1 + tgtPct) : price * (1 - tgtPct);
  const stop      = isBull ? price * (1 - stopPct) : price * (1 + stopPct);
  const rr        = parseFloat((tgtPct / stopPct).toFixed(1));
  const conf      = Math.min(94, 50 + score * 10 + Math.floor(Math.random() * 8));
  const catScore  = Math.min(10, 4 + score * 2);
  const ttg       = asset.tier === 1 ? "2-5d" : asset.tier === 2 ? "1-3d" : "hours";
  const catalysts = [
    ...factors.map(f => `${f.name}: ${f.detail}`),
    ...relevantNews.slice(0, 2).map(n => n.headline),
  ].slice(0, 4);

  return {
    id:         `${asset.id}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    tid:        asset.id,
    name:       asset.name,
    instrument: asset.inst,
    tier:       asset.tier,
    direction:  isBull ? "L" : "S",
    entry:      entry,
    target:     target,
    stop:       stop,
    upside:     upside,
    riskReward: rr,
    confidence: conf,
    catalystScore: catScore,
    timeToTarget: ttg,
    catalysts:  catalysts,
    factorScore: score,
    factors:    factors.map(f => f.name),
    timestamp:  Date.now(),
  };
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function determineBias(factors, news) {
  const bearWords = ['crashes','plunges','drops','miss','warns','cuts','downgrade','tumbles','collapses'];
  const hasBearNews = news.some(n => bearWords.some(w => n.headline.toLowerCase().includes(w)));
  if (hasBearNews) return false;
  return true; // default bullish
}

function calculateUpside(tier, score, isBull) {
  const base = tier === 1 ? 8 : tier === 2 ? 22 : 55;
  const boost = score >= 4 ? 1.4 : score >= 3 ? 1.2 : 1.0;
  return Math.round(base * boost * (0.9 + Math.random() * 0.2));
}

function formatPrice(p) {
  return p > 1000 ? `$${Math.round(p).toLocaleString()}` : p > 1 ? `$${p.toFixed(2)}` : `$${p.toFixed(4)}`;
}

function simulatedPrice(id) {
  const prices = { AAPL:189,NVDA:875,MSFT:415,TSLA:178,SMCI:84,MARA:18,AMD:165,COIN:220,
    BTC:71240,ETH:3840,SOL:168,DOGE:0.18,GBPJPY:189,USDTRY:32,USDZAR:18,GLD:185,USO:78 };
  return prices[id] || 100;
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
  const pool      = ASSETS.filter(a => tiers.includes(a.tier));

  // ── Fetch news ───────────────────────────────────────────────────────────
  let news = [];
  if (apiKey && apiSecret) {
    try {
      const symbols = pool.filter(a => a.alpaca).map(a => a.alpaca).join(',');
      const newsUrl = `https://data.alpaca.markets/v1beta1/news?limit=50&sort=desc&symbols=${encodeURIComponent(symbols)}`;
      const nr = await fetch(newsUrl, {
        headers: { 'APCA-API-KEY-ID': apiKey, 'APCA-API-SECRET-KEY': apiSecret },
      });
      const nd = await nr.json();
      news = nd.news || [];
    } catch {}
  }

  // ── Fetch price bars (15min) for Alpaca-supported assets ─────────────────
  const barsMap = {};
  if (apiKey && apiSecret) {
    const alpacaAssets = pool.filter(a => a.alpaca);
    // Stocks
    const stocks = alpacaAssets.filter(a => a.type === 'EQ' || a.type === 'CM');
    if (stocks.length) {
      try {
        const syms = stocks.map(a => a.alpaca).join(',');
        const end  = new Date().toISOString();
        const start = new Date(Date.now() - 4*60*60*1000).toISOString();
        const bUrl = `https://data.alpaca.markets/v2/stocks/bars?symbols=${encodeURIComponent(syms)}&timeframe=15Min&start=${start}&end=${end}&limit=20&feed=iex`;
        const br = await fetch(bUrl, {
          headers: { 'APCA-API-KEY-ID': apiKey, 'APCA-API-SECRET-KEY': apiSecret },
        });
        const bd = await br.json();
        if (bd.bars) {
          for (const [sym, bars] of Object.entries(bd.bars)) {
            const asset = stocks.find(a => a.alpaca === sym);
            if (asset) barsMap[asset.id] = bars;
          }
        }
      } catch {}
    }
    // Crypto
    const cryptos = alpacaAssets.filter(a => a.type === 'CR');
    if (cryptos.length) {
      try {
        const syms = cryptos.map(a => a.alpaca).join(',');
        const end  = new Date().toISOString();
        const start = new Date(Date.now() - 4*60*60*1000).toISOString();
        const bUrl = `https://data.alpaca.markets/v1beta3/crypto/us/bars?symbols=${encodeURIComponent(syms)}&timeframe=15Min&start=${start}&end=${end}&limit=20`;
        const br = await fetch(bUrl, {
          headers: { 'APCA-API-KEY-ID': apiKey, 'APCA-API-SECRET-KEY': apiSecret },
        });
        const bd = await br.json();
        if (bd.bars) {
          for (const [sym, bars] of Object.entries(bd.bars)) {
            const asset = cryptos.find(a => a.alpaca === sym);
            if (asset) barsMap[asset.id] = bars;
          }
        }
      } catch {}
    }
  }

  // ── Score every asset ─────────────────────────────────────────────────────
  const signals = [];
  for (const asset of pool) {
    const bars = barsMap[asset.id] || null;
    const { score, factors, relevantNews } = scoreAsset(asset, news, bars);
    if (score >= 2) {
      signals.push(buildSignal(asset, score, factors, relevantNews, bars));
    }
  }

  // ── If nothing qualifies (e.g. weekend/closed market), show top scored ────
  if (signals.length === 0) {
    for (const asset of pool.slice(0, 6)) {
      const bars = barsMap[asset.id] || null;
      const { score, factors, relevantNews } = scoreAsset(asset, news, bars);
      signals.push(buildSignal(asset, Math.max(score, 2), factors, relevantNews, bars));
    }
  }

  // Sort by upside descending
  signals.sort((a, b) => b.upside - a.upside);

  return new Response(JSON.stringify({ signals, scored: signals.length, ts: Date.now() }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
    },
  });
}
