export const config = { runtime: 'edge' };

// ── SUPPORT/RESISTANCE ENGINE ─────────────────────────────────────────────────
// Finds real S/R levels from recent price history using pivot point method
function findSRLevels(bars) {
  if (!bars || bars.length < 5) return { support: null, resistance: null };

  // Find swing highs and lows (pivot points)
  const pivotHighs = [];
  const pivotLows  = [];

  for (let i = 2; i < bars.length - 2; i++) {
    const isSwingHigh = bars[i].h > bars[i-1].h && bars[i].h > bars[i-2].h &&
                        bars[i].h > bars[i+1].h && bars[i].h > bars[i+2].h;
    const isSwingLow  = bars[i].l < bars[i-1].l && bars[i].l < bars[i-2].l &&
                        bars[i].l < bars[i+1].l && bars[i].l < bars[i+2].l;
    if (isSwingHigh) pivotHighs.push(bars[i].h);
    if (isSwingLow)  pivotLows.push(bars[i].l);
  }

  const currentPrice = bars[bars.length - 1].c;

  // Find nearest resistance above current price
  const resistanceLevels = pivotHighs
    .filter(h => h > currentPrice)
    .sort((a, b) => a - b);

  // Find nearest support below current price
  const supportLevels = pivotLows
    .filter(l => l < currentPrice)
    .sort((a, b) => b - a);

  // Also consider recent range high/low as S/R
  const rangeHigh = Math.max(...bars.slice(-20).map(b => b.h));
  const rangeLow  = Math.min(...bars.slice(-20).map(b => b.l));

  const resistance = resistanceLevels[0] || rangeHigh;
  const support    = supportLevels[0]    || rangeLow;

  return { support, resistance, pivotHighs, pivotLows };
}

// ── ATR (Average True Range) for volatility context ───────────────────────────
function calculateATR(bars, period = 14) {
  if (!bars || bars.length < period + 1) return null;
  const trValues = [];
  for (let i = 1; i < bars.length; i++) {
    const tr = Math.max(
      bars[i].h - bars[i].l,
      Math.abs(bars[i].h - bars[i-1].c),
      Math.abs(bars[i].l - bars[i-1].c)
    );
    trValues.push(tr);
  }
  const atr = trValues.slice(-period).reduce((s, v) => s + v, 0) / period;
  return atr;
}

// ── PRICE LEVELS BUILDER ──────────────────────────────────────────────────────
function buildPriceLevels(symbol, bars15m, barsDaily) {
  if (!bars15m || bars15m.length === 0) return null;

  const entry = bars15m[bars15m.length - 1].c;
  const atr   = calculateATR(barsDaily || bars15m);

  // Get S/R from daily bars (more significant levels)
  const { support, resistance } = findSRLevels(barsDaily || bars15m);

  // Determine bias from recent momentum
  const recent5 = bars15m.slice(-5);
  const isBull  = recent5[recent5.length-1].c > recent5[0].c;

  let target, stop, upside, rr;

  if (isBull) {
    // Long setup
    target = resistance || entry * 1.08;
    // Stop just below nearest support, or 1.5x ATR below entry
    stop   = support
      ? Math.max(support * 0.995, entry - (atr ? atr * 1.5 : entry * 0.05))
      : entry - (atr ? atr * 1.5 : entry * 0.05);
    upside = Math.round((target - entry) / entry * 100);
    const risk = entry - stop;
    rr     = risk > 0 ? parseFloat(((target - entry) / risk).toFixed(1)) : 0;
  } else {
    // Short setup
    target = support || entry * 0.92;
    stop   = resistance
      ? Math.min(resistance * 1.005, entry + (atr ? atr * 1.5 : entry * 0.05))
      : entry + (atr ? atr * 1.5 : entry * 0.05);
    upside = Math.round((entry - target) / entry * 100);
    const risk = stop - entry;
    rr     = risk > 0 ? parseFloat(((entry - target) / risk).toFixed(1)) : 0;
  }

  // Sanity check — if levels are weird, fall back to ATR-based
  if (upside <= 0 || upside > 200 || rr <= 0) {
    const fallbackPct = atr ? (atr / entry) : 0.05;
    target = isBull ? entry * (1 + fallbackPct * 3) : entry * (1 - fallbackPct * 3);
    stop   = isBull ? entry * (1 - fallbackPct * 1.5) : entry * (1 + fallbackPct * 1.5);
    upside = Math.round(fallbackPct * 3 * 100);
    rr     = 2.0;
  }

  return {
    symbol,
    entry:      parseFloat(entry.toFixed(4)),
    target:     parseFloat(target.toFixed(4)),
    stop:       parseFloat(stop.toFixed(4)),
    upside:     Math.max(1, upside),
    riskReward: Math.max(0.5, rr),
    direction:  isBull ? "L" : "S",
    atr:        atr ? parseFloat(atr.toFixed(4)) : null,
    support:    support ? parseFloat(support.toFixed(4)) : null,
    resistance: resistance ? parseFloat(resistance.toFixed(4)) : null,
    ts:         Date.now(),
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
  const url       = new URL(req.url);
  const symbols   = (url.searchParams.get('symbols') || '').split(',').filter(Boolean).slice(0, 20);

  if (!symbols.length) {
    return new Response(JSON.stringify({ error: 'No symbols provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  if (!apiKey || !apiSecret) {
    return new Response(JSON.stringify({ error: 'Alpaca credentials not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const headers = { 'APCA-API-KEY-ID': apiKey, 'APCA-API-SECRET-KEY': apiSecret };
  const now     = new Date();
  const end15m  = now.toISOString();
  const start15m = new Date(now - 2 * 60 * 60 * 1000).toISOString();   // 2hrs of 15min bars
  const startD  = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days daily

  const symsEncoded = encodeURIComponent(symbols.join(','));
  const prices = {};

  try {
    // ── Fetch 15min bars (entry price) ───────────────────────────────────────
    const [r15, rD] = await Promise.all([
      fetch(`https://data.alpaca.markets/v2/stocks/bars?symbols=${symsEncoded}&timeframe=15Min&start=${start15m}&end=${end15m}&limit=20&feed=iex`, { headers }),
      fetch(`https://data.alpaca.markets/v2/stocks/bars?symbols=${symsEncoded}&timeframe=1Day&start=${startD}&end=${end15m}&limit=60&feed=iex`, { headers }),
    ]);

    const [data15, dataD] = await Promise.all([r15.json(), rD.json()]);

    for (const sym of symbols) {
      const bars15m  = data15.bars?.[sym] || [];
      const barsDaily = dataD.bars?.[sym]  || [];
      if (bars15m.length > 0 || barsDaily.length > 0) {
        prices[sym] = buildPriceLevels(sym, bars15m, barsDaily);
      }
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response(JSON.stringify({ prices }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
    },
  });
}
