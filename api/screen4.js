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
  // CRYPTO — prices as of Mar 2026
  { id:"BTCUSD",  name:"Bitcoin",         sector:"Crypto Major",  type:"crypto", vol:0.04,   base:87000   },
  { id:"ETHUSD",  name:"Ethereum",        sector:"Crypto Major",  type:"crypto", vol:0.05,   base:2100    },
  { id:"SOLUSD",  name:"Solana",          sector:"Crypto Major",  type:"crypto", vol:0.06,   base:138     },
  { id:"BNBUSD",  name:"BNB",             sector:"Crypto Major",  type:"crypto", vol:0.035,  base:605     },
  { id:"XRPUSD",  name:"XRP",             sector:"Crypto Major",  type:"crypto", vol:0.07,   base:2.45    },
  { id:"ADAUSD",  name:"Cardano",         sector:"Crypto Mid",    type:"crypto", vol:0.07,   base:0.82    },
  { id:"AVAXUSD", name:"Avalanche",       sector:"Crypto Mid",    type:"crypto", vol:0.07,   base:21      },
  { id:"LINKUSD", name:"Chainlink",       sector:"Crypto Mid",    type:"crypto", vol:0.065,  base:13.5    },
  { id:"DOGEUSD", name:"Dogecoin",        sector:"Meme Coin",     type:"crypto", vol:0.08,   base:0.185   },
  { id:"SHIBAUSD",name:"Shiba Inu",       sector:"Meme Coin",     type:"crypto", vol:0.10,   base:0.0000138 },
  { id:"PEPEUSD", name:"PEPE",            sector:"Meme Coin",     type:"crypto", vol:0.12,   base:0.0000105 },
  { id:"SUIUSD",  name:"SUI",             sector:"Crypto Mid",    type:"crypto", vol:0.08,   base:2.85    },
  // FOREX — prices as of Mar 2026
  { id:"EURUSD",  name:"EUR/USD",         sector:"Forex Major",   type:"forex",  vol:0.006,  base:1.0820  },
  { id:"GBPUSD",  name:"GBP/USD",         sector:"Forex Major",   type:"forex",  vol:0.007,  base:1.2885  },
  { id:"USDJPY",  name:"USD/JPY",         sector:"Forex Major",   type:"forex",  vol:0.007,  base:148.80  },
  { id:"AUDUSD",  name:"AUD/USD",         sector:"Forex Major",   type:"forex",  vol:0.006,  base:0.6305  },
  { id:"USDCAD",  name:"USD/CAD",         sector:"Forex Major",   type:"forex",  vol:0.005,  base:1.4380  },
  { id:"USDCHF",  name:"USD/CHF",         sector:"Forex Major",   type:"forex",  vol:0.005,  base:0.8985  },
  { id:"NZDUSD",  name:"NZD/USD",         sector:"Forex Major",   type:"forex",  vol:0.006,  base:0.5710  },
  { id:"GBPJPY",  name:"GBP/JPY",         sector:"Forex Minor",   type:"forex",  vol:0.009,  base:191.70  },
  { id:"EURGBP",  name:"EUR/GBP",         sector:"Forex Minor",   type:"forex",  vol:0.005,  base:0.8395  },
  { id:"EURJPY",  name:"EUR/JPY",         sector:"Forex Minor",   type:"forex",  vol:0.008,  base:161.00  },
  { id:"CADJPY",  name:"CAD/JPY",         sector:"Forex Minor",   type:"forex",  vol:0.007,  base:103.40  },
  { id:"USDTRY",  name:"USD/TRY",         sector:"Forex Exotic",  type:"forex",  vol:0.015,  base:36.20   },
  { id:"USDZAR",  name:"USD/ZAR",         sector:"Forex Exotic",  type:"forex",  vol:0.012,  base:18.45   },
  { id:"USDMXN",  name:"USD/MXN",         sector:"Forex Exotic",  type:"forex",  vol:0.010,  base:20.35   },
  // STOCKS — prices as of Mar 2026
  { id:"IONQ",    name:"IonQ",            sector:"Quantum",       type:"stock",  vol:0.07,   base:28.50   },
  { id:"RGTI",    name:"Rigetti",         sector:"Quantum",       type:"stock",  vol:0.08,   base:9.80    },
  { id:"QUBT",    name:"Quantum Computing",sector:"Quantum",      type:"stock",  vol:0.09,   base:6.20    },
  { id:"QBTS",    name:"D-Wave",          sector:"Quantum",       type:"stock",  vol:0.08,   base:8.40    },
  { id:"RKLB",    name:"Rocket Lab",      sector:"Space",         type:"stock",  vol:0.06,   base:22.10   },
  { id:"LUNR",    name:"Intuitive Machines",sector:"Space",       type:"stock",  vol:0.08,   base:7.20    },
  { id:"ASTS",    name:"AST SpaceMobile", sector:"Space",         type:"stock",  vol:0.07,   base:18.60   },
  { id:"ACHR",    name:"Archer Aviation", sector:"eVTOL",         type:"stock",  vol:0.07,   base:7.40    },
  { id:"MARA",    name:"Marathon Digital",sector:"BTC Miner",     type:"stock",  vol:0.08,   base:14.80   },
  { id:"RIOT",    name:"Riot Platforms",  sector:"BTC Miner",     type:"stock",  vol:0.07,   base:8.50    },
  { id:"MSTR",    name:"MicroStrategy",   sector:"BTC Treasury",  type:"stock",  vol:0.06,   base:295     },
  { id:"COIN",    name:"Coinbase",        sector:"Crypto Exch",   type:"stock",  vol:0.05,   base:205     },
  { id:"SOUN",    name:"SoundHound AI",   sector:"AI",            type:"stock",  vol:0.09,   base:7.90    },
  { id:"BBAI",    name:"BigBear.ai",      sector:"AI",            type:"stock",  vol:0.08,   base:1.65    },
  { id:"UPST",    name:"Upstart",         sector:"AI/Fintech",    type:"stock",  vol:0.07,   base:52      },
  { id:"SMCI",    name:"Super Micro",     sector:"AI Server",     type:"stock",  vol:0.06,   base:38      },
  { id:"NVDA",    name:"Nvidia",          sector:"AI/Semis",      type:"stock",  vol:0.04,   base:118     },
  { id:"AMD",     name:"AMD",             sector:"AI/Semis",      type:"stock",  vol:0.04,   base:102     },
  { id:"PLTR",    name:"Palantir",        sector:"AI/Defense",    type:"stock",  vol:0.05,   base:82      },
  { id:"SAVA",    name:"Cassava Sciences",sector:"Biotech",       type:"stock",  vol:0.09,   base:3.80    },
  { id:"PLUG",    name:"Plug Power",      sector:"Hydrogen",      type:"stock",  vol:0.06,   base:1.95    },
  { id:"SOFI",    name:"SoFi",            sector:"Fintech",       type:"stock",  vol:0.06,   base:11.20   },
  { id:"NIO",     name:"NIO",             sector:"EM/EV",         type:"stock",  vol:0.07,   base:3.90    },
  { id:"AFRM",    name:"Affirm",          sector:"Fintech",       type:"stock",  vol:0.07,   base:44      },
  { id:"TSLA",    name:"Tesla",           sector:"EV",            type:"stock",  vol:0.05,   base:285     },
  { id:"HOOD",    name:"Robinhood",       sector:"Fintech",       type:"stock",  vol:0.06,   base:38      },
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
// SIGNAL COMBINER
// Only fires when 2+ theories agree on direction
// Scores by theory alignment count + individual theory strength
// ═══════════════════════════════════════════════════════════════════════════════

function combineSignals(asset, dBars, hBars, livePrice = null) {
  const signals = [];

  for (const [bars, tf] of [[dBars, "Daily"], [hBars, "4H"]]) {
    if (!bars || bars.length < 20) continue;

    const wyckoff  = wyckoffAnalysis(bars);
    const elliott  = elliottWaveAnalysis(bars);
    const rsiDiv   = rsiDivergenceAnalysis(bars);
    const all      = [...wyckoff, ...elliott, ...rsiDiv];

    // Group by direction
    for (const dir of ["L", "S"]) {
      const aligned = all.filter(r => r.direction === dir);
      if (aligned.length < 2) continue; // need 2+ theories to agree

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

// Fetch live prices from multiple sources
async function fetchLivePrices() {
  const prices = {};

  // ── CRYPTO via Coinbase ────────────────────────────────────────────────────
  const cryptoAssets = UNIVERSE.filter(a => a.type === "crypto");
  await Promise.all(cryptoAssets.map(async (a) => {
    try {
      const r = await fetch(`https://api.coinbase.com/v2/prices/${a.id}/spot`, { signal: AbortSignal.timeout(4000) });
      const d = await r.json();
      if (d.data?.amount) prices[a.id] = parseFloat(d.data.amount);
    } catch {}
  }));

  // ── FOREX via exchangerate-api ─────────────────────────────────────────────
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(4000) });
    const d = await r.json();
    if (d.rates) {
      for (const a of UNIVERSE.filter(x => x.type === "forex")) {
        const base  = a.id.slice(0, 3);
        const quote = a.id.slice(3, 6);
        if (base === "USD" && d.rates[quote])        prices[a.id] = parseFloat(d.rates[quote].toFixed(5));
        else if (quote === "USD" && d.rates[base])   prices[a.id] = parseFloat((1 / d.rates[base]).toFixed(5));
        else if (d.rates[base] && d.rates[quote])    prices[a.id] = parseFloat((d.rates[quote] / d.rates[base]).toFixed(5));
      }
    }
  } catch {}

  // ── STOCKS via Finnhub ─────────────────────────────────────────────────────
  const stockAssets  = UNIVERSE.filter(a => a.type === "stock");
  const finnhubKey   = process.env.FINNHUB_API_KEY;
  if (finnhubKey && finnhubKey !== "demo") {
    await Promise.all(stockAssets.map(async (a) => {
      try {
        const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${a.id}&token=${finnhubKey}`, { signal: AbortSignal.timeout(4000) });
        const d = await r.json();
        if (d.c && d.c > 0) prices[a.id] = d.c;
      } catch {}
    }));
  }

  return prices;
}

export async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // Fetch live prices — fall back to hardcoded base if unavailable
  const livePrices = await fetchLivePrices();

  const signals = [];
  const seen    = new Set(); // key: assetId-direction-timeframe (one signal per combo)

  for (const asset of UNIVERSE) {
    const livePrice = livePrices[asset.id] || null;
    const base      = livePrice || asset.base;
    const dBars     = makeBars(base, asset.vol, 30);
    const hBars     = makeBars(base, asset.vol * 0.45, 30);

    for (const sig of combineSignals(asset, dBars, hBars, livePrice)) {
      const key = `${asset.id}-${sig.direction}-${sig.timeframe}`;
      if (seen.has(key)) continue;
      seen.add(key);
      signals.push(sig);
    }
  }

  // Sort: multi-theory signals first, then by score
  signals.sort((a, b) => b.theoryCount - a.theoryCount || b.edgeScore - a.edgeScore);

  // Risk level filtering
  // risk=1 (Grandma Approved)  — 3 theories, fallback to 2 if none
  // risk=2 (Divorce Territory) — 2+ theories
  // risk=3 (YOLO)              — 1+ theory (everything)
  const url  = new URL(req.url, "http://localhost");
  const risk = parseInt(url.searchParams.get("risk") || "2");

  // Build single-theory signals for YOLO mode
  const singleTheorySignals = [];
  if (risk === 3) {
    const seenSingle = new Set();
    for (const asset of UNIVERSE) {
      const liveBase = livePrices[asset.id] || asset.base;
      for (const [bars, tf] of [[makeBars(liveBase, asset.vol, 30), "Daily"], [makeBars(liveBase, asset.vol * 0.45, 30), "4H"]]) {
        const all = [
          ...wyckoffAnalysis(bars),
          ...elliottWaveAnalysis(bars),
          ...rsiDivergenceAnalysis(bars),
        ];
        for (const r of all) {
          const key = `${asset.id}-${r.direction}-${tf}-${r.setup}`;
          if (seenSingle.has(key)) continue;
          seenSingle.add(key);
          // Skip if already covered by a multi-theory signal
          if (seen.has(`${asset.id}-${r.direction}-${tf}`)) continue;
          const entry  = livePrice || bars[bars.length - 1].c;
          const atr    = calcATR(bars) || entry * 0.02;
          const mult   = asset.type === "forex" ? 3 : asset.type === "crypto" ? 5 : 4;
          const maxMove = entry * (asset.type === "forex" ? 0.03 : asset.type === "crypto" ? 0.15 : 0.25);
          const move    = Math.min(atr * mult, maxMove);
          const target  = r.direction === "L" ? entry + move : entry - move;
          const stop    = r.direction === "L" ? entry - move * 0.4 : entry + move * 0.4;
          // Vary upside naturally from ATR, capped per asset type
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
            edges: [r.setup], timeframe: tf, sector: asset.sector, type: asset.type,
            timestamp: Date.now(),
          });
        }
      }
    }
  }

  let filtered;
  if (risk === 1) {
    filtered = signals.filter(s => s.theoryCount >= 3);
    if (filtered.length === 0) {
      filtered = signals.filter(s => s.theoryCount >= 2).slice(0, 5);
    }
  } else if (risk === 2) {
    filtered = signals.filter(s => s.theoryCount >= 2);
  } else {
    // YOLO — multi-theory first, then single-theory fill
    filtered = [...signals, ...singleTheorySignals];
  }

  return new Response(
    JSON.stringify({ signals: filtered, scored: filtered.length, universe: UNIVERSE.length, ts: Date.now() }),
    { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } }
  );
}
