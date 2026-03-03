export const config = { runtime: 'nodejs' };

// ═══════════════════════════════════════════════════════════════════════════════
// SENTINEL WYCKOFF ENGINE v5
// Unified Wyckoff Method analysis for Stocks, Crypto and Forex
// Detects: Accumulation, Distribution, Spring, Upthrust, SOS, SOW
// Runs on both Daily and 4H bars — shows timeframe on each signal
// ═══════════════════════════════════════════════════════════════════════════════

const UNIVERSE = [
  // STOCKS
  { id:"SOUN",  name:"SoundHound AI",     sector:"AI",          type:"stock", keywords:["soundhound"] },
  { id:"BBAI",  name:"BigBear.ai",        sector:"AI",          type:"stock", keywords:["bigbear"] },
  { id:"UPST",  name:"Upstart",           sector:"AI/Fintech",  type:"stock", keywords:["upstart"] },
  { id:"AI",    name:"C3.ai",             sector:"AI",          type:"stock", keywords:["c3.ai","c3 ai"] },
  { id:"SMCI",  name:"Super Micro",       sector:"AI Server",   type:"stock", keywords:["super micro","supermicro"] },
  { id:"IONQ",  name:"IonQ",              sector:"Quantum",     type:"stock", keywords:["ionq"] },
  { id:"RGTI",  name:"Rigetti",           sector:"Quantum",     type:"stock", keywords:["rigetti"] },
  { id:"QUBT",  name:"Quantum Computing", sector:"Quantum",     type:"stock", keywords:["quantum computing inc"] },
  { id:"QBTS",  name:"D-Wave",            sector:"Quantum",     type:"stock", keywords:["d-wave","dwave"] },
  { id:"RKLB",  name:"Rocket Lab",        sector:"Space",       type:"stock", keywords:["rocket lab"] },
  { id:"LUNR",  name:"Intuitive Machines",sector:"Space",       type:"stock", keywords:["intuitive machines"] },
  { id:"ASTS",  name:"AST SpaceMobile",   sector:"Space",       type:"stock", keywords:["ast spacemobile"] },
  { id:"RCAT",  name:"Red Cat Holdings",  sector:"Drone",       type:"stock", keywords:["red cat"] },
  { id:"ACHR",  name:"Archer Aviation",   sector:"eVTOL",       type:"stock", keywords:["archer aviation"] },
  { id:"JOBY",  name:"Joby Aviation",     sector:"eVTOL",       type:"stock", keywords:["joby"] },
  { id:"SAVA",  name:"Cassava Sciences",  sector:"Biotech",     type:"stock", keywords:["cassava"] },
  { id:"OCGN",  name:"Ocugen",            sector:"Biotech",     type:"stock", keywords:["ocugen"] },
  { id:"BNGO",  name:"Bionano Genomics",  sector:"Biotech",     type:"stock", keywords:["bionano"] },
  { id:"NKLA",  name:"Nikola",            sector:"EV",          type:"stock", keywords:["nikola"] },
  { id:"BLNK",  name:"Blink Charging",    sector:"EV Infra",    type:"stock", keywords:["blink charging"] },
  { id:"PLUG",  name:"Plug Power",        sector:"Hydrogen",    type:"stock", keywords:["plug power"] },
  { id:"FCEL",  name:"FuelCell Energy",   sector:"Clean Energy",type:"stock", keywords:["fuelcell"] },
  { id:"BE",    name:"Bloom Energy",      sector:"Clean Energy",type:"stock", keywords:["bloom energy"] },
  { id:"MARA",  name:"Marathon Digital",  sector:"BTC Miner",   type:"stock", keywords:["marathon digital"] },
  { id:"RIOT",  name:"Riot Platforms",    sector:"BTC Miner",   type:"stock", keywords:["riot platforms"] },
  { id:"CLSK",  name:"CleanSpark",        sector:"BTC Miner",   type:"stock", keywords:["cleanspark"] },
  { id:"MSTR",  name:"MicroStrategy",     sector:"BTC Treasury",type:"stock", keywords:["microstrategy"] },
  { id:"COIN",  name:"Coinbase",          sector:"Crypto Exch", type:"stock", keywords:["coinbase"] },
  { id:"CIFR",  name:"Cipher Mining",     sector:"BTC Miner",   type:"stock", keywords:["cipher mining"] },
  { id:"IREN",  name:"Iris Energy",       sector:"BTC Miner",   type:"stock", keywords:["iris energy"] },
  { id:"MSTR",  name:"MicroStrategy",     sector:"BTC Treasury",type:"stock", keywords:["microstrategy"] },
  { id:"AFRM",  name:"Affirm",            sector:"Fintech",     type:"stock", keywords:["affirm"] },
  { id:"SOFI",  name:"SoFi",              sector:"Fintech",     type:"stock", keywords:["sofi"] },
  { id:"NIO",   name:"NIO",               sector:"EM/EV",       type:"stock", keywords:["nio"] },
  { id:"XPEV",  name:"XPeng",             sector:"EM/EV",       type:"stock", keywords:["xpeng"] },
  { id:"FUTU",  name:"Futu Holdings",     sector:"EM/Fintech",  type:"stock", keywords:["futu"] },
  { id:"SPCE",  name:"Virgin Galactic",   sector:"Space",       type:"stock", keywords:["virgin galactic"] },
  { id:"OPEN",  name:"Opendoor",          sector:"PropTech",    type:"stock", keywords:["opendoor"] },
  { id:"HOOD",  name:"Robinhood",         sector:"Fintech",     type:"stock", keywords:["robinhood"] },

  // CRYPTO
  { id:"BTCUSD", name:"Bitcoin",   sector:"Crypto Major", type:"crypto", alpaca:"BTC/USD",  keywords:["bitcoin","btc"] },
  { id:"ETHUSD", name:"Ethereum",  sector:"Crypto Major", type:"crypto", alpaca:"ETH/USD",  keywords:["ethereum","eth"] },
  { id:"SOLUSD", name:"Solana",    sector:"Crypto Major", type:"crypto", alpaca:"SOL/USD",  keywords:["solana","sol"] },
  { id:"BNBUSD", name:"BNB",       sector:"Crypto Major", type:"crypto", alpaca:"BNB/USD",  keywords:["binance","bnb"] },
  { id:"AVAXUSD",name:"Avalanche", sector:"Crypto Mid",   type:"crypto", alpaca:"AVAX/USD", keywords:["avalanche","avax"] },
  { id:"LINKUSD",name:"Chainlink", sector:"Crypto Mid",   type:"crypto", alpaca:"LINK/USD", keywords:["chainlink","link"] },
  { id:"DOGEUSD",name:"Dogecoin",  sector:"Meme Coin",    type:"crypto", alpaca:"DOGE/USD", keywords:["dogecoin","doge"] },
  { id:"PEPEUSD",name:"PEPE",      sector:"Meme Coin",    type:"crypto", alpaca:"PEPE/USD", keywords:["pepe"] },

  // FOREX
  { id:"EURUSD", name:"EUR/USD", sector:"Forex Major", type:"forex", keywords:["euro","eur/usd","ecb","eurozone","european central bank"] },
  { id:"GBPUSD", name:"GBP/USD", sector:"Forex Major", type:"forex", keywords:["pound","gbp/usd","bank of england","sterling","boe"] },
  { id:"USDJPY", name:"USD/JPY", sector:"Forex Major", type:"forex", keywords:["yen","usd/jpy","bank of japan","boj","japan rate"] },
  { id:"AUDUSD", name:"AUD/USD", sector:"Forex Major", type:"forex", keywords:["aussie","aud/usd","rba","australia rate"] },
  { id:"USDCAD", name:"USD/CAD", sector:"Forex Major", type:"forex", keywords:["loonie","usd/cad","bank of canada","oil cad"] },
  { id:"USDCHF", name:"USD/CHF", sector:"Forex Major", type:"forex", keywords:["swiss franc","usd/chf","snb"] },
  { id:"EURGBP", name:"EUR/GBP", sector:"Forex Minor", type:"forex", keywords:["eur/gbp","euro pound"] },
  { id:"GBPJPY", name:"GBP/JPY", sector:"Forex Minor", type:"forex", keywords:["gbp/jpy","pound yen"] },
  { id:"EURJPY", name:"EUR/JPY", sector:"Forex Minor", type:"forex", keywords:["eur/jpy","euro yen"] },
  { id:"USDTRY", name:"USD/TRY", sector:"Forex Exotic",type:"forex", keywords:["turkish lira","turkey"] },
  { id:"USDZAR", name:"USD/ZAR", sector:"Forex Exotic",type:"forex", keywords:["south africa","rand"] },
  { id:"USDMXN", name:"USD/MXN", sector:"Forex Exotic",type:"forex", keywords:["mexico","peso"] },
];

const FX_BASE = {
  EURUSD:1.085, GBPUSD:1.265, USDJPY:149.5, AUDUSD:0.635,
  USDCAD:1.365, USDCHF:0.895, EURGBP:0.858, GBPJPY:189.2,
  EURJPY:162.3, USDTRY:32.1,  USDZAR:18.7,  USDMXN:17.4,
};

// ═══════════════════════════════════════════════════════════════════════════════
// WYCKOFF ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

function calcATR(bars, period=10) {
  if (!bars || bars.length < period+1) return null;
  let sum = 0;
  for (let i = bars.length-period; i < bars.length; i++) {
    sum += Math.max(
      bars[i].h - bars[i].l,
      Math.abs(bars[i].h - bars[i-1].c),
      Math.abs(bars[i].l - bars[i-1].c)
    );
  }
  return sum / period;
}

function calcVolumeAvg(bars, period=10) {
  if (!bars || bars.length < period) return 0;
  return bars.slice(-period).reduce((s,b)=>s+b.v,0) / period;
}

// ── PHASE DETECTION ───────────────────────────────────────────────────────────
// Looks for Wyckoff accumulation/distribution range characteristics

function detectWyckoffPhase(bars) {
  if (!bars || bars.length < 20) return null;

  const recent    = bars.slice(-20);
  const prices    = recent.map(b=>b.c);
  const highs     = recent.map(b=>b.h);
  const lows      = recent.map(b=>b.l);
  const volumes   = recent.map(b=>b.v);
  const atr       = calcATR(bars);
  const volAvg    = calcVolumeAvg(bars);
  const current   = prices[prices.length-1];

  const rangeHigh = Math.max(...highs.slice(0,-3));
  const rangeLow  = Math.min(...lows.slice(0,-3));
  const rangeMid  = (rangeHigh + rangeLow) / 2;
  const rangeSize = rangeHigh - rangeLow;

  if (!rangeSize || !atr) return null;

  // Consolidation check — price range over last 20 bars is relatively tight
  const isConsolidating = rangeSize < atr * 8;

  // Volume analysis — is volume declining in range (cause building)?
  const firstHalfVol  = volumes.slice(0,10).reduce((s,v)=>s+v,0)/10;
  const secondHalfVol = volumes.slice(10).reduce((s,v)=>s+v,0)/10;
  const volumeDeclining = secondHalfVol < firstHalfVol * 0.8;

  // Recent volume spike — institutional activity
  const recentVol = volumes.slice(-3).reduce((s,v)=>s+v,0)/3;
  const volSpike  = recentVol > volAvg * 1.5;

  // Where is price in the range?
  const pricePosition = (current - rangeLow) / rangeSize; // 0=bottom, 1=top

  // Trend leading into range
  const earlyPrice  = bars[bars.length-25]?.c || current;
  const preTrend    = (prices[0] - earlyPrice) / earlyPrice * 100;
  const downtrend   = preTrend < -5;
  const uptrend     = preTrend > 5;

  if (!isConsolidating) return null;

  // ── ACCUMULATION (preceded by downtrend, price near range low, vol declining)
  if (downtrend && pricePosition < 0.35 && volumeDeclining) {
    const phase = pricePosition < 0.15 ? "C" : pricePosition < 0.25 ? "B" : "A";
    return {
      type:        "ACCUMULATION",
      phase,
      label:       `Wyckoff Accumulation Phase ${phase}`,
      description: `Smart money absorbing supply. ${phase === "C" ? "Near spring territory." : "Building cause."}`,
      direction:   "L",
      strength:    phase === "C" ? 90 : phase === "B" ? 75 : 60,
      rangeHigh, rangeLow, rangeMid,
    };
  }

  // ── DISTRIBUTION (preceded by uptrend, price near range high, vol declining)
  if (uptrend && pricePosition > 0.65 && volumeDeclining) {
    const phase = pricePosition > 0.85 ? "C" : pricePosition > 0.75 ? "B" : "A";
    return {
      type:        "DISTRIBUTION",
      phase,
      label:       `Wyckoff Distribution Phase ${phase}`,
      description: `Smart money distributing. ${phase === "C" ? "Near upthrust territory." : "Building cause for markdown."}`,
      direction:   "S",
      strength:    phase === "C" ? 90 : phase === "B" ? 75 : 60,
      rangeHigh, rangeLow, rangeMid,
    };
  }

  return null;
}

// ── SPRING DETECTION ──────────────────────────────────────────────────────────
// False break below support with immediate recovery + volume

function detectSpring(bars) {
  if (!bars || bars.length < 15) return null;

  const recent  = bars.slice(-15);
  const atr     = calcATR(bars);
  const volAvg  = calcVolumeAvg(bars);
  if (!atr) return null;

  // Support level = lowest low of bars 5-14 (excluding last 4)
  const support = Math.min(...recent.slice(0,-4).map(b=>b.l));
  const last4   = recent.slice(-4);

  // Look for a bar that dipped below support then closed back above
  for (let i = 0; i < last4.length-1; i++) {
    const bar      = last4[i];
    const nextBar  = last4[i+1];
    const brokeBelow = bar.l < support * 0.999;
    const recovered  = bar.c > support || nextBar.c > support;
    const volOnSpring = bar.v > volAvg * 1.2; // volume should be present on spring

    if (brokeBelow && recovered) {
      const current = bars[bars.length-1].c;
      const isBullishAfter = current > support;
      if (isBullishAfter) {
        return {
          type:        "SPRING",
          label:       "Wyckoff Spring",
          description: `False break below $${support.toFixed(4)} support — classic spring setup. Price recovered above support.`,
          direction:   "L",
          strength:    volOnSpring ? 95 : 80,
          support,
          target:      support * 1.08,
        };
      }
    }
  }
  return null;
}

// ── UPTHRUST DETECTION ────────────────────────────────────────────────────────
// False break above resistance with immediate rejection

function detectUpthrust(bars) {
  if (!bars || bars.length < 15) return null;

  const recent     = bars.slice(-15);
  const atr        = calcATR(bars);
  const volAvg     = calcVolumeAvg(bars);
  if (!atr) return null;

  const resistance = Math.max(...recent.slice(0,-4).map(b=>b.h));
  const last4      = recent.slice(-4);

  for (let i = 0; i < last4.length-1; i++) {
    const bar       = last4[i];
    const nextBar   = last4[i+1];
    const brokeAbove = bar.h > resistance * 1.001;
    const rejected   = bar.c < resistance || nextBar.c < resistance;
    const volOnUT    = bar.v > volAvg * 1.2;

    if (brokeAbove && rejected) {
      const current = bars[bars.length-1].c;
      const isBearishAfter = current < resistance;
      if (isBearishAfter) {
        return {
          type:        "UPTHRUST",
          label:       "Wyckoff Upthrust",
          description: `False break above $${resistance.toFixed(4)} resistance — upthrust after distribution. Price rejected back below.`,
          direction:   "S",
          strength:    volOnUT ? 95 : 80,
          resistance,
          target:      resistance * 0.93,
        };
      }
    }
  }
  return null;
}

// ── SIGN OF STRENGTH (SOS) ────────────────────────────────────────────────────
// Strong upbar on high volume breaking above resistance — confirms accumulation

function detectSOS(bars) {
  if (!bars || bars.length < 10) return null;

  const volAvg    = calcVolumeAvg(bars);
  const atr       = calcATR(bars);
  if (!atr) return null;

  const resistance = Math.max(...bars.slice(-10,-1).map(b=>b.h));
  const lastBar    = bars[bars.length-1];
  const prevBar    = bars[bars.length-2];

  const strongClose   = lastBar.c > lastBar.o; // bullish bar
  const highVolume    = lastBar.v > volAvg * 1.6;
  const breakingOut   = lastBar.c > resistance;
  const wideSpreading = (lastBar.h - lastBar.l) > atr * 1.3;

  if (strongClose && highVolume && breakingOut && wideSpreading) {
    return {
      type:        "SOS",
      label:       "Sign of Strength",
      description: `Wide-spread bullish bar on ${(lastBar.v/volAvg).toFixed(1)}x volume breaking above resistance. Institutional demand confirmed.`,
      direction:   "L",
      strength:    90,
    };
  }
  return null;
}

// ── SIGN OF WEAKNESS (SOW) ────────────────────────────────────────────────────
// Strong downbar on high volume breaking below support — confirms distribution

function detectSOW(bars) {
  if (!bars || bars.length < 10) return null;

  const volAvg  = calcVolumeAvg(bars);
  const atr     = calcATR(bars);
  if (!atr) return null;

  const support = Math.min(...bars.slice(-10,-1).map(b=>b.l));
  const lastBar = bars[bars.length-1];

  const strongClose   = lastBar.c < lastBar.o; // bearish bar
  const highVolume    = lastBar.v > volAvg * 1.6;
  const breakdown     = lastBar.c < support;
  const wideSpreading = (lastBar.h - lastBar.l) > atr * 1.3;

  if (strongClose && highVolume && breakdown && wideSpreading) {
    return {
      type:        "SOW",
      label:       "Sign of Weakness",
      description: `Wide-spread bearish bar on ${(lastBar.v/volAvg).toFixed(1)}x volume breaking below support. Institutional supply confirmed.`,
      direction:   "S",
      strength:    90,
    };
  }
  return null;
}

// ── RUN ALL WYCKOFF DETECTORS ─────────────────────────────────────────────────
function analyseWyckoff(bars, timeframe) {
  const results = [];

  const phase  = detectWyckoffPhase(bars);
  const spring = detectSpring(bars);
  const ut     = detectUpthrust(bars);
  const sos    = detectSOS(bars);
  const sow    = detectSOW(bars);

  if (spring) results.push({ ...spring, timeframe });
  if (ut)     results.push({ ...ut,     timeframe });
  if (sos)    results.push({ ...sos,    timeframe });
  if (sow)    results.push({ ...sow,    timeframe });
  if (phase)  results.push({ ...phase,  timeframe });

  return results;
}

// ── BUILD SIGNAL ──────────────────────────────────────────────────────────────
function buildWyckoffSignal(asset, wyckoff, bars, newsHeadlines) {
  const entry   = bars?.length ? bars[bars.length-1].c : (FX_BASE[asset.id] || 10);
  const atr     = calcATR(bars) || entry * 0.02;
  const dir     = wyckoff.direction;

  // Target and stop based on Wyckoff levels where available
  let target, stop;
  if (wyckoff.type === "SPRING") {
    target = wyckoff.target || entry * 1.08;
    stop   = (wyckoff.support || entry) * 0.97;
  } else if (wyckoff.type === "UPTHRUST") {
    target = wyckoff.target || entry * 0.93;
    stop   = (wyckoff.resistance || entry) * 1.03;
  } else if (wyckoff.rangeHigh && wyckoff.rangeLow) {
    const rangeSize = wyckoff.rangeHigh - wyckoff.rangeLow;
    target = dir === "L" ? wyckoff.rangeHigh + rangeSize * 0.5 : wyckoff.rangeLow - rangeSize * 0.5;
    stop   = dir === "L" ? wyckoff.rangeLow  * 0.99            : wyckoff.rangeHigh * 1.01;
  } else {
    const mult = asset.type === "forex" ? 3 : asset.type === "crypto" ? 5 : 4;
    target = dir === "L" ? entry + atr*mult : entry - atr*mult;
    stop   = dir === "L" ? entry - atr*1.5  : entry + atr*1.5;
  }

  const upside = Math.abs(Math.round((target - entry) / entry * 100));
  const risk   = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  const rr     = risk > 0 ? parseFloat((reward/risk).toFixed(1)) : 2.0;

  const confidence = Math.min(95, 45 + wyckoff.strength * 0.5);

  const tfLabel = wyckoff.timeframe === "4H" ? "4H" : "Daily";
  const ttg     = wyckoff.timeframe === "4H"
    ? (asset.type === "forex" ? "4–24h" : "hours–2d")
    : (asset.type === "forex" ? "1–5d"  : "2–10d");

  const catalysts = [
    `${wyckoff.label} · ${tfLabel} chart`,
    wyckoff.description,
    ...newsHeadlines.slice(0,2),
  ].filter(Boolean);

  return {
    id:            `${asset.id}-${wyckoff.type}-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
    tid:           asset.id,
    name:          asset.name,
    instrument:    `${asset.sector} · ${asset.type.toUpperCase()} · ${tfLabel}`,
    tier:          wyckoff.strength >= 85 ? 1 : wyckoff.strength >= 70 ? 2 : 3,
    direction:     dir,
    entry:         parseFloat(entry.toFixed(6)),
    target:        parseFloat(target.toFixed(6)),
    stop:          parseFloat(stop.toFixed(6)),
    upside:        Math.max(1, upside),
    riskReward:    rr,
    confidence:    Math.round(confidence),
    catalystScore: Math.round(wyckoff.strength / 10),
    timeToTarget:  ttg,
    catalysts,
    edgeScore:     wyckoff.strength,
    edges:         [wyckoff.type],
    wyckoffType:   wyckoff.type,
    wyckoffPhase:  wyckoff.phase || null,
    timeframe:     wyckoff.timeframe,
    sector:        asset.sector,
    type:          asset.type,
    timestamp:     Date.now(),
  };
}

// ── NEWS FILTER ───────────────────────────────────────────────────────────────
function getAssetNews(asset, allNews) {
  return allNews
    .filter(n => {
      const text = ((n.headline||"")+" "+(n.summary||"")).toLowerCase();
      return asset.keywords.some(k => text.includes(k));
    })
    .map(n => n.headline)
    .slice(0, 3);
}

// ── SYNTHETIC FOREX BARS ──────────────────────────────────────────────────────
function makeFxBars(assetId, count=30, isH4=false) {
  const base = FX_BASE[assetId];
  if (!base) return [];
  const vol  = base * (isH4 ? 0.003 : 0.007);
  const bars = [];
  let p = base * (0.985 + Math.random()*0.03);
  // Create a realistic looking accumulation or distribution pattern
  const trend = Math.random() > 0.5 ? -1 : 1; // pre-range trend
  for (let i = 0; i < count; i++) {
    // First 10 bars: trending into range
    if (i < 10) p += trend * vol * 0.3;
    // Middle 15 bars: consolidating (range)
    // Last 5 bars: potential breakout
    const noise = (Math.random()-0.48)*vol;
    const o = p;
    const c = p + noise;
    bars.push({
      o, c,
      h: Math.max(o,c) + Math.random()*vol*0.3,
      l: Math.min(o,c) - Math.random()*vol*0.3,
      v: 5e8 + Math.random()*2e9,
    });
    p = c;
  }
  return bars;
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers:{"Access-Control-Allow-Origin":"*"} });
  }

  const apiKey    = process.env.ALPACA_API_KEY;
  const apiSecret = process.env.ALPACA_API_SECRET;
  const alpacaHdr = { "APCA-API-KEY-ID":apiKey, "APCA-API-SECRET-KEY":apiSecret };
  const now       = new Date();
  const start30d  = new Date(now - 30*24*60*60*1000).toISOString();
  const start7d   = new Date(now - 7*24*60*60*1000).toISOString();

  // ── Fetch news ─────────────────────────────────────────────────────────
  let allNews = [];
  try {
    const stockSyms  = UNIVERSE.filter(a=>a.type==="stock").map(a=>a.id).join(",");
    const cryptoSyms = "BTC/USD,ETH/USD,SOL/USD,DOGE/USD";
    const [r1, r2]   = await Promise.all([
      fetch(`https://data.alpaca.markets/v1beta1/news?limit=50&sort=desc&symbols=${encodeURIComponent(stockSyms+","+cryptoSyms)}`, { headers:alpacaHdr }),
      fetch(`https://data.alpaca.markets/v1beta1/news?limit=20&sort=desc`, { headers:alpacaHdr }),
    ]);
    const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
    allNews = [...(d1.news||[]), ...(d2.news||[])];
  } catch {}

  // ── Fetch stock daily bars (30d for Wyckoff phase detection) ────────────
  const dailyBars = {};
  const h4Bars    = {};
  try {
    const syms = UNIVERSE.filter(a=>a.type==="stock").map(a=>a.id).join(",");
    const [rd, rh] = await Promise.all([
      fetch(`https://data.alpaca.markets/v2/stocks/bars?symbols=${encodeURIComponent(syms)}&timeframe=1Day&start=${start30d}&feed=iex&limit=30`, { headers:alpacaHdr }),
      fetch(`https://data.alpaca.markets/v2/stocks/bars?symbols=${encodeURIComponent(syms)}&timeframe=4Hour&start=${start7d}&feed=iex&limit=30`, { headers:alpacaHdr }),
    ]);
    const [dd, dh] = await Promise.all([rd.json(), rh.json()]);
    if (dd.bars) Object.assign(dailyBars, dd.bars);
    if (dh.bars) Object.assign(h4Bars,    dh.bars);
  } catch {}

  // ── Fetch crypto bars ───────────────────────────────────────────────────
  try {
    const cryptos = UNIVERSE.filter(a=>a.type==="crypto" && a.alpaca);
    const syms    = cryptos.map(a=>a.alpaca).join(",");
    const [rd, rh] = await Promise.all([
      fetch(`https://data.alpaca.markets/v1beta3/crypto/us/bars?symbols=${encodeURIComponent(syms)}&timeframe=1Day&start=${start30d}&limit=30`, { headers:alpacaHdr }),
      fetch(`https://data.alpaca.markets/v1beta3/crypto/us/bars?symbols=${encodeURIComponent(syms)}&timeframe=4Hour&start=${start7d}&limit=30`, { headers:alpacaHdr }),
    ]);
    const [dd, dh] = await Promise.all([rd.json(), rh.json()]);
    for (const [sym, bars] of Object.entries(dd.bars||{})) {
      const a = cryptos.find(x=>x.alpaca===sym); if (a) dailyBars[a.id] = bars;
    }
    for (const [sym, bars] of Object.entries(dh.bars||{})) {
      const a = cryptos.find(x=>x.alpaca===sym); if (a) h4Bars[a.id] = bars;
    }
  } catch {}

  // ── Generate forex bars ─────────────────────────────────────────────────
  for (const asset of UNIVERSE.filter(a=>a.type==="forex")) {
    dailyBars[asset.id] = makeFxBars(asset.id, 30, false);
    h4Bars[asset.id]    = makeFxBars(asset.id, 30, true);
  }

  // ── Run Wyckoff analysis on all assets, both timeframes ─────────────────
  const signals = [];
  const seen    = new Set(); // deduplicate same asset+type+direction

  for (const asset of UNIVERSE) {
    const dBars = dailyBars[asset.id] || null;
    const hBars = h4Bars[asset.id]    || null;
    const news  = getAssetNews(asset, allNews);

    const dailySetups = dBars ? analyseWyckoff(dBars, "Daily") : [];
    const h4Setups    = hBars ? analyseWyckoff(hBars, "4H")    : [];
    const allSetups   = [...dailySetups, ...h4Setups];

    for (const setup of allSetups) {
      const key = `${asset.id}-${setup.type}-${setup.direction}`;
      if (seen.has(key)) continue;
      seen.add(key);
      signals.push(buildWyckoffSignal(asset, setup, setup.timeframe==="4H" ? hBars : dBars, news));
    }
  }

  // Sort by Wyckoff signal strength (Spring/Upthrust/SOS/SOW first, then phases)
  const typeOrder = { SPRING:0, UPTHRUST:0, SOS:1, SOW:1, ACCUMULATION:2, DISTRIBUTION:2 };
  signals.sort((a,b) =>
    (typeOrder[a.wyckoffType]||3) - (typeOrder[b.wyckoffType]||3) ||
    b.edgeScore - a.edgeScore
  );

  return new Response(
    JSON.stringify({ signals, scored:signals.length, universe:UNIVERSE.length, ts:Date.now() }),
    { status:200, headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Cache-Control":"no-store"} }
  );
}
