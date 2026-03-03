export const config = { runtime: 'edge' };

// ── EXPANDED UNIVERSE (120+ stocks) ──────────────────────────────────────────
const UNIVERSE = [

  // ── AI & MACHINE LEARNING ─────────────────────────────────────────────────
  { id:"SOUN",  name:"SoundHound AI",     sector:"AI",         float:280,  shortPct:18, tier:2, exchange:"US" },
  { id:"BBAI",  name:"BigBear.ai",        sector:"AI",         float:45,   shortPct:22, tier:3, exchange:"US" },
  { id:"AITX",  name:"AI Technology",     sector:"AI",         float:8,    shortPct:5,  tier:3, exchange:"US" },
  { id:"AIXI",  name:"Xiao-I Corp",       sector:"AI",         float:4,    shortPct:3,  tier:3, exchange:"US" },
  { id:"URGN",  name:"UroGen Pharma",     sector:"AI/Health",  float:22,   shortPct:8,  tier:3, exchange:"US" },
  { id:"GFAI",  name:"Guardforce AI",     sector:"AI",         float:4,    shortPct:4,  tier:3, exchange:"US" },
  { id:"AGFY",  name:"Agrify Corp",       sector:"AI/Agri",    float:6,    shortPct:6,  tier:3, exchange:"US" },
  { id:"UPST",  name:"Upstart Holdings",  sector:"AI/Fintech", float:75,   shortPct:28, tier:2, exchange:"US" },
  { id:"AI",    name:"C3.ai",             sector:"AI",         float:195,  shortPct:16, tier:2, exchange:"US" },
  { id:"MTTR",  name:"Matterport",        sector:"AI/3D",      float:290,  shortPct:12, tier:2, exchange:"US" },

  // ── QUANTUM COMPUTING ─────────────────────────────────────────────────────
  { id:"IONQ",  name:"IonQ",              sector:"Quantum",    float:32,   shortPct:19, tier:3, exchange:"US" },
  { id:"RGTI",  name:"Rigetti Computing", sector:"Quantum",    float:18,   shortPct:24, tier:3, exchange:"US" },
  { id:"QUBT",  name:"Quantum Computing", sector:"Quantum",    float:8,    shortPct:12, tier:3, exchange:"US" },
  { id:"QBTS",  name:"D-Wave Quantum",    sector:"Quantum",    float:120,  shortPct:21, tier:2, exchange:"US" },
  { id:"ARQQ",  name:"Arqit Quantum",     sector:"Quantum",    float:14,   shortPct:9,  tier:3, exchange:"US" },

  // ── SPACE & DEFENCE ───────────────────────────────────────────────────────
  { id:"RKLB",  name:"Rocket Lab",        sector:"Space",      float:195,  shortPct:11, tier:2, exchange:"US" },
  { id:"LUNR",  name:"Intuitive Machines",sector:"Space",      float:22,   shortPct:17, tier:3, exchange:"US" },
  { id:"RDW",   name:"Redwire Corp",      sector:"Space",      float:15,   shortPct:9,  tier:3, exchange:"US" },
  { id:"ASTS",  name:"AST SpaceMobile",   sector:"Space",      float:55,   shortPct:22, tier:3, exchange:"US" },
  { id:"MNTS",  name:"Momentus Inc",      sector:"Space",      float:8,    shortPct:6,  tier:3, exchange:"US" },
  { id:"ASTR",  name:"Astra Space",       sector:"Space",      float:12,   shortPct:8,  tier:3, exchange:"US" },
  { id:"SPIR",  name:"Spire Global",      sector:"Space",      float:38,   shortPct:7,  tier:3, exchange:"US" },
  { id:"BWXT",  name:"BWX Technologies",  sector:"Defence",    float:85,   shortPct:4,  tier:1, exchange:"US" },
  { id:"RCAT",  name:"Red Cat Holdings",  sector:"Drone",      float:6,    shortPct:7,  tier:3, exchange:"US" },
  { id:"AVAV",  name:"AeroVironment",     sector:"Drone/Def",  float:35,   shortPct:9,  tier:2, exchange:"US" },

  // ── BIOTECH & CLINICAL TRIALS ─────────────────────────────────────────────
  { id:"SAVA",  name:"Cassava Sciences",  sector:"Biotech",    float:28,   shortPct:42, tier:3, exchange:"US" },
  { id:"ACST",  name:"Acasti Pharma",     sector:"Biotech",    float:5,    shortPct:4,  tier:3, exchange:"US" },
  { id:"ATNF",  name:"180 Life Sciences", sector:"Biotech",    float:4,    shortPct:3,  tier:3, exchange:"US" },
  { id:"BNGO",  name:"Bionano Genomics",  sector:"Biotech",    float:180,  shortPct:14, tier:2, exchange:"US" },
  { id:"CLOV",  name:"Clover Health",     sector:"Health",     float:140,  shortPct:14, tier:2, exchange:"US" },
  { id:"CYTO",  name:"Altamira Therap",   sector:"Biotech",    float:3,    shortPct:2,  tier:3, exchange:"US" },
  { id:"GTHX",  name:"G1 Therapeutics",  sector:"Biotech",    float:22,   shortPct:16, tier:3, exchange:"US" },
  { id:"IMVT",  name:"Immunovant",        sector:"Biotech",    float:95,   shortPct:11, tier:2, exchange:"US" },
  { id:"NKTR",  name:"Nektar Therapeutics",sector:"Biotech",   float:165,  shortPct:18, tier:2, exchange:"US" },
  { id:"OCGN",  name:"Ocugen",            sector:"Biotech",    float:95,   shortPct:12, tier:2, exchange:"US" },
  { id:"SEEL",  name:"Seelos Biosci",     sector:"Biotech",    float:8,    shortPct:5,  tier:3, exchange:"US" },
  { id:"TXMD",  name:"TherapeuticsMD",    sector:"Biotech",    float:35,   shortPct:8,  tier:3, exchange:"US" },
  { id:"VNET",  name:"21Vianet Group",    sector:"Biotech/Tech",float:55,  shortPct:9,  tier:2, exchange:"US" },

  // ── CLEAN ENERGY & EV ─────────────────────────────────────────────────────
  { id:"NKLA",  name:"Nikola Corp",       sector:"EV",         float:280,  shortPct:32, tier:2, exchange:"US" },
  { id:"FFIE",  name:"Faraday Future",    sector:"EV",         float:14,   shortPct:28, tier:3, exchange:"US" },
  { id:"MULN",  name:"Mullen Automotive", sector:"EV",         float:18,   shortPct:22, tier:3, exchange:"US" },
  { id:"ACHR",  name:"Archer Aviation",   sector:"eVTOL",      float:45,   shortPct:21, tier:3, exchange:"US" },
  { id:"JOBY",  name:"Joby Aviation",     sector:"eVTOL",      float:120,  shortPct:14, tier:2, exchange:"US" },
  { id:"BLNK",  name:"Blink Charging",    sector:"EV Infra",   float:45,   shortPct:24, tier:3, exchange:"US" },
  { id:"CHPT",  name:"ChargePoint",       sector:"EV Infra",   float:380,  shortPct:18, tier:2, exchange:"US" },
  { id:"GOEV",  name:"Canoo",             sector:"EV",         float:22,   shortPct:14, tier:3, exchange:"US" },
  { id:"RIDE",  name:"Lordstown Motors",  sector:"EV",         float:18,   shortPct:11, tier:3, exchange:"US" },
  { id:"SOLO",  name:"ElectraMeccanica",  sector:"EV",         float:28,   shortPct:8,  tier:3, exchange:"US" },
  { id:"WKHS",  name:"Workhorse Group",   sector:"EV",         float:55,   shortPct:16, tier:2, exchange:"US" },
  { id:"BE",    name:"Bloom Energy",      sector:"Clean Energy",float:195,  shortPct:12, tier:2, exchange:"US" },
  { id:"FCEL",  name:"FuelCell Energy",   sector:"Clean Energy",float:95,   shortPct:22, tier:2, exchange:"US" },
  { id:"PLUG",  name:"Plug Power",        sector:"Hydrogen",   float:480,  shortPct:19, tier:2, exchange:"US" },
  { id:"RUN",   name:"Sunrun",            sector:"Solar",      float:195,  shortPct:16, tier:2, exchange:"US" },

  // ── CRYPTO-ADJACENT ───────────────────────────────────────────────────────
  { id:"MARA",  name:"Marathon Digital",  sector:"BTC Miner",  float:180,  shortPct:22, tier:2, exchange:"US" },
  { id:"RIOT",  name:"Riot Platforms",    sector:"BTC Miner",  float:220,  shortPct:18, tier:2, exchange:"US" },
  { id:"CIFR",  name:"Cipher Mining",     sector:"BTC Miner",  float:28,   shortPct:14, tier:3, exchange:"US" },
  { id:"IREN",  name:"Iris Energy",       sector:"BTC Miner",  float:35,   shortPct:16, tier:3, exchange:"US" },
  { id:"BTBT",  name:"Bit Brother",       sector:"BTC Miner",  float:12,   shortPct:8,  tier:3, exchange:"US" },
  { id:"HUT",   name:"Hut 8 Mining",      sector:"BTC Miner",  float:40,   shortPct:11, tier:3, exchange:"US" },
  { id:"CLSK",  name:"CleanSpark",        sector:"BTC Miner",  float:95,   shortPct:20, tier:2, exchange:"US" },
  { id:"COIN",  name:"Coinbase",          sector:"Crypto Exch",float:240,  shortPct:12, tier:2, exchange:"US" },
  { id:"HOOD",  name:"Robinhood",         sector:"Crypto/Stock",float:480,  shortPct:8,  tier:2, exchange:"US" },
  { id:"MSTR",  name:"MicroStrategy",     sector:"BTC Treasury",float:95,  shortPct:28, tier:2, exchange:"US" },
  { id:"BTCS",  name:"BTCS Inc",          sector:"Crypto",     float:5,    shortPct:6,  tier:3, exchange:"US" },
  { id:"SATO",  name:"Cipher Mining B",   sector:"BTC Miner",  float:8,    shortPct:5,  tier:3, exchange:"US" },

  // ── CYBERSECURITY ─────────────────────────────────────────────────────────
  { id:"BGSF",  name:"BG Staffing",       sector:"Cyber/Tech", float:12,   shortPct:6,  tier:3, exchange:"US" },
  { id:"CYBE",  name:"CyberArk",          sector:"Cyber",      float:45,   shortPct:8,  tier:2, exchange:"US" },
  { id:"SFNC",  name:"Simmons Financial", sector:"Fintech",    float:55,   shortPct:4,  tier:2, exchange:"US" },
  { id:"QLYS",  name:"Qualys",            sector:"Cyber",      float:38,   shortPct:9,  tier:2, exchange:"US" },
  { id:"VRNS",  name:"Varonis Systems",   sector:"Cyber",      float:95,   shortPct:7,  tier:2, exchange:"US" },
  { id:"NCPL",  name:"Netcapital",        sector:"Fintech",    float:3,    shortPct:2,  tier:3, exchange:"US" },
  { id:"ZCMD",  name:"Zhongchuan Intl",   sector:"Cyber/EM",   float:4,    shortPct:3,  tier:3, exchange:"US" },
  { id:"PCYG",  name:"Park City Group",   sector:"Cyber",      float:6,    shortPct:2,  tier:3, exchange:"US" },

  // ── EMERGING MARKETS (ADRs on US exchanges) ───────────────────────────────
  { id:"TIGR",  name:"UP Fintech",        sector:"EM/Fintech", float:45,   shortPct:8,  tier:3, exchange:"ADR" },
  { id:"FUTU",  name:"Futu Holdings",     sector:"EM/Fintech", float:55,   shortPct:22, tier:2, exchange:"ADR" },
  { id:"BEKE",  name:"KE Holdings",       sector:"EM/Property",float:280,  shortPct:6,  tier:2, exchange:"ADR" },
  { id:"XPEV",  name:"XPeng Motors",      sector:"EM/EV",      float:680,  shortPct:14, tier:2, exchange:"ADR" },
  { id:"LI",    name:"Li Auto",           sector:"EM/EV",      float:780,  shortPct:9,  tier:2, exchange:"ADR" },
  { id:"NIO",   name:"NIO Inc",           sector:"EM/EV",      float:1680, shortPct:11, tier:1, exchange:"ADR" },
  { id:"TBLA",  name:"Taboola",           sector:"EM/AdTech",  float:85,   shortPct:7,  tier:2, exchange:"ADR" },
  { id:"WIX",   name:"Wix.com",           sector:"EM/SaaS",    float:55,   shortPct:6,  tier:2, exchange:"ADR" },
  { id:"NUVL",  name:"Nuvalent",          sector:"EM/Biotech", float:45,   shortPct:8,  tier:3, exchange:"ADR" },
  { id:"TPVG",  name:"TriplePoint Venture",sector:"EM/VC",     float:28,   shortPct:5,  tier:3, exchange:"ADR" },
  { id:"VMAR",  name:"Vision Marine",     sector:"EM/Marine",  float:4,    shortPct:3,  tier:3, exchange:"ADR" },
  { id:"BIMI",  name:"BIMI International",sector:"EM/Health",  float:3,    shortPct:2,  tier:3, exchange:"ADR" },
  { id:"MTLS",  name:"Materialise",       sector:"EM/3D Print",float:22,   shortPct:6,  tier:3, exchange:"ADR" },
  { id:"SHOP",  name:"Shopify",           sector:"EM/eComm",   float:1280, shortPct:5,  tier:1, exchange:"ADR" },

  // ── SMCI / MID-CAP TECH ───────────────────────────────────────────────────
  { id:"SMCI",  name:"Super Micro",       sector:"AI Server",  float:50,   shortPct:12, tier:2, exchange:"US" },
  { id:"AFRM",  name:"Affirm Holdings",   sector:"Fintech",    float:290,  shortPct:15, tier:2, exchange:"US" },
  { id:"SOFI",  name:"SoFi Technologies", sector:"Fintech",    float:850,  shortPct:9,  tier:2, exchange:"US" },
  { id:"DAVE",  name:"Dave Inc",          sector:"Fintech",    float:9,    shortPct:6,  tier:3, exchange:"US" },
  { id:"MAPS",  name:"WM Technology",     sector:"Cannabis",   float:38,   shortPct:8,  tier:3, exchange:"US" },
  { id:"SNDL",  name:"SNDL Inc",          sector:"Cannabis",   float:220,  shortPct:10, tier:2, exchange:"US" },
  { id:"KULR",  name:"KULR Technology",   sector:"Energy",     float:8,    shortPct:6,  tier:3, exchange:"US" },
  { id:"NXPL",  name:"NextPlat Corp",     sector:"Tech",       float:2,    shortPct:2,  tier:3, exchange:"US" },
  { id:"OPEN",  name:"Opendoor Tech",     sector:"PropTech",   float:480,  shortPct:14, tier:2, exchange:"US" },
  { id:"SPCE",  name:"Virgin Galactic",   sector:"Space",      float:95,   shortPct:18, tier:2, exchange:"US" },
  { id:"CURI",  name:"CuriosityStream",   sector:"Media",      float:22,   shortPct:8,  tier:3, exchange:"US" },
  { id:"GENI",  name:"Genius Sports",     sector:"Sports/Data",float:45,   shortPct:9,  tier:3, exchange:"US" },
  { id:"XELA",  name:"Exela Technologies",sector:"Tech",       float:28,   shortPct:16, tier:3, exchange:"US" },
  { id:"BITF",  name:"Bitfarms",          sector:"BTC Miner",  float:95,   shortPct:14, tier:2, exchange:"US" },
  { id:"HIVE",  name:"HIVE Digital",      sector:"BTC Miner",  float:45,   shortPct:12, tier:3, exchange:"US" },
  { id:"WULF",  name:"TeraWulf",          sector:"BTC Miner",  float:55,   shortPct:18, tier:3, exchange:"US" },

  // ── CRYPTO MAJORS ─────────────────────────────────────────────────────────
  { id:"BTCUSD", name:"BTC/USD",   sector:"Crypto Major", float:999, shortPct:0, tier:1, exchange:"CR", alpaca:"BTC/USD" },
  { id:"ETHUSD", name:"ETH/USD",   sector:"Crypto Major", float:999, shortPct:0, tier:1, exchange:"CR", alpaca:"ETH/USD" },
  { id:"SOLUSD", name:"SOL/USD",   sector:"Crypto Major", float:999, shortPct:0, tier:2, exchange:"CR", alpaca:"SOL/USD" },
  { id:"BNBUSD", name:"BNB/USD",   sector:"Crypto Major", float:999, shortPct:0, tier:2, exchange:"CR", alpaca:"BNB/USD" },

  // ── CRYPTO MID-CAPS ───────────────────────────────────────────────────────
  { id:"AVAXUSD", name:"AVAX/USD", sector:"Crypto Mid",   float:999, shortPct:0, tier:2, exchange:"CR", alpaca:"AVAX/USD" },
  { id:"LINKUSD", name:"LINK/USD", sector:"Crypto Mid",   float:999, shortPct:0, tier:2, exchange:"CR", alpaca:"LINK/USD" },
  { id:"DOTUSD",  name:"DOT/USD",  sector:"Crypto Mid",   float:999, shortPct:0, tier:2, exchange:"CR", alpaca:"DOT/USD"  },
  { id:"MATICUSD",name:"MATIC/USD",sector:"Crypto Mid",   float:999, shortPct:0, tier:2, exchange:"CR", alpaca:"MATIC/USD"},

  // ── CRYPTO SMALL / MEME ───────────────────────────────────────────────────
  { id:"PEPEUSD", name:"PEPE/USD", sector:"Meme Coin",    float:999, shortPct:0, tier:3, exchange:"CR", alpaca:"PEPE/USD" },
  { id:"DOGEUSD", name:"DOGE/USD", sector:"Meme Coin",    float:999, shortPct:0, tier:2, exchange:"CR", alpaca:"DOGE/USD" },
  { id:"SHIBUSD", name:"SHIB/USD", sector:"Meme Coin",    float:999, shortPct:0, tier:3, exchange:"CR", alpaca:"SHIB/USD" },

  // ── FOREX MAJOR PAIRS ─────────────────────────────────────────────────────
  { id:"EURUSD", name:"EUR/USD",   sector:"Forex Major",  float:999, shortPct:0, tier:1, exchange:"FX" },
  { id:"GBPUSD", name:"GBP/USD",   sector:"Forex Major",  float:999, shortPct:0, tier:1, exchange:"FX" },
  { id:"USDJPY", name:"USD/JPY",   sector:"Forex Major",  float:999, shortPct:0, tier:1, exchange:"FX" },
  { id:"AUDUSD", name:"AUD/USD",   sector:"Forex Major",  float:999, shortPct:0, tier:1, exchange:"FX" },
  { id:"USDCAD", name:"USD/CAD",   sector:"Forex Major",  float:999, shortPct:0, tier:1, exchange:"FX" },
  { id:"USDCHF", name:"USD/CHF",   sector:"Forex Major",  float:999, shortPct:0, tier:1, exchange:"FX" },

  // ── FOREX MINOR PAIRS ─────────────────────────────────────────────────────
  { id:"EURGBP", name:"EUR/GBP",   sector:"Forex Minor",  float:999, shortPct:0, tier:1, exchange:"FX" },
  { id:"GBPJPY", name:"GBP/JPY",   sector:"Forex Minor",  float:999, shortPct:0, tier:2, exchange:"FX" },
  { id:"EURJPY", name:"EUR/JPY",   sector:"Forex Minor",  float:999, shortPct:0, tier:2, exchange:"FX" },
  { id:"AUDNZD", name:"AUD/NZD",   sector:"Forex Minor",  float:999, shortPct:0, tier:2, exchange:"FX" },
  { id:"CADJPY", name:"CAD/JPY",   sector:"Forex Minor",  float:999, shortPct:0, tier:2, exchange:"FX" },

  // ── FOREX EXOTIC PAIRS ────────────────────────────────────────────────────
  { id:"USDTRY", name:"USD/TRY",   sector:"Forex Exotic", float:999, shortPct:0, tier:3, exchange:"FX" },
  { id:"USDZAR", name:"USD/ZAR",   sector:"Forex Exotic", float:999, shortPct:0, tier:3, exchange:"FX" },
  { id:"USDMXN", name:"USD/MXN",   sector:"Forex Exotic", float:999, shortPct:0, tier:3, exchange:"FX" },
  { id:"USDBRL", name:"USD/BRL",   sector:"Forex Exotic", float:999, shortPct:0, tier:3, exchange:"FX" },
  { id:"USDSGD", name:"USD/SGD",   sector:"Forex Exotic", float:999, shortPct:0, tier:2, exchange:"FX" },
];

// ── ASSET KEYWORDS ────────────────────────────────────────────────────────────
const KEYWORDS = {
  SOUN:"soundhound,sound hound", BBAI:"bigbear,big bear ai", UPST:"upstart",
  AI:"c3.ai,c3 ai", IONQ:"ionq", RGTI:"rigetti", QUBT:"quantum computing inc",
  QBTS:"d-wave,dwave", RKLB:"rocket lab", LUNR:"intuitive machines",
  ASTS:"ast spacemobile,ast space", MARA:"marathon digital,mara",
  RIOT:"riot platforms,riot blockchain", CIFR:"cipher mining",
  IREN:"iris energy", CLSK:"cleanspark", COIN:"coinbase",
  MSTR:"microstrategy,michael saylor", NKLA:"nikola", FFIE:"faraday future",
  MULN:"mullen automotive", ACHR:"archer aviation", JOBY:"joby aviation",
  BLNK:"blink charging", CHPT:"chargepoint", PLUG:"plug power",
  FCEL:"fuelcell", SAVA:"cassava sciences", BNGO:"bionano",
  IMVT:"immunovant", OCGN:"ocugen", FUTU:"futu holdings",
  XPEV:"xpeng", NIO:"nio", LI:"li auto", SMCI:"super micro,supermicro",
  AFRM:"affirm", SOFI:"sofi", DAVE:"dave inc", SPCE:"virgin galactic",
  IONQ:"ionq", OPEN:"opendoor", BITF:"bitfarms", WULF:"terawulf",
  HIVE:"hive digital", HOOD:"robinhood", GENI:"genius sports",
};

function getKeywords(asset) {
  const kw = KEYWORDS[asset.id] || "";
  const base = [asset.id.toLowerCase(), asset.name.toLowerCase().split(" ")[0]];
  return [...base, ...kw.split(",").filter(Boolean)];
}

// ── SCORING (same engine, wider universe) ─────────────────────────────────────
function scoreNewsCatalyst(asset, news) {
  const keywords = getKeywords(asset);
  const relevant = news.filter(n => {
    const t = (n.headline + " " + (n.summary || "")).toLowerCase();
    return keywords.some(k => k && t.includes(k));
  });
  const bullWords = ["surges","jumps","soars","beats","wins","record","launches","partnership","contract","approved","upgrade","bullish","rally","breakthrough","fda","ipo"];
  const bearWords = ["crashes","plunges","drops","fraud","sec","delisted","bankrupt","miss","cuts","halt","investigation","lawsuit","warning"];
  const strong = relevant.filter(n => {
    const t = n.headline.toLowerCase();
    return bullWords.some(w => t.includes(w)) || bearWords.some(w => t.includes(w));
  });
  return { found: strong.length > 0, headlines: strong.slice(0,2).map(n => n.headline), strength: Math.min(3, strong.length) };
}

function scoreLowFloat(asset, bars) {
  if (asset.exchange === "FX" || asset.exchange === "CR") return null;
  if (asset.float > 100) return null;
  if (asset.float <= 5)   return { label:`${asset.float}M float — ultra micro`, strength:3 };
  if (asset.float <= 20)  return { label:`${asset.float}M float — micro cap`, strength:2 };
  if (asset.float <= 100) return { label:`${asset.float}M float — low float`, strength:1 };
  return null;
}

function scoreShortSqueeze(asset, bars, hasNews) {
  if (asset.exchange === "FX" || asset.exchange === "CR") return null;
  if (asset.shortPct < 10) return null;
  let strength = asset.shortPct >= 25 ? 3 : asset.shortPct >= 15 ? 2 : 1;
  const reasons = [`${asset.shortPct}% short interest`];
  if (asset.float <= 50) { strength++; reasons.push("low float amplifier"); }
  if (hasNews)           { strength++; reasons.push("catalyst present"); }
  if (bars?.length >= 3) {
    if (bars[bars.length-1].c > bars[bars.length-3].c) { strength++; reasons.push("price rising"); }
  }
  return strength >= 2 ? { label: reasons.join(", "), strength: Math.min(strength, 4) } : null;
}

function detectEarningsSurprise(bars) {
  if (!bars || bars.length < 2) return null;
  for (let i = 1; i < Math.min(bars.length, 10); i++) {
    const gap = Math.abs(bars[i].o - bars[i-1].c) / bars[i-1].c * 100;
    if (gap >= 8) return { gap: gap.toFixed(1), dir: bars[i].o > bars[i-1].c ? "up" : "down" };
  }
  return null;
}

function scoreUnusualVolume(bars) {
  if (!bars || bars.length < 3) return null;
  const latest = bars[bars.length-1].v;
  const avg    = bars.slice(0,-1).reduce((s,b) => s+b.v, 0) / (bars.length-1);
  const ratio  = latest / Math.max(avg, 1);
  if (ratio >= 5)   return { label:`${ratio.toFixed(1)}x avg volume — extreme spike`, strength:3 };
  if (ratio >= 2.5) return { label:`${ratio.toFixed(1)}x avg volume — elevated`, strength:2 };
  return null;
}

async function fetchInsiderBuys(symbols) {
  const map = {};
  try {
    const url = `https://efts.sec.gov/LATEST/search-index?q=%22transaction+code%22+%22P%22&dateRange=custom&startdt=${daysAgo(7)}&enddt=${today()}&forms=4`;
    const r = await fetch(url, { headers:{ "User-Agent":"Sentinel/1.0 sentinel@terminus.app" } });
    const text = await r.text();
    for (const sym of symbols) {
      if (text.toLowerCase().includes(sym.toLowerCase())) map[sym] = true;
    }
  } catch {}
  return map;
}

function buildSignal(asset, edges, bars, news) {
  const total   = edges.reduce((s,e) => s + (e.strength||1), 0);
  const latest  = bars?.length ? bars[bars.length-1] : null;
  const price   = latest ? latest.c : 10;
  const bearWords = ["crashes","fraud","delisted","sec investigation","bankrupt","halt"];
  const isBull  = !news.some(n => bearWords.some(w => n.headline.toLowerCase().includes(w)));
  const base    = asset.exchange === "FX" ? 8
              : asset.exchange === "CR" ? (asset.sector.includes("Meme") ? 120 : asset.sector.includes("Mid") ? 45 : 25)
              : asset.float <= 5 ? 120 : asset.float <= 20 ? 75 : asset.float <= 100 ? 40 : 18;
  const upside  = Math.round(base * (1 + total * 0.1) * (0.9 + Math.random()*0.2));
  const stopPct = asset.float <= 10 ? 0.12 : asset.float <= 50 ? 0.08 : 0.05;
  const tgtPct  = upside / 100;
  const entry   = price;
  const target  = isBull ? price*(1+tgtPct) : price*(1-tgtPct);
  const stop    = isBull ? price*(1-stopPct) : price*(1+stopPct);
  const rr      = parseFloat((tgtPct/stopPct).toFixed(1));
  const conf    = Math.min(93, 45 + total*6 + Math.floor(Math.random()*8));
  const ttg     = asset.float <= 10 ? "hours–1d" : asset.float <= 50 ? "1–3d" : "2–5d";
  const catalysts = [
    `${edges.length} edge${edges.length>1?"s":""} detected: ${edges.map(e=>e.name).join(", ")}`,
    ...edges.map(e=>e.detail),
    ...news.slice(0,2).map(n=>n.headline),
  ].filter(Boolean).slice(0,5);

  return {
    id:`${asset.id}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    tid:asset.id, name:asset.name,
    instrument:`${asset.sector} · $${asset.float}M float · ${asset.exchange}`,
    tier:asset.tier, direction:isBull?"L":"S",
    entry, target, stop, upside, riskReward:rr, confidence:conf,
    catalystScore:Math.min(10, 3+Math.floor(total*1.2)),
    timeToTarget:ttg, catalysts,
    edgeScore:total, edges:edges.map(e=>e.name),
    shortPct:asset.shortPct, float:asset.float, sector:asset.sector,
    timestamp:Date.now(),
  };
}

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers:{ "Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, OPTIONS" } });
  }

  const apiKey    = process.env.ALPACA_API_KEY;
  const apiSecret = process.env.ALPACA_API_SECRET;
  const risk      = parseInt(new URL(req.url).searchParams.get("risk")||"2");
  const tierMap   = { 1:[1,2], 2:[1,2,3], 3:[2,3] };
  const tiers     = tierMap[risk]||[1,2,3];
  const pool      = UNIVERSE.filter(a => tiers.includes(a.tier));

  // Fetch news
  let news = [];
  if (apiKey && apiSecret) {
    try {
      const syms = pool.slice(0,50).map(a=>a.id).join(",");
      const nr = await fetch(
        `https://data.alpaca.markets/v1beta1/news?limit=50&sort=desc&symbols=${encodeURIComponent(syms)}`,
        { headers:{ "APCA-API-KEY-ID":apiKey,"APCA-API-SECRET-KEY":apiSecret } }
      );
      news = (await nr.json()).news || [];
    } catch {}
  }

  // Fetch bars
  const barsMap = {};
  if (apiKey && apiSecret) {
    try {
      const syms  = pool.filter(a=>a.exchange==="US"||a.exchange==="ADR").map(a=>a.id).join(",");
      const start = new Date(Date.now()-7*24*60*60*1000).toISOString();
      const end   = new Date().toISOString();
      const br = await fetch(
        `https://data.alpaca.markets/v2/stocks/bars?symbols=${encodeURIComponent(syms)}&timeframe=1D&start=${start}&end=${end}&limit=10&feed=iex`,
        { headers:{ "APCA-API-KEY-ID":apiKey,"APCA-API-SECRET-KEY":apiSecret } }
      );
      const bd = await br.json();
      if (bd.bars) Object.assign(barsMap, bd.bars);
    } catch {}
  }

  // Fetch crypto bars
  if (apiKey && apiSecret) {
    const cryptoAssets = pool.filter(a => a.exchange === "CR" && a.alpaca);
    if (cryptoAssets.length) {
      try {
        const syms  = cryptoAssets.map(a => a.alpaca).join(",");
        const start = new Date(Date.now()-7*24*60*60*1000).toISOString();
        const end   = new Date().toISOString();
        const br = await fetch(
          `https://data.alpaca.markets/v1beta3/crypto/us/bars?symbols=${encodeURIComponent(syms)}&timeframe=1Day&start=${start}&end=${end}&limit=10`,
          { headers:{ "APCA-API-KEY-ID":apiKey,"APCA-API-SECRET-KEY":apiSecret } }
        );
        const bd = await br.json();
        if (bd.bars) {
          for (const [sym, bars] of Object.entries(bd.bars)) {
            const asset = cryptoAssets.find(a => a.alpaca === sym);
            if (asset) {
              barsMap[asset.id] = bars;
            }
          }
        }
      } catch {}
    }
  }

  // Generate synthetic bars for FX assets (Alpaca free tier doesn't cover forex)
  const FX_PRICES = {
    EURUSD:1.085, GBPUSD:1.265, USDJPY:149.5, AUDUSD:0.635, USDCAD:1.365, USDCHF:0.895,
    EURGBP:0.858, GBPJPY:189.2, EURJPY:162.3, AUDNZD:1.095, CADJPY:109.5,
    USDTRY:32.1, USDZAR:18.7, USDMXN:17.4, USDBRL:5.05, USDSGD:1.345,
  };
  for (const asset of pool.filter(a => a.exchange === "FX")) {
    const base = FX_PRICES[asset.id];
    if (!base) continue;
    // Generate 7 synthetic daily bars with realistic FX volatility
    const vol = base * 0.006;
    const bars = [];
    let price = base * (0.995 + Math.random()*0.01);
    for (let i = 6; i >= 0; i--) {
      const o = price;
      const c = price + (Math.random()-0.48)*vol;
      bars.push({ o, h: Math.max(o,c)+Math.random()*vol*0.5, l: Math.min(o,c)-Math.random()*vol*0.5, c, v: Math.floor(1e9 + Math.random()*1e9) });
      price = c;
    }
    barsMap[asset.id] = bars;
  }

  // Insider data
  const insiderMap = await fetchInsiderBuys(pool.map(a=>a.id));

  // Score every asset
  const signals = [];
  for (const asset of pool) {
    const bars      = barsMap[asset.id] || null;
    const assetNews = news.filter(n=>(n.symbols||[]).includes(asset.id));
    const edges     = [];

    const newsCat = scoreNewsCatalyst(asset, news);
    if (newsCat.found) edges.push({ name:"NEWS", detail:newsCat.headlines[0]||"Strong catalyst", strength:newsCat.strength });

    const floatScore = scoreLowFloat(asset, bars);
    if (floatScore) edges.push({ name:"LOW FLOAT", detail:floatScore.label, strength:floatScore.strength });

    const squeeze = scoreShortSqueeze(asset, bars, newsCat.found);
    if (squeeze) edges.push({ name:"SQUEEZE", detail:squeeze.label, strength:squeeze.strength });

    const earnings = detectEarningsSurprise(bars);
    if (earnings) edges.push({ name:"EARNINGS GAP", detail:`${earnings.gap}% gap ${earnings.dir}`, strength:2 });

    const vol = scoreUnusualVolume(bars);
    if (vol) edges.push({ name:"UNUSUAL VOL", detail:vol.label, strength:vol.strength });

    if (insiderMap[asset.id]) edges.push({ name:"INSIDER BUY", detail:"Form 4 purchase — last 7 days", strength:2 });

    // For FX/CR — add momentum edge based on price action
    if (asset.exchange === "FX" || asset.exchange === "CR") {
      if (bars && bars.length >= 4) {
        const last = bars[bars.length-1].c;
        const prev = bars[bars.length-4].c;
        const pct  = Math.abs((last-prev)/prev*100);
        if (pct >= 2) edges.push({ name:"MOMENTUM", detail:`${pct.toFixed(1)}% move in 3 bars`, strength: pct >= 5 ? 2 : 1 });
      }
      // Always include FX/CR if strong news exists
      if (newsCat.found && edges.length >= 1) {
        signals.push(buildSignal(asset, edges, bars, assetNews));
        continue;
      }
    }

    if (edges.length >= 2) signals.push(buildSignal(asset, edges, bars, assetNews));
  }

  // Fallback if too few signals
  let final = signals;
  if (signals.length < 4) {
    const extras = pool
      .filter(a => !signals.find(s=>s.tid===a.id))
      .sort((a,b) => (b.shortPct + (200-b.float)/20) - (a.shortPct + (200-a.float)/20))
      .slice(0, 8-signals.length)
      .map(asset => {
        const bars = barsMap[asset.id]||null;
        const assetNews = news.filter(n=>(n.symbols||[]).includes(asset.id));
        const fe = [];
        if (asset.float <= 30)    fe.push({ name:"LOW FLOAT", detail:`${asset.float}M float`, strength:2 });
        if (asset.shortPct >= 15) fe.push({ name:"SQUEEZE", detail:`${asset.shortPct}% short interest`, strength:2 });
        if (fe.length < 2)        fe.push({ name:"WATCHLIST", detail:"High potential candidate", strength:1 });
        return buildSignal(asset, fe, bars, assetNews);
      });
    final = [...signals, ...extras];
  }

  final.sort((a,b) => b.upside - a.upside);

  return new Response(JSON.stringify({ signals:final, scored:final.length, universe:pool.length, ts:Date.now() }), {
    status:200,
    headers:{ "Content-Type":"application/json","Access-Control-Allow-Origin":"*","Cache-Control":"s-maxage=120, stale-while-revalidate=60" },
  });
}

function today()     { return new Date().toISOString().split("T")[0]; }
function daysAgo(n)  { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split("T")[0]; }
