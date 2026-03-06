// ═══════════════════════════════════════════════════════════════════════════════
// SENTINEL SIGNAL ENGINE v7
// Theory: Wyckoff Method + Elliott Wave + RSI Divergence
//
// Signal fires when 2 or more of the following align:
//   1. Wyckoff: Spring / Upthrust / SOS / SOW / Accumulation / Distribution phase
//   2. Elliott Wave: 5-wave impulse count detected (wave 3 or wave 5 entry)
//   3. RSI Divergence: Bullish or bearish divergence on RSI(14)
//
// Runs on Daily + 4H synthetic bars for all asset types
// All assets: Stocks, Crypto, Forex — mixed feed ranked by signal strength
// ═══════════════════════════════════════════════════════════════════════════════

const UNIVERSE = [
  // ── CRYPTO ────────────────────────────────────────────────────────────────
  { id:"BTCUSD",  name:"Bitcoin",           sector:"Crypto Major",  type:"crypto", vol:0.04,   base:87000   },
  { id:"ETHUSD",  name:"Ethereum",          sector:"Crypto Major",  type:"crypto", vol:0.05,   base:2100    },
  { id:"SOLUSD",  name:"Solana",            sector:"Crypto Major",  type:"crypto", vol:0.06,   base:138     },
  { id:"BNBUSD",  name:"BNB",               sector:"Crypto Major",  type:"crypto", vol:0.035,  base:605     },
  { id:"XRPUSD",  name:"XRP",               sector:"Crypto Major",  type:"crypto", vol:0.07,   base:2.45    },
  { id:"ADAUSD",  name:"Cardano",           sector:"Crypto Mid",    type:"crypto", vol:0.07,   base:0.82    },
  { id:"AVAXUSD", name:"Avalanche",         sector:"Crypto Mid",    type:"crypto", vol:0.07,   base:21      },
  { id:"LINKUSD", name:"Chainlink",         sector:"Crypto Mid",    type:"crypto", vol:0.065,  base:13.5    },
  { id:"DOGEUSD", name:"Dogecoin",          sector:"Meme Coin",     type:"crypto", vol:0.08,   base:0.185   },
  { id:"SHIBAUSD",name:"Shiba Inu",         sector:"Meme Coin",     type:"crypto", vol:0.10,   base:0.0000138 },
  { id:"PEPEUSD", name:"PEPE",              sector:"Meme Coin",     type:"crypto", vol:0.12,   base:0.0000105 },
  { id:"SUIUSD",  name:"SUI",               sector:"Crypto Mid",    type:"crypto", vol:0.08,   base:2.85    },

  // ── FOREX ─────────────────────────────────────────────────────────────────
  { id:"EURUSD",  name:"EUR/USD",           sector:"Forex Major",   type:"forex",  vol:0.006,  base:1.0820  },
  { id:"GBPUSD",  name:"GBP/USD",           sector:"Forex Major",   type:"forex",  vol:0.007,  base:1.2940  },
  { id:"USDJPY",  name:"USD/JPY",           sector:"Forex Major",   type:"forex",  vol:0.007,  base:148.50  },
  { id:"AUDUSD",  name:"AUD/USD",           sector:"Forex Major",   type:"forex",  vol:0.006,  base:0.6290  },
  { id:"USDCAD",  name:"USD/CAD",           sector:"Forex Major",   type:"forex",  vol:0.005,  base:1.4420  },
  { id:"USDCHF",  name:"USD/CHF",           sector:"Forex Major",   type:"forex",  vol:0.005,  base:0.8960  },
  { id:"NZDUSD",  name:"NZD/USD",           sector:"Forex Major",   type:"forex",  vol:0.006,  base:0.5700  },
  { id:"GBPJPY",  name:"GBP/JPY",           sector:"Forex Minor",   type:"forex",  vol:0.009,  base:192.10  },
  { id:"EURGBP",  name:"EUR/GBP",           sector:"Forex Minor",   type:"forex",  vol:0.005,  base:0.8360  },
  { id:"EURJPY",  name:"EUR/JPY",           sector:"Forex Minor",   type:"forex",  vol:0.008,  base:160.50  },
  { id:"CADJPY",  name:"CAD/JPY",           sector:"Forex Minor",   type:"forex",  vol:0.007,  base:102.90  },
  { id:"USDTRY",  name:"USD/TRY",           sector:"Forex Exotic",  type:"forex",  vol:0.015,  base:44.00   },
  { id:"USDZAR",  name:"USD/ZAR",           sector:"Forex Exotic",  type:"forex",  vol:0.012,  base:18.50   },
  { id:"USDMXN",  name:"USD/MXN",           sector:"Forex Exotic",  type:"forex",  vol:0.010,  base:20.40   },

  // ── MEGA CAP / INDEX ──────────────────────────────────────────────────────
  { id:"SPY",     name:"S&P 500 ETF",       sector:"Index",         type:"stock",  vol:0.012,  base:565     },
  { id:"QQQ",     name:"Nasdaq ETF",        sector:"Index",         type:"stock",  vol:0.015,  base:475     },
  { id:"AAPL",    name:"Apple",             sector:"Mega Cap",      type:"stock",  vol:0.02,   base:220     },
  { id:"MSFT",    name:"Microsoft",         sector:"Mega Cap",      type:"stock",  vol:0.02,   base:415     },
  { id:"AMZN",    name:"Amazon",            sector:"Mega Cap",      type:"stock",  vol:0.025,  base:210     },
  { id:"META",    name:"Meta",              sector:"Mega Cap",      type:"stock",  vol:0.025,  base:620     },
  { id:"GOOGL",   name:"Alphabet",          sector:"Mega Cap",      type:"stock",  vol:0.02,   base:178     },

  // ── HIGH VOLUME DAY TRADE STOCKS ──────────────────────────────────────────
  { id:"NVDA",    name:"Nvidia",            sector:"AI/Semis",      type:"stock",  vol:0.04,   base:118     },
  { id:"AMD",     name:"AMD",               sector:"AI/Semis",      type:"stock",  vol:0.04,   base:102     },
  { id:"TSLA",    name:"Tesla",             sector:"EV",            type:"stock",  vol:0.05,   base:285     },
  { id:"PLTR",    name:"Palantir",          sector:"AI/Defense",    type:"stock",  vol:0.05,   base:82      },
  { id:"COIN",    name:"Coinbase",          sector:"Crypto Exch",   type:"stock",  vol:0.05,   base:205     },
  { id:"MSTR",    name:"MicroStrategy",     sector:"BTC Treasury",  type:"stock",  vol:0.06,   base:295     },
  { id:"MARA",    name:"Marathon Digital",  sector:"BTC Miner",     type:"stock",  vol:0.08,   base:14.80   },
  { id:"RIOT",    name:"Riot Platforms",    sector:"BTC Miner",     type:"stock",  vol:0.07,   base:8.50    },
  { id:"HOOD",    name:"Robinhood",         sector:"Fintech",       type:"stock",  vol:0.06,   base:38      },
  { id:"SOFI",    name:"SoFi",              sector:"Fintech",       type:"stock",  vol:0.06,   base:11.20   },
  { id:"AFRM",    name:"Affirm",            sector:"Fintech",       type:"stock",  vol:0.07,   base:44      },
  { id:"UPST",    name:"Upstart",           sector:"AI/Fintech",    type:"stock",  vol:0.07,   base:52      },

  // ── SPECULATIVE / HIGH BETA ───────────────────────────────────────────────
  { id:"IONQ",    name:"IonQ",              sector:"Quantum",       type:"stock",  vol:0.07,   base:28.50   },
  { id:"RGTI",    name:"Rigetti",           sector:"Quantum",       type:"stock",  vol:0.08,   base:9.80    },
  { id:"QBTS",    name:"D-Wave",            sector:"Quantum",       type:"stock",  vol:0.08,   base:18.80   },
  { id:"QUBT",    name:"Quantum Computing", sector:"Quantum",       type:"stock",  vol:0.09,   base:6.20    },
  { id:"RKLB",    name:"Rocket Lab",        sector:"Space",         type:"stock",  vol:0.06,   base:22.10   },
  { id:"ASTS",    name:"AST SpaceMobile",   sector:"Space",         type:"stock",  vol:0.07,   base:18.60   },
  { id:"LUNR",    name:"Intuitive Machines",sector:"Space",         type:"stock",  vol:0.08,   base:7.20    },
  { id:"ACHR",    name:"Archer Aviation",   sector:"eVTOL",         type:"stock",  vol:0.07,   base:7.40    },
  { id:"SOUN",    name:"SoundHound AI",     sector:"AI",            type:"stock",  vol:0.09,   base:7.90    },
  { id:"BBAI",    name:"BigBear.ai",        sector:"AI",            type:"stock",  vol:0.08,   base:1.65    },
  { id:"SMCI",    name:"Super Micro",       sector:"AI Server",     type:"stock",  vol:0.06,   base:38      },
  { id:"NIO",     name:"NIO",               sector:"EM/EV",         type:"stock",  vol:0.07,   base:3.90    },
  { id:"PLUG",    name:"Plug Power",        sector:"Hydrogen",      type:"stock",  vol:0.06,   base:1.95    },
  { id:"SAVA",    name:"Cassava Sciences",  sector:"Biotech",       type:"stock",  vol:0.09,   base:3.80    },
];


// ═══════════════════════════════════════════════════════════════════════════════
// PRICE PRECISION
// Formats prices correctly per asset type
// ═══════════════════════════════════════════════════════════════════════════════
function pricePrecision(price, type) {
  if (type === "forex") return parseFloat(price.toFixed(5));
  if (type === "crypto") {
    if (price < 0.0001)  return parseFloat(price.toFixed(10));
    if (price < 0.01)    return parseFloat(price.toFixed(8));
    if (price < 1)       return parseFloat(price.toFixed(6));
    if (price < 100)     return parseFloat(price.toFixed(4));
    return parseFloat(price.toFixed(2));
  }
  return parseFloat(price.toFixed(2)); // stocks
}

// ═══════════════════════════════════════════════════════════════════════════════
// BAR GENERATOR
// Produces realistic OHLCV bars in one of 6 Wyckoff/Elliott-compatible patterns
// ═══════════════════════════════════════════════════════════════════════════════

function makeBars(base, volPct, count = 30) {
  const patterns = ["accumulation", "distribution", "spring", "upthrust", "impulse_up", "impulse_down"];
  const pattern  = patterns[Math.floor(Math.random() * patterns.length)];
  const bars     = [];
  let p          = base * (0.97 + Math.random() * 0.06);
  const vol      = base * volPct;

  for (let i = 0; i < count; i++) {
    const phase = i / count;
    let drift   = 0;
    let volMult = 1;

    switch (pattern) {
      case "accumulation":
        // Downtrend → tight range → early markup
        if (phase < 0.30) { drift = -vol * 0.35; volMult = 1.4; }
        else if (phase < 0.75) { drift = (Math.random() - 0.5) * vol * 0.2; volMult = 0.6; }
        else { drift = vol * 0.25; volMult = 1.8; }
        break;
      case "distribution":
        // Uptrend → tight range → early markdown
        if (phase < 0.30) { drift = vol * 0.35; volMult = 1.4; }
        else if (phase < 0.75) { drift = (Math.random() - 0.5) * vol * 0.2; volMult = 0.6; }
        else { drift = -vol * 0.25; volMult = 1.8; }
        break;
      case "spring":
        // Range → sudden dip below support → sharp recovery
        if (phase < 0.55) { drift = (Math.random() - 0.5) * vol * 0.25; volMult = 0.7; }
        else if (phase < 0.70) { drift = -vol * 1.4; volMult = 2.5; }
        else { drift = vol * 0.9; volMult = 2.0; }
        break;
      case "upthrust":
        // Range → sudden spike above resistance → sharp rejection
        if (phase < 0.55) { drift = (Math.random() - 0.5) * vol * 0.25; volMult = 0.7; }
        else if (phase < 0.70) { drift = vol * 1.4; volMult = 2.5; }
        else { drift = -vol * 0.9; volMult = 2.0; }
        break;
      case "impulse_up":
        // Classic 5-wave Elliott impulse upward
        if (phase < 0.18) { drift = vol * 0.8;  volMult = 1.8; } // wave 1
        else if (phase < 0.30) { drift = -vol * 0.4; volMult = 0.9; } // wave 2
        else if (phase < 0.55) { drift = vol * 1.2;  volMult = 2.2; } // wave 3 (strongest)
        else if (phase < 0.68) { drift = -vol * 0.3; volMult = 0.8; } // wave 4
        else { drift = vol * 0.6;  volMult = 1.4; } // wave 5
        break;
      case "impulse_down":
        // Classic 5-wave Elliott impulse downward
        if (phase < 0.18) { drift = -vol * 0.8;  volMult = 1.8; }
        else if (phase < 0.30) { drift = vol * 0.4;  volMult = 0.9; }
        else if (phase < 0.55) { drift = -vol * 1.2;  volMult = 2.2; }
        else if (phase < 0.68) { drift = vol * 0.3;  volMult = 0.8; }
        else { drift = -vol * 0.6;  volMult = 1.4; }
        break;
    }

    const noise  = (Math.random() - 0.5) * vol * 0.3;
    const floor  = base * 0.3; // price can never go below 30% of base
    const o      = p;
    const c      = Math.max(floor, p + drift + noise);
    const spread = (Math.abs(drift) + vol * 0.2);

    bars.push({
      o, c,
      h: Math.max(o, c) + spread * (0.1 + Math.random() * 0.3),
      l: Math.max(floor * 0.95, Math.min(o, c) - spread * (0.1 + Math.random() * 0.3)),
      v: (1e6 + Math.random() * 1e7) * volMult,
      pattern,
    });
    p = c;
  }
  return bars;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INDICATOR HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function calcRSI(bars, period = 14) {
  if (bars.length < period + 1) return [];
  const rsi = new Array(period).fill(null);
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const d = bars[i].c - bars[i - 1].c;
    d > 0 ? (gains += d) : (losses -= d);
  }
  let avgGain = gains / period, avgLoss = losses / period;
  rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  for (let i = period + 1; i < bars.length; i++) {
    const d = bars[i].c - bars[i - 1].c;
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
    rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  }
  return rsi;
}

function calcATR(bars, period = 10) {
  if (bars.length < period + 1) return null;
  let sum = 0;
  for (let i = bars.length - period; i < bars.length; i++) {
    sum += Math.max(
      bars[i].h - bars[i].l,
      Math.abs(bars[i].h - bars[i - 1].c),
      Math.abs(bars[i].l - bars[i - 1].c)
    );
  }
  return sum / period;
}

function volAvg(bars, period = 10) {
  if (bars.length < period) return 1;
  return bars.slice(-period).reduce((s, b) => s + b.v, 0) / period;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THEORY 1: WYCKOFF
// ═══════════════════════════════════════════════════════════════════════════════

function wyckoffAnalysis(bars) {
  const results = [];
  if (!bars || bars.length < 20) return results;

  const atr  = calcATR(bars);
  const vAvg = volAvg(bars);
  if (!atr) return results;

  const last  = bars[bars.length - 1];
  const prev4 = bars.slice(-5, -1);

  // ── SPRING ─────────────────────────────────────────────────────────────────
  const support = Math.min(...bars.slice(-20, -5).map(b => b.l));
  for (let i = 0; i < prev4.length - 1; i++) {
    if (prev4[i].l < support * 0.999 &&
        (prev4[i].c > support || prev4[i + 1]?.c > support) &&
        last.c > support) {
      results.push({
        theory:    "Wyckoff",
        setup:     "Spring",
        direction: "L",
        strength:  92,
        detail:    `False breakdown below ${support.toFixed(4)} — price snapped back. Spring before markup.`,
      });
    }
  }

  // ── UPTHRUST ───────────────────────────────────────────────────────────────
  const resistance = Math.max(...bars.slice(-20, -5).map(b => b.h));
  for (let i = 0; i < prev4.length - 1; i++) {
    if (prev4[i].h > resistance * 1.001 &&
        (prev4[i].c < resistance || prev4[i + 1]?.c < resistance) &&
        last.c < resistance) {
      results.push({
        theory:    "Wyckoff",
        setup:     "Upthrust",
        direction: "S",
        strength:  92,
        detail:    `False breakout above ${resistance.toFixed(4)} — rejected back into range. Distribution upthrust.`,
      });
    }
  }

  // ── SIGN OF STRENGTH ───────────────────────────────────────────────────────
  const res10 = Math.max(...bars.slice(-11, -1).map(b => b.h));
  if (last.c > last.o &&
      last.v > vAvg * 1.5 &&
      last.c > res10 &&
      (last.h - last.l) > atr * 1.1) {
    results.push({
      theory:    "Wyckoff",
      setup:     "Sign of Strength",
      direction: "L",
      strength:  88,
      detail:    `Wide bullish bar on ${(last.v / vAvg).toFixed(1)}x avg volume. Institutional demand breaking resistance.`,
    });
  }

  // ── SIGN OF WEAKNESS ──────────────────────────────────────────────────────
  const sup10 = Math.min(...bars.slice(-11, -1).map(b => b.l));
  if (last.c < last.o &&
      last.v > vAvg * 1.5 &&
      last.c < sup10 &&
      (last.h - last.l) > atr * 1.1) {
    results.push({
      theory:    "Wyckoff",
      setup:     "Sign of Weakness",
      direction: "S",
      strength:  88,
      detail:    `Wide bearish bar on ${(last.v / vAvg).toFixed(1)}x avg volume. Institutional supply breaking support.`,
    });
  }

  // ── ACCUMULATION PHASE ────────────────────────────────────────────────────
  const rH = Math.max(...bars.slice(-20).map(b => b.h));
  const rL = Math.min(...bars.slice(-20).map(b => b.l));
  const rSz = rH - rL;
  if (rSz > 0 && rSz < atr * 10) {
    const pos       = (last.c - rL) / rSz;
    const vFirst    = bars.slice(-20, -10).reduce((s, b) => s + b.v, 0) / 10;
    const vSecond   = bars.slice(-10).reduce((s, b) => s + b.v, 0) / 10;
    const volDec    = vSecond < vFirst * 0.82;
    const priceArr  = bars.slice(-20).map(b => b.c);
    const preTrend  = (priceArr[0] - (bars[bars.length - 22]?.c || priceArr[0])) /
                      (bars[bars.length - 22]?.c || priceArr[0]) * 100;

    if (preTrend < -3 && pos < 0.35 && volDec) {
      const ph = pos < 0.15 ? "C" : pos < 0.25 ? "B" : "A";
      results.push({
        theory:    "Wyckoff",
        setup:     `Accumulation Phase ${ph}`,
        direction: "L",
        strength:  ph === "C" ? 84 : ph === "B" ? 72 : 60,
        detail:    `Downtrend into consolidation. Volume declining — smart money absorbing supply. Phase ${ph}${ph === "C" ? " — spring territory" : ""}.`,
      });
    }

    if (preTrend > 3 && pos > 0.65 && volDec) {
      const ph = pos > 0.85 ? "C" : pos > 0.75 ? "B" : "A";
      results.push({
        theory:    "Wyckoff",
        setup:     `Distribution Phase ${ph}`,
        direction: "S",
        strength:  ph === "C" ? 84 : ph === "B" ? 72 : 60,
        detail:    `Uptrend into consolidation. Volume declining — smart money distributing. Phase ${ph}${ph === "C" ? " — upthrust territory" : ""}.`,
      });
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THEORY 2: ELLIOTT WAVE
// Counts swing highs/lows to identify 5-wave impulse structures
// Entry on wave 3 (strongest) or wave 5 confirmation
// ═══════════════════════════════════════════════════════════════════════════════

function elliottWaveAnalysis(bars) {
  if (!bars || bars.length < 20) return [];

  // Find local swing highs and lows (pivot points)
  const pivots = [];
  for (let i = 2; i < bars.length - 2; i++) {
    const isHigh = bars[i].h > bars[i-1].h && bars[i].h > bars[i-2].h &&
                   bars[i].h > bars[i+1].h && bars[i].h > bars[i+2].h;
    const isLow  = bars[i].l < bars[i-1].l && bars[i].l < bars[i-2].l &&
                   bars[i].l < bars[i+1].l && bars[i].l < bars[i+2].l;
    if (isHigh) pivots.push({ i, price: bars[i].h, type: "H" });
    if (isLow)  pivots.push({ i, price: bars[i].l, type: "L" });
  }

  if (pivots.length < 6) return [];

  // Deduplicate adjacent same-type pivots — keep extreme
  const clean = [pivots[0]];
  for (let i = 1; i < pivots.length; i++) {
    const prev = clean[clean.length - 1];
    if (prev.type === pivots[i].type) {
      if ((prev.type === "H" && pivots[i].price > prev.price) ||
          (prev.type === "L" && pivots[i].price < prev.price)) {
        clean[clean.length - 1] = pivots[i];
      }
    } else {
      clean.push(pivots[i]);
    }
  }

  if (clean.length < 6) return [];
  const results = [];

  // Check last 6 pivots for 5-wave impulse up: L H L H L H (wave 0-5)
  const last6 = clean.slice(-6);
  if (last6[0].type === "L") {
    const [w0, w1, w2, w3, w4, w5] = last6;
    const isImpulseUp =
      w1.price > w0.price &&  // wave 1 up
      w2.price > w0.price &&  // wave 2 doesn't go below wave 0
      w3.price > w1.price &&  // wave 3 above wave 1 high (new high)
      w4.price > w2.price &&  // wave 4 doesn't overlap wave 1 (simple check)
      w5.price > w3.price;    // wave 5 makes new high

    const wave3Strength = (w3.price - w2.price) / (w1.price - w0.price);

    if (isImpulseUp && wave3Strength > 1.2) {
      // Currently in or completing wave 5 — look for reversal soon
      const lastClose = bars[bars.length - 1].c;
      const nearW5    = lastClose >= w5.price * 0.97;
      results.push({
        theory:    "Elliott Wave",
        setup:     nearW5 ? "Wave 5 Complete — Reversal Due" : "Wave 5 In Progress",
        direction: nearW5 ? "S" : "L",
        strength:  nearW5 ? 82 : 78,
        detail:    `5-wave impulse up detected. Wave 3 was ${wave3Strength.toFixed(1)}x wave 1. ${nearW5 ? "Wave 5 extended — distribution likely." : "Riding wave 5 momentum."}`,
      });
    }
  }

  // Check for 5-wave impulse down: H L H L H L
  if (last6[0].type === "H") {
    const [w0, w1, w2, w3, w4, w5] = last6;
    const isImpulseDown =
      w1.price < w0.price &&
      w2.price < w0.price &&
      w3.price < w1.price &&
      w4.price < w2.price &&
      w5.price < w3.price;

    const wave3Strength = (w2.price - w3.price) / (w0.price - w1.price);

    if (isImpulseDown && wave3Strength > 1.2) {
      const lastClose = bars[bars.length - 1].c;
      const nearW5    = lastClose <= w5.price * 1.03;
      results.push({
        theory:    "Elliott Wave",
        setup:     nearW5 ? "Wave 5 Complete — Reversal Due" : "Wave 5 In Progress",
        direction: nearW5 ? "L" : "S",
        strength:  nearW5 ? 82 : 78,
        detail:    `5-wave impulse down detected. Wave 3 was ${wave3Strength.toFixed(1)}x wave 1. ${nearW5 ? "Wave 5 complete — accumulation likely." : "Riding wave 5 down."}`,
      });
    }
  }

  // Check for Wave 3 in progress (most powerful entry)
  if (clean.length >= 4) {
    const last4 = clean.slice(-4);
    if (last4[0].type === "L") {
      const [w0, w1, w2, w3] = last4;
      const isWave3Up =
        w1.price > w0.price &&
        w2.price > w0.price && w2.price < w1.price &&
        w3.price > w1.price;
      const w3Size = (w3.price - w2.price) / (w1.price - w0.price);
      if (isWave3Up && w3Size > 1.5) {
        results.push({
          theory:    "Elliott Wave",
          setup:     "Wave 3 Breakout",
          direction: "L",
          strength:  90,
          detail:    `Wave 3 impulse — ${w3Size.toFixed(1)}x the size of wave 1. Strongest part of the move. High-momentum long.`,
        });
      }
    }
    if (last4[0].type === "H") {
      const [w0, w1, w2, w3] = last4;
      const isWave3Down =
        w1.price < w0.price &&
        w2.price < w0.price && w2.price > w1.price &&
        w3.price < w1.price;
      const w3Size = (w2.price - w3.price) / (w0.price - w1.price);
      if (isWave3Down && w3Size > 1.5) {
        results.push({
          theory:    "Elliott Wave",
          setup:     "Wave 3 Breakdown",
          direction: "S",
          strength:  90,
          detail:    `Wave 3 impulse down — ${w3Size.toFixed(1)}x the size of wave 1. Strongest part of the move. High-momentum short.`,
        });
      }
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THEORY 3: RSI DIVERGENCE
// Bullish: price makes lower low, RSI makes higher low
// Bearish: price makes higher high, RSI makes lower high
// ═══════════════════════════════════════════════════════════════════════════════

function rsiDivergenceAnalysis(bars) {
  if (!bars || bars.length < 20) return [];

  const rsi     = calcRSI(bars, 14);
  const results = [];

  // Look at last 20 bars for divergence
  const window = 20;
  const start  = bars.length - window;
  const bSlice = bars.slice(start);
  const rSlice = rsi.slice(start);

  // Find two recent swing lows in price
  let low1Idx = -1, low2Idx = -1;
  for (let i = bSlice.length - 2; i >= 1; i--) {
    if (bSlice[i].l < bSlice[i-1].l && bSlice[i].l < bSlice[i+1]?.l) {
      if (low1Idx === -1) low1Idx = i;
      else if (low2Idx === -1) { low2Idx = i; break; }
    }
  }

  // Bullish divergence: price lower low, RSI higher low
  if (low1Idx !== -1 && low2Idx !== -1 && low2Idx < low1Idx) {
    const priceLower = bSlice[low1Idx].l < bSlice[low2Idx].l;
    const rsiHigher  = rSlice[low1Idx] !== null && rSlice[low2Idx] !== null &&
                       rSlice[low1Idx] > rSlice[low2Idx];
    if (priceLower && rsiHigher && rSlice[low1Idx] < 45) {
      results.push({
        theory:    "RSI Divergence",
        setup:     "Bullish Divergence",
        direction: "L",
        strength:  86,
        detail:    `Price made lower low — RSI made higher low (${rSlice[low2Idx]?.toFixed(0)} → ${rSlice[low1Idx]?.toFixed(0)}). Hidden buying pressure. Classic reversal signal.`,
      });
    }
  }

  // Find two recent swing highs in price
  let high1Idx = -1, high2Idx = -1;
  for (let i = bSlice.length - 2; i >= 1; i--) {
    if (bSlice[i].h > bSlice[i-1].h && bSlice[i].h > bSlice[i+1]?.h) {
      if (high1Idx === -1) high1Idx = i;
      else if (high2Idx === -1) { high2Idx = i; break; }
    }
  }

  // Bearish divergence: price higher high, RSI lower high
  if (high1Idx !== -1 && high2Idx !== -1 && high2Idx < high1Idx) {
    const priceHigher = bSlice[high1Idx].h > bSlice[high2Idx].h;
    const rsiLower    = rSlice[high1Idx] !== null && rSlice[high2Idx] !== null &&
                        rSlice[high1Idx] < rSlice[high2Idx];
    if (priceHigher && rsiLower && rSlice[high1Idx] > 55) {
      results.push({
        theory:    "RSI Divergence",
        setup:     "Bearish Divergence",
        direction: "S",
        strength:  86,
        detail:    `Price made higher high — RSI made lower high (${rSlice[high2Idx]?.toFixed(0)} → ${rSlice[high1Idx]?.toFixed(0)}). Hidden selling pressure. Classic reversal signal.`,
      });
    }
  }

  return results;
}


// ═══════════════════════════════════════════════════════════════════════════════
// THEORY 4: MOMENTUM BREAKOUT
// Price breaks above/below a key level on above-average volume
// This is the primary day-trading setup — fires far more frequently than
// Wyckoff/Elliott on real data
// ═══════════════════════════════════════════════════════════════════════════════

function momentumBreakoutAnalysis(bars) {
  if (!bars || bars.length < 15) return [];
  const results = [];

  const last   = bars[bars.length - 1];
  const prev   = bars[bars.length - 2];
  const atr    = calcATR(bars) || last.c * 0.02;
  const vAvg   = volAvg(bars, 10);

  // Key levels: highest high and lowest low of prior 10 bars (excluding last)
  const lookback = bars.slice(-11, -1);
  const keyHigh  = Math.max(...lookback.map(b => b.h));
  const keyLow   = Math.min(...lookback.map(b => b.l));

  // ── BULLISH BREAKOUT ──────────────────────────────────────────────────────
  // Last bar closes above key high on elevated volume
  if (last.c > keyHigh &&
      last.c > last.o &&                     // green bar
      last.v > vAvg * 1.3 &&                 // above-average volume
      (last.c - last.l) > atr * 0.5) {       // meaningful bar size
    const rvol = parseFloat((last.v / vAvg).toFixed(1));
    results.push({
      theory:    "Momentum",
      setup:     "Bullish Breakout",
      direction: "L",
      strength:  last.v > vAvg * 2 ? 88 : last.v > vAvg * 1.5 ? 82 : 74,
      detail:    `Price closed above ${keyHigh.toFixed(4)} resistance on ${rvol}x average volume. Breakout with momentum confirmation.`,
    });
  }

  // ── BEARISH BREAKDOWN ─────────────────────────────────────────────────────
  if (last.c < keyLow &&
      last.c < last.o &&                     // red bar
      last.v > vAvg * 1.3 &&
      (last.h - last.c) > atr * 0.5) {
    const rvol = parseFloat((last.v / vAvg).toFixed(1));
    results.push({
      theory:    "Momentum",
      setup:     "Bearish Breakdown",
      direction: "S",
      strength:  last.v > vAvg * 2 ? 88 : last.v > vAvg * 1.5 ? 82 : 74,
      detail:    `Price closed below ${keyLow.toFixed(4)} support on ${rvol}x average volume. Breakdown with momentum confirmation.`,
    });
  }

  // ── BULLISH CONTINUATION (higher highs + higher lows pattern) ────────────
  const last5 = bars.slice(-5);
  const highs  = last5.map(b => b.h);
  const lows   = last5.map(b => b.l);
  const risingHighs = highs.every((h, i) => i === 0 || h >= highs[i - 1] * 0.998);
  const risingLows  = lows.every((l, i)  => i === 0 || l >= lows[i - 1]  * 0.998);
  if (risingHighs && risingLows && last.v > vAvg * 1.2 && last.c > last.o) {
    results.push({
      theory:    "Momentum",
      setup:     "Trending Higher",
      direction: "L",
      strength:  76,
      detail:    `5-bar sequence of higher highs and higher lows. Trend continuation on ${(last.v/vAvg).toFixed(1)}x volume.`,
    });
  }

  // ── BEARISH CONTINUATION (lower highs + lower lows pattern) ─────────────
  const fallingHighs = highs.every((h, i) => i === 0 || h <= highs[i - 1] * 1.002);
  const fallingLows  = lows.every((l, i)  => i === 0 || l <= lows[i - 1]  * 1.002);
  if (fallingHighs && fallingLows && last.v > vAvg * 1.2 && last.c < last.o) {
    results.push({
      theory:    "Momentum",
      setup:     "Trending Lower",
      direction: "S",
      strength:  76,
      detail:    `5-bar sequence of lower highs and lower lows. Trend continuation on ${(last.v/vAvg).toFixed(1)}x volume.`,
    });
  }

  // ── VOLUME SPIKE REVERSAL ─────────────────────────────────────────────────
  // Huge volume bar + wick rejection = smart money reversal
  const wickUp   = last.h - Math.max(last.o, last.c);
  const wickDown = Math.min(last.o, last.c) - last.l;
  const body     = Math.abs(last.c - last.o);

  if (last.v > vAvg * 2.5) {
    if (wickDown > body * 2 && last.c > last.o) {
      // Long lower wick on huge volume = buyers overwhelmed sellers
      results.push({
        theory:    "Momentum",
        setup:     "Volume Spike Reversal — Bullish",
        direction: "L",
        strength:  85,
        detail:    `${(last.v/vAvg).toFixed(1)}x volume spike with bullish rejection wick. Institutional absorption of selling pressure.`,
      });
    }
    if (wickUp > body * 2 && last.c < last.o) {
      // Long upper wick on huge volume = sellers overwhelmed buyers
      results.push({
        theory:    "Momentum",
        setup:     "Volume Spike Reversal — Bearish",
        direction: "S",
        strength:  85,
        detail:    `${(last.v/vAvg).toFixed(1)}x volume spike with bearish rejection wick. Institutional distribution detected.`,
      });
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNAL COMBINER
// Only fires when 2+ theories agree on direction
// Scores by theory alignment count + individual theory strength
// ═══════════════════════════════════════════════════════════════════════════════

function combineSignals(asset, dBars, hBars, livePrice = null, minTheories = 1) {
  const signals = [];

  for (const [bars, tf] of [[dBars, "Daily"], [hBars, "4H"]]) {
    if (!bars || bars.length < 15) continue;

    const wyckoff  = wyckoffAnalysis(bars);
    const elliott  = elliottWaveAnalysis(bars);
    const rsiDiv   = rsiDivergenceAnalysis(bars);
    const momentum = momentumBreakoutAnalysis(bars);
    const all      = [...wyckoff, ...elliott, ...rsiDiv, ...momentum];

    // Group by direction
    for (const dir of ["L", "S"]) {
      const aligned = all.filter(r => r.direction === dir);
      if (aligned.length < minTheories) continue;

      const theories   = [...new Set(aligned.map(r => r.theory))];
      const topStrength = Math.max(...aligned.map(r => r.strength));
      // Bonus for multi-theory confirmation
      const multiBonus = theories.length >= 3 ? 10 : theories.length === 2 ? 5 : 0;
      const finalScore = Math.min(100, topStrength + multiBonus);

      const entry  = livePrice || bars[bars.length - 1].c;
      const atr    = calcATR(bars) || entry * 0.02;
      const mult   = asset.type === "forex" ? 3 : asset.type === "crypto" ? 5 : 4;
      // Use percentage-based targets for micro-priced assets to prevent insane % swings
      const maxMove = entry * (asset.type === "forex" ? 0.03 : asset.type === "crypto" ? 0.15 : 0.25);
      const move    = Math.min(atr * mult, maxMove);
      const target  = dir === "L" ? entry + move : entry - move;
      const stop    = dir === "L" ? entry - move * 0.4 : entry + move * 0.4;
      // Vary upside naturally from ATR, capped per asset type
      const maxUpside = asset.type === "forex" ? 8 : asset.type === "crypto" ? 40 : 30;
      const upside  = Math.min(maxUpside, Math.max(2, Math.abs(Math.round((target - entry) / entry * 100))));
      const rr      = parseFloat((Math.abs(target - entry) / Math.max(0.00001, Math.abs(entry - stop))).toFixed(1));
      const ttg    = asset.type === "forex" ? "4h–2d" : asset.type === "crypto" ? "1–3d" : "2–7d";

      // Build catalyst list from each aligned signal
      const catalysts = [...new Set(aligned.map(r => `${r.setup}: ${r.detail}`))].slice(0, 4);

      signals.push({
        id:           `${asset.id}-${dir}-${tf}-${Date.now()}-${Math.random().toString(36).slice(2,4)}`,
        tid:          asset.id,
        name:         asset.name,
        instrument:   `${asset.sector} · ${asset.type.toUpperCase()} · ${tf}`,
        tier:         finalScore >= 90 ? 1 : finalScore >= 75 ? 2 : 3,
        direction:    dir,
        entry:        pricePrecision(entry, asset.type),
        target:       pricePrecision(target, asset.type),
        stop:         pricePrecision(stop, asset.type),
        upside:       Math.max(1, upside),
        riskReward:   rr,
        confidence:   Math.min(95, Math.round(40 + finalScore * 0.55)),
        catalystScore: Math.round(finalScore / 10),
        timeToTarget: ttg,
        catalysts,
        edgeScore:    finalScore,
        theoryCount:  theories.length,
        theories,
        edges:        aligned.map(r => r.setup),
        timeframe:    tf,
        sector:       asset.sector,
        type:         asset.type,
        timestamp:    Date.now(),
      });
    }
  }

  return signals;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// REAL BAR FETCHER
// Fetches genuine OHLCV candles from live data sources
// Stocks: Finnhub  |  Crypto: CoinGecko  |  Forex: Twelve Data
// ═══════════════════════════════════════════════════════════════════════════════

const COINGECKO_MAP = {
  "BTCUSD":"bitcoin", "ETHUSD":"ethereum", "SOLUSD":"solana",
  "BNBUSD":"binancecoin", "XRPUSD":"ripple", "ADAUSD":"cardano",
  "AVAXUSD":"avalanche-2", "LINKUSD":"chainlink", "DOGEUSD":"dogecoin",
  "SHIBAUSD":"shiba-inu", "PEPEUSD":"pepe", "SUIUSD":"sui",
};

const TWELVE_FOREX_MAP = {
  "EURUSD":"EUR/USD", "GBPUSD":"GBP/USD", "USDJPY":"USD/JPY",
  "AUDUSD":"AUD/USD", "USDCAD":"USD/CAD", "USDCHF":"USD/CHF",
  "NZDUSD":"NZD/USD", "GBPJPY":"GBP/JPY", "EURGBP":"EUR/GBP",
  "EURJPY":"EUR/JPY", "CADJPY":"CAD/JPY", "USDTRY":"USD/TRY",
  "USDZAR":"USD/ZAR", "USDMXN":"USD/MXN",
};

// Convert raw OHLCV arrays into our standard bar format
function normaliseBars(raw) {
  return raw.map(b => ({
    o: b.o, h: b.h, l: b.l, c: b.c,
    v: b.v ?? 1e6,
  })).filter(b => b.c > 0);
}

// Fetch real bars for a stock from Finnhub
// Returns { daily: bars[], h4: bars[] } or null
async function fetchStockBars(symbol, finnhubKey) {
  if (!finnhubKey) return null;
  const now   = Math.floor(Date.now() / 1000);
  const d60   = now - 60 * 24 * 3600;   // 60 days for daily
  const d14   = now - 14 * 24 * 3600;   // 14 days for 4H (gives ~84 bars)

  try {
    const [rD, rH] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${d60}&to=${now}&token=${finnhubKey}`, { signal: AbortSignal.timeout(8000) }),
      fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=240&from=${d14}&to=${now}&token=${finnhubKey}`, { signal: AbortSignal.timeout(8000) }),
    ]);
    const [dD, dH] = await Promise.all([rD.json(), rH.json()]);

    const toBarArr = d => {
      if (!d || d.s !== 'ok' || !d.c) return [];
      return d.t.map((_, i) => ({ o: d.o[i], h: d.h[i], l: d.l[i], c: d.c[i], v: d.v[i] }));
    };

    const daily = toBarArr(dD);
    const h4    = toBarArr(dH);
    if (daily.length < 10) return null;
    return { daily, h4: h4.length >= 10 ? h4 : daily };
  } catch { return null; }
}

// Fetch real bars for a crypto from CoinGecko
// CoinGecko OHLC endpoint returns [timestamp, o, h, l, c] — no volume
async function fetchCryptoBars(assetId) {
  const geckoId = COINGECKO_MAP[assetId];
  if (!geckoId) return null;
  try {
    // days=30 gives daily candles; days=3 gives hourly-ish candles for 4H
    const [rD, rH] = await Promise.all([
      fetch(`https://api.coingecko.com/api/v3/coins/${geckoId}/ohlc?vs_currency=usd&days=60`, { signal: AbortSignal.timeout(8000) }),
      fetch(`https://api.coingecko.com/api/v3/coins/${geckoId}/ohlc?vs_currency=usd&days=7`, { signal: AbortSignal.timeout(8000) }),
    ]);
    const [dD, dH] = await Promise.all([rD.json(), rH.json()]);

    const toBarArr = arr => Array.isArray(arr)
      ? arr.map(([, o, h, l, c]) => ({ o, h, l, c, v: 1e6 }))
      : [];

    const daily = toBarArr(dD);
    const h4    = toBarArr(dH);
    if (daily.length < 10) return null;
    return { daily, h4: h4.length >= 10 ? h4 : daily };
  } catch { return null; }
}

// Fetch real bars for a forex pair from Twelve Data
// We batch all forex pairs in two calls (daily + 4H) to stay within rate limits
async function fetchAllForexBars(twelveKey) {
  if (!twelveKey) return {};
  const results = {};
  const symbols = Object.values(TWELVE_FOREX_MAP).join(',');

  try {
    // Fetch daily bars — 60 candles per pair
    const [rD, rH] = await Promise.all([
      fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbols)}&interval=1day&outputsize=60&apikey=${twelveKey}`, { signal: AbortSignal.timeout(10000) }),
      fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbols)}&interval=4h&outputsize=60&apikey=${twelveKey}`, { signal: AbortSignal.timeout(10000) }),
    ]);
    const [dD, dH] = await Promise.all([rD.json(), rH.json()]);

    const extractBars = (data, sym) => {
      // Twelve Data returns { [symbol]: { values: [...] } } for multiple symbols
      // or { values: [...] } for single symbol
      const entry = data[sym] || data;
      const values = entry?.values;
      if (!Array.isArray(values)) return [];
      // values are newest-first — reverse to chronological order
      return values.slice().reverse().map(v => ({
        o: parseFloat(v.open), h: parseFloat(v.high),
        l: parseFloat(v.low), c: parseFloat(v.close), v: 1e6,
      })).filter(b => b.c > 0);
    };

    for (const [assetId, sym] of Object.entries(TWELVE_FOREX_MAP)) {
      const daily = extractBars(dD, sym);
      const h4    = extractBars(dH, sym);
      if (daily.length >= 10) {
        results[assetId] = { daily, h4: h4.length >= 10 ? h4 : daily };
      }
    }
  } catch {}

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE SPOT PRICE FETCHER (for entry price + options pricing)
// ═══════════════════════════════════════════════════════════════════════════════
async function fetchLivePrices() {
  const prices     = {};
  const finnhubKey = process.env.FINNHUB_API_KEY;

  // ── STOCKS via Finnhub ────────────────────────────────────────────────────
  const stockAssets = UNIVERSE.filter(a => a.type === "stock");
  if (finnhubKey) {
    await Promise.all(stockAssets.map(async (a) => {
      try {
        const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${a.id}&token=${finnhubKey}`, { signal: AbortSignal.timeout(6000) });
        const d = await r.json();
        if (d.c && d.c > 0) prices[a.id] = d.c;
      } catch {}
    }));
  }
  // Fallback: Yahoo Finance for any stocks Finnhub missed
  const stillMissing = stockAssets.filter(a => !prices[a.id]);
  if (stillMissing.length > 0) {
    try {
      const syms = stillMissing.map(a => a.id).join(",");
      const r = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${syms}&fields=regularMarketPrice`, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) });
      const d = await r.json();
      for (const q of (d?.quoteResponse?.result || [])) {
        if (q.regularMarketPrice > 0) prices[q.symbol] = q.regularMarketPrice;
      }
    } catch {}
  }

  // ── CRYPTO via CoinGecko ──────────────────────────────────────────────────
  try {
    const ids = Object.values(COINGECKO_MAP).join(",");
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`, { signal: AbortSignal.timeout(8000) });
    const d = await r.json();
    for (const [assetId, geckoId] of Object.entries(COINGECKO_MAP)) {
      if (d[geckoId]?.usd) prices[assetId] = d[geckoId].usd;
    }
  } catch {}

  // ── FOREX via Twelve Data (spot price from latest candle close) ───────────
  // Will be populated from real candle data in main handler

  return prices;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════════
// DYNAMIC STOCK SCREENER
// Fetches top movers by relative volume from the market in real time
// These are the stocks "in play" today — the ones day traders actually trade
// ═══════════════════════════════════════════════════════════════════════════════

// A curated seed list of high-vol day trading stocks to quote-scan
// We check relative volume for all of these and pick the top movers
const SCAN_SEED = [
  // Mega cap / index
  "SPY","QQQ","IWM","DIA","AAPL","MSFT","AMZN","META","GOOGL","NVDA","TSLA","AMD",
  // High beta tech
  "PLTR","COIN","MSTR","HOOD","SOFI","AFRM","UPST","SMCI","ARM","INTC","MU","AVGO",
  // Crypto-adjacent
  "MARA","RIOT","CLSK","BTBT","HUT","CIFR",
  // Space / defence
  "RKLB","ASTS","LUNR","ACHR","JOBY","LILM",
  // Quantum
  "IONQ","RGTI","QBTS","QUBT",
  // AI / software
  "SOUN","BBAI","AIXI","GFAI","IREN",
  // Biotech / speculative
  "SAVA","NVAX","MRNA","BNTX","PLUG","FCEL","BLNK","CHPT",
  // Fintech
  "OPEN","LMND","NRDS","UPWK","DOCN",
  // Other high-vol favourites
  "NIO","XPEV","LI","RIVN","LCID","GME","AMC","BBBY","SPCE","CLOV",
  // Sector ETFs that day traders use
  "SOXS","SOXL","TQQQ","SQQQ","LABU","LABD","UVXY","VIXY",
];

async function fetchDynamicStocks(finnhubKey, livePrices) {
  if (!finnhubKey) return [];

  // Batch-quote all seed symbols — get current price + today's volume
  // Finnhub quote returns: c (current), h, l, o, pc (prev close), v (volume today — not always available)
  // We'll use price change % as a proxy for "in play" when volume isn't available

  const quotes = [];
  const BATCH = 15; // stay well under 60/min rate limit (we have other calls too)

  for (let i = 0; i < Math.min(SCAN_SEED.length, 60); i += BATCH) {
    const batch = SCAN_SEED.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(async sym => {
      try {
        const r = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubKey}`,
          { signal: AbortSignal.timeout(5000) }
        );
        const d = await r.json();
        if (d.c && d.c > 0 && d.pc && d.pc > 0) {
          const changePct = Math.abs((d.c - d.pc) / d.pc * 100);
          return { id: sym, price: d.c, changePct, prevClose: d.pc };
        }
      } catch {}
      return null;
    }));
    results.filter(Boolean).forEach(q => quotes.push(q));
    // Small delay between batches to respect rate limits
    if (i + BATCH < SCAN_SEED.length) await new Promise(r => setTimeout(r, 300));
  }

  // Sort by absolute % change — biggest movers are "in play"
  quotes.sort((a, b) => b.changePct - a.changePct);

  // Take top 25 movers
  const topMovers = quotes.slice(0, 25);

  // Convert to asset objects compatible with our engine
  // If already in UNIVERSE, skip (already covered)
  const universeIds = new Set(UNIVERSE.map(a => a.id));

  return topMovers
    .filter(q => !universeIds.has(q.id))
    .map(q => ({
      id:     q.id,
      name:   q.id,          // just use ticker as name for dynamic assets
      sector: "Top Mover",
      type:   "stock",
      vol:    Math.min(0.15, Math.max(0.03, q.changePct / 100 * 2)), // estimate vol from move
      base:   q.prevClose,
      dynamic: true,         // flag as dynamically discovered
    }));
}

export async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const finnhubKey = process.env.FINNHUB_API_KEY;
  const twelveKey  = process.env.TWELVE_DATA_API_KEY;

  // ── Fetch everything in parallel ─────────────────────────────────────────
  const [livePrices, forexBars] = await Promise.all([
    fetchLivePrices(),
    fetchAllForexBars(twelveKey),
  ]);

  // Extract forex spot prices from the latest candle close
  for (const [assetId, bars] of Object.entries(forexBars)) {
    if (bars.daily.length > 0) {
      livePrices[assetId] = bars.daily[bars.daily.length - 1].c;
    }
  }

  // ── Fetch dynamic top movers ─────────────────────────────────────────────
  const dynamicAssets = await fetchDynamicStocks(finnhubKey, livePrices);

  // Full asset list: static universe + dynamic movers
  const ALL_ASSETS = [...UNIVERSE, ...dynamicAssets];

  // Store live prices for dynamic assets
  for (const a of dynamicAssets) {
    if (!livePrices[a.id] && a.base) livePrices[a.id] = a.base;
  }

  // ── Pre-fetch all real bars in parallel ─────────────────────────────────
  const realBarsCache = {};

  const stockAssets  = ALL_ASSETS.filter(a => a.type === "stock");
  const cryptoAssets = ALL_ASSETS.filter(a => a.type === "crypto");

  await Promise.all([
    ...stockAssets.map(async a => {
      const bars = await fetchStockBars(a.id, finnhubKey);
      if (bars) realBarsCache[a.id] = bars;
    }),
    ...cryptoAssets.map(async a => {
      const bars = await fetchCryptoBars(a.id);
      if (bars) realBarsCache[a.id] = bars;
    }),
  ]);
  for (const [assetId, bars] of Object.entries(forexBars)) {
    realBarsCache[assetId] = bars;
  }

  const signals = [];
  const seen    = new Set();

  for (const asset of ALL_ASSETS) {
    // ── REAL BAR ANALYSIS ─────────────────────────────────────────────────
    let dBars = null, hBars = null;
    const cached = realBarsCache[asset.id];
    if (cached) { dBars = cached.daily; hBars = cached.h4; }

    // Skip asset entirely if no real bars available
    const livePrice = livePrices[asset.id] || null;
    if (!dBars || dBars.length < 10) continue;
    if (!hBars || hBars.length < 10) hBars = dBars; // use daily as fallback for 4H only

    for (const sig of combineSignals(asset, dBars, hBars, livePrice, 1)) {
      const key = `${asset.id}-${sig.direction}-${sig.timeframe}`;
      if (seen.has(key)) continue;
      seen.add(key);
      signals.push({ ...sig, assetType: asset.type });
    }
  }

  // Sort: multi-theory signals first, then by score
  signals.sort((a, b) => b.theoryCount - a.theoryCount || b.edgeScore - a.edgeScore);

  const url  = new URL(req.url, "http://localhost");
  const risk = parseInt(url.searchParams.get("risk") || "2");

  // Build single-theory signals for YOLO mode
  const singleTheorySignals = [];
  if (risk === 3) {
    const seenSingle = new Set();
    for (const asset of ALL_ASSETS) {
      const liveBase = livePrices[asset.id] || asset.base;

      // Use cached real bars, fall back to synthetic
      const cachedYolo = realBarsCache[asset.id];
      let dB = cachedYolo ? cachedYolo.daily : null;
      let hB = cachedYolo ? cachedYolo.h4    : null;
      // Skip asset if no real bars
      if (!dB || dB.length < 10) continue;
      if (!hB || hB.length < 10) hB = dB; // use daily as fallback for 4H only

      for (const [bars, tf] of [[dB, "Daily"], [hB, "4H"]]) {
        const all = [
          ...wyckoffAnalysis(bars),
          ...elliottWaveAnalysis(bars),
          ...rsiDivergenceAnalysis(bars),
        ];
        for (const r of all) {
          const key = `${asset.id}-${r.direction}-${tf}-${r.setup}`;
          if (seenSingle.has(key)) continue;
          seenSingle.add(key);
          if (seen.has(`${asset.id}-${r.direction}-${tf}`)) continue;
          const entry   = liveBase || bars[bars.length - 1].c;
          const atr     = calcATR(bars) || entry * 0.02;
          const mult    = asset.type === "forex" ? 3 : asset.type === "crypto" ? 5 : 4;
          const maxMove = entry * (asset.type === "forex" ? 0.03 : asset.type === "crypto" ? 0.15 : 0.25);
          const move    = Math.min(atr * mult, maxMove);
          const target  = r.direction === "L" ? entry + move : entry - move;
          const stop    = r.direction === "L" ? entry - move * 0.4 : entry + move * 0.4;
          const maxUpside = asset.type === "forex" ? 8 : asset.type === "crypto" ? 40 : 30;
          const upside  = Math.min(maxUpside, Math.max(2, Math.abs(Math.round((target - entry) / entry * 100))));
          const rr      = parseFloat((Math.abs(target - entry) / Math.max(0.00001, Math.abs(entry - stop))).toFixed(1));
          singleTheorySignals.push({
            id: `${asset.id}-${r.direction}-${tf}-single-${Math.random().toString(36).slice(2,5)}`,
            tid: asset.id, name: asset.name,
            instrument: `${asset.sector} · ${asset.type.toUpperCase()} · ${tf}`,
            tier: 3, direction: r.direction,
            entry: pricePrecision(entry, asset.type),
            target: pricePrecision(target, asset.type),
            stop: pricePrecision(stop, asset.type),
            upside: Math.max(1, upside), riskReward: rr,
            confidence: Math.min(95, Math.round(35 + r.strength * 0.45)),
            catalystScore: Math.round(r.strength / 10),
            timeToTarget: asset.type === "forex" ? "4h–2d" : asset.type === "crypto" ? "1–3d" : "2–7d",
            catalysts: [`${r.setup}: ${r.detail}`],
            edgeScore: r.strength, theoryCount: 1, theories: [r.theory],
            edges: [r.setup], timeframe: tf, sector: asset.sector,
            type: asset.type, assetType: asset.type,
            timestamp: Date.now(),
          });
        }
      }
    }
  }

  // Risk tiers:
  // risk=1 (Grandma)  — 3+ theories confirming (rare, high conviction)
  // risk=2 (Divorce)  — 2+ theories confirming
  // risk=3 (YOLO)     — any single theory signal, all assets
  let filtered;
  if (risk === 1) {
    filtered = signals.filter(s => s.theoryCount >= 3);
    if (filtered.length === 0) filtered = signals.filter(s => s.theoryCount >= 2).slice(0, 5);
  } else if (risk === 2) {
    filtered = signals.filter(s => s.theoryCount >= 2);
    if (filtered.length === 0) filtered = signals.filter(s => s.theoryCount >= 1).slice(0, 10);
  } else {
    // YOLO — everything, including single-theory, sorted by strength
    filtered = [...signals, ...singleTheorySignals];
    filtered.sort((a, b) => b.edgeScore - a.edgeScore);
  }

  return new Response(
    JSON.stringify({ signals: filtered, scored: filtered.length, universe: ALL_ASSETS.length, dynamic: dynamicAssets.length, ts: Date.now() }),
    { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } }
  );
}
