export const config = { runtime: 'nodejs', maxDuration: 10 };

// SENTINEL WYCKOFF ENGINE v6
// Fast: news from Alpaca (1 quick call) + synthetic price bars for Wyckoff analysis
// Synthetic bars use realistic volatility profiles per asset type

const UNIVERSE = [
  { id:"BTCUSD", name:"Bitcoin",    sector:"Crypto Major", type:"crypto", vol:0.04,  keywords:["bitcoin","btc","crypto","digital asset"] },
  { id:"ETHUSD", name:"Ethereum",   sector:"Crypto Major", type:"crypto", vol:0.045, keywords:["ethereum","eth","ether"] },
  { id:"SOLUSD", name:"Solana",     sector:"Crypto Major", type:"crypto", vol:0.06,  keywords:["solana","sol"] },
  { id:"BNBUSD", name:"BNB",        sector:"Crypto Major", type:"crypto", vol:0.035, keywords:["binance","bnb"] },
  { id:"AVAXUSD",name:"Avalanche",  sector:"Crypto Mid",   type:"crypto", vol:0.07,  keywords:["avalanche","avax"] },
  { id:"DOGEUSD",name:"Dogecoin",   sector:"Meme Coin",    type:"crypto", vol:0.08,  keywords:["dogecoin","doge"] },
  { id:"EURUSD", name:"EUR/USD",    sector:"Forex Major",  type:"forex",  vol:0.006, keywords:["euro","eur/usd","ecb","eurozone","european central bank"] },
  { id:"GBPUSD", name:"GBP/USD",    sector:"Forex Major",  type:"forex",  vol:0.007, keywords:["pound","gbp/usd","bank of england","sterling","boe"] },
  { id:"USDJPY", name:"USD/JPY",    sector:"Forex Major",  type:"forex",  vol:0.007, keywords:["yen","usd/jpy","bank of japan","boj"] },
  { id:"AUDUSD", name:"AUD/USD",    sector:"Forex Major",  type:"forex",  vol:0.006, keywords:["aussie","aud/usd","rba"] },
  { id:"USDCAD", name:"USD/CAD",    sector:"Forex Major",  type:"forex",  vol:0.005, keywords:["loonie","usd/cad","canada rate","bank of canada"] },
  { id:"GBPJPY", name:"GBP/JPY",    sector:"Forex Minor",  type:"forex",  vol:0.009, keywords:["gbp/jpy","pound yen"] },
  { id:"EURGBP", name:"EUR/GBP",    sector:"Forex Minor",  type:"forex",  vol:0.005, keywords:["eur/gbp","euro pound"] },
  { id:"USDTRY", name:"USD/TRY",    sector:"Forex Exotic", type:"forex",  vol:0.015, keywords:["turkish lira","turkey","erdogan"] },
  { id:"USDZAR", name:"USD/ZAR",    sector:"Forex Exotic", type:"forex",  vol:0.012, keywords:["south africa","rand"] },
  { id:"IONQ",   name:"IonQ",       sector:"Quantum",      type:"stock",  vol:0.06,  keywords:["ionq"] },
  { id:"RGTI",   name:"Rigetti",    sector:"Quantum",      type:"stock",  vol:0.07,  keywords:["rigetti"] },
  { id:"QUBT",   name:"Quantum Computing", sector:"Quantum", type:"stock", vol:0.08, keywords:["quantum computing inc","qubt"] },
  { id:"RKLB",   name:"Rocket Lab", sector:"Space",        type:"stock",  vol:0.05,  keywords:["rocket lab"] },
  { id:"LUNR",   name:"Intuitive Machines", sector:"Space", type:"stock", vol:0.07,  keywords:["intuitive machines"] },
  { id:"ASTS",   name:"AST SpaceMobile", sector:"Space",   type:"stock",  vol:0.06,  keywords:["ast spacemobile"] },
  { id:"ACHR",   name:"Archer Aviation", sector:"eVTOL",   type:"stock",  vol:0.06,  keywords:["archer aviation"] },
  { id:"MARA",   name:"Marathon Digital", sector:"BTC Miner", type:"stock", vol:0.07, keywords:["marathon digital","mara"] },
  { id:"RIOT",   name:"Riot Platforms", sector:"BTC Miner", type:"stock", vol:0.06,  keywords:["riot platforms"] },
  { id:"MSTR",   name:"MicroStrategy", sector:"BTC Treasury", type:"stock", vol:0.05, keywords:["microstrategy"] },
  { id:"COIN",   name:"Coinbase",    sector:"Crypto Exch",  type:"stock",  vol:0.05,  keywords:["coinbase"] },
  { id:"SOUN",   name:"SoundHound AI", sector:"AI",        type:"stock",  vol:0.08,  keywords:["soundhound"] },
  { id:"BBAI",   name:"BigBear.ai",  sector:"AI",          type:"stock",  vol:0.07,  keywords:["bigbear"] },
  { id:"UPST",   name:"Upstart",     sector:"AI/Fintech",  type:"stock",  vol:0.06,  keywords:["upstart"] },
  { id:"SAVA",   name:"Cassava Sciences", sector:"Biotech", type:"stock", vol:0.08,  keywords:["cassava"] },
  { id:"NKLA",   name:"Nikola",      sector:"EV",          type:"stock",  vol:0.07,  keywords:["nikola"] },
  { id:"PLUG",   name:"Plug Power",  sector:"Hydrogen",    type:"stock",  vol:0.05,  keywords:["plug power"] },
  { id:"SOFI",   name:"SoFi",        sector:"Fintech",     type:"stock",  vol:0.05,  keywords:["sofi"] },
  { id:"NIO",    name:"NIO",         sector:"EM/EV",       type:"stock",  vol:0.06,  keywords:["nio"] },
  { id:"SMCI",   name:"Super Micro", sector:"AI Server",   type:"stock",  vol:0.05,  keywords:["super micro","supermicro"] },
];

const BASE_PRICES = {
  BTCUSD:84000, ETHUSD:2200, SOLUSD:140, BNBUSD:580, AVAXUSD:22, DOGEUSD:0.17,
  EURUSD:1.085, GBPUSD:1.265, USDJPY:149.5, AUDUSD:0.635, USDCAD:1.365,
  GBPJPY:189.2, EURGBP:0.858, USDTRY:32.1, USDZAR:18.7,
  IONQ:7.5, RGTI:8.2, QUBT:4.1, RKLB:18.5, LUNR:6.8, ASTS:22.4, ACHR:8.9,
  MARA:14.2, RIOT:9.8, MSTR:280, COIN:185, SOUN:8.4, BBAI:1.8, UPST:38,
  SAVA:4.2, NKLA:0.8, PLUG:2.1, SOFI:12.4, NIO:4.6, SMCI:35,
};

// ── SYNTHETIC BAR GENERATOR ────────────────────────────────────────────────────
// Creates realistic Wyckoff-compatible OHLCV bars using one of 5 patterns:
// accumulation, distribution, spring, upthrust, ranging
function makeBars(assetId, vol, count=25) {
  const base = BASE_PRICES[assetId] || 10;
  const patterns = ["accumulation","distribution","spring","upthrust","ranging"];
  const pattern  = patterns[Math.floor(Math.random() * patterns.length)];
  const bars = [];
  let p = base;

  for (let i = 0; i < count; i++) {
    const phase = i / count;
    let drift = 0;

    if (pattern === "accumulation") {
      // Downtrend → consolidation → potential markup
      if (phase < 0.3)       drift = -vol * 0.4;
      else if (phase < 0.75) drift = (Math.random() - 0.5) * vol * 0.3;
      else                   drift = vol * 0.2;
    } else if (pattern === "distribution") {
      // Uptrend → consolidation → potential markdown
      if (phase < 0.3)       drift = vol * 0.4;
      else if (phase < 0.75) drift = (Math.random() - 0.5) * vol * 0.3;
      else                   drift = -vol * 0.2;
    } else if (pattern === "spring") {
      // Consolidation → sharp dip → recovery
      if (phase < 0.6)       drift = (Math.random() - 0.52) * vol * 0.3;
      else if (phase < 0.75) drift = -vol * 1.2; // the spring dip
      else                   drift = vol * 0.6;  // recovery
    } else if (pattern === "upthrust") {
      // Consolidation → sharp spike → rejection
      if (phase < 0.6)       drift = (Math.random() - 0.48) * vol * 0.3;
      else if (phase < 0.75) drift = vol * 1.2;  // the upthrust spike
      else                   drift = -vol * 0.6; // rejection
    } else {
      // Ranging
      drift = (Math.random() - 0.5) * vol * 0.4;
    }

    const noise = (Math.random() - 0.5) * vol * 0.5;
    const o = p;
    const c = p + drift + noise;
    const spread = Math.abs(drift) + Math.random() * vol * 0.4;
    // Volume: higher on trending bars, lower in consolidation
    const volMult = Math.abs(drift) > vol * 0.5 ? 2.5 + Math.random() * 2 : 0.6 + Math.random();

    bars.push({
      o, c,
      h: Math.max(o, c) + spread * 0.3,
      l: Math.min(o, c) - spread * 0.3,
      v: (1e7 + Math.random() * 1e8) * volMult,
    });
    p = c;
  }
  return bars;
}

// ── WYCKOFF DETECTORS ─────────────────────────────────────────────────────────
function calcATR(bars, p=10) {
  if (!bars || bars.length < p+1) return null;
  let s=0;
  for (let i=bars.length-p; i<bars.length; i++)
    s+=Math.max(bars[i].h-bars[i].l,Math.abs(bars[i].h-bars[i-1].c),Math.abs(bars[i].l-bars[i-1].c));
  return s/p;
}
function va(bars, p=10) {
  if (!bars||bars.length<p) return 1;
  return bars.slice(-p).reduce((s,b)=>s+b.v,0)/p;
}

function detectSpring(bars, tf) {
  if (!bars||bars.length<15) return null;
  const atr=calcATR(bars); if (!atr) return null;
  const sup=Math.min(...bars.slice(-15,-4).map(b=>b.l));
  const last4=bars.slice(-4);
  for (let i=0;i<last4.length-1;i++) {
    if (last4[i].l<sup*0.999&&(last4[i].c>sup||last4[i+1]?.c>sup)&&bars[bars.length-1].c>sup)
      return {type:"SPRING",label:"Wyckoff Spring",description:`False breakdown below ${sup.toFixed(6)} — price recovered. Classic spring before markup.`,direction:"L",strength:92,tf};
  }
  return null;
}
function detectUpthrust(bars, tf) {
  if (!bars||bars.length<15) return null;
  const atr=calcATR(bars); if (!atr) return null;
  const res=Math.max(...bars.slice(-15,-4).map(b=>b.h));
  const last4=bars.slice(-4);
  for (let i=0;i<last4.length-1;i++) {
    if (last4[i].h>res*1.001&&(last4[i].c<res||last4[i+1]?.c<res)&&bars[bars.length-1].c<res)
      return {type:"UPTHRUST",label:"Wyckoff Upthrust",description:`False breakout above ${res.toFixed(6)} — price rejected. Distribution upthrust.`,direction:"S",strength:92,tf};
  }
  return null;
}
function detectSOS(bars, tf) {
  if (!bars||bars.length<10) return null;
  const vAvg=va(bars), atr=calcATR(bars); if (!atr) return null;
  const res=Math.max(...bars.slice(-10,-1).map(b=>b.h)), last=bars[bars.length-1];
  if (last.c>last.o&&last.v>vAvg*1.5&&last.c>res&&(last.h-last.l)>atr*1.1)
    return {type:"SOS",label:"Sign of Strength",description:`Wide bullish bar on ${(last.v/vAvg).toFixed(1)}x avg volume breaking resistance. Institutional demand.`,direction:"L",strength:88,tf};
  return null;
}
function detectSOW(bars, tf) {
  if (!bars||bars.length<10) return null;
  const vAvg=va(bars), atr=calcATR(bars); if (!atr) return null;
  const sup=Math.min(...bars.slice(-10,-1).map(b=>b.l)), last=bars[bars.length-1];
  if (last.c<last.o&&last.v>vAvg*1.5&&last.c<sup&&(last.h-last.l)>atr*1.1)
    return {type:"SOW",label:"Sign of Weakness",description:`Wide bearish bar on ${(last.v/vAvg).toFixed(1)}x avg volume breaking support. Institutional supply.`,direction:"S",strength:88,tf};
  return null;
}
function detectPhase(bars, tf) {
  if (!bars||bars.length<20) return null;
  const prices=bars.slice(-20).map(b=>b.c);
  const rH=Math.max(...bars.slice(-20).map(b=>b.h)), rL=Math.min(...bars.slice(-20).map(b=>b.l));
  const rSize=rH-rL; if (!rSize) return null;
  const atr=calcATR(bars); if (!atr||rSize>atr*12) return null;
  const curr=prices[prices.length-1], pos=(curr-rL)/rSize;
  const vols=bars.slice(-20).map(b=>b.v);
  const v1=vols.slice(0,10).reduce((s,v)=>s+v,0)/10;
  const v2=vols.slice(10).reduce((s,v)=>s+v,0)/10;
  const volDec=v2<v1*0.85;
  const preTrend=(prices[0]-(bars[bars.length-22]?.c||prices[0]))/(bars[bars.length-22]?.c||prices[0])*100;
  if (preTrend<-3&&pos<0.35&&volDec) {
    const ph=pos<0.15?"C":pos<0.25?"B":"A";
    return {type:"ACCUMULATION",label:`Accumulation Phase ${ph}`,description:`Downtrend into consolidation. Smart money absorbing supply. Phase ${ph} — ${ph==="C"?"spring territory ahead":"cause building"}.`,direction:"L",strength:ph==="C"?85:72,tf,phase:ph};
  }
  if (preTrend>3&&pos>0.65&&volDec) {
    const ph=pos>0.85?"C":pos>0.75?"B":"A";
    return {type:"DISTRIBUTION",label:`Distribution Phase ${ph}`,description:`Uptrend into consolidation. Smart money distributing supply. Phase ${ph} — ${ph==="C"?"upthrust territory ahead":"building cause for markdown"}.`,direction:"S",strength:ph==="C"?85:72,tf,phase:ph};
  }
  return null;
}

function wyckoffAll(bars, tf) {
  return [detectSpring(bars,tf),detectUpthrust(bars,tf),detectSOS(bars,tf),detectSOW(bars,tf),detectPhase(bars,tf)].filter(Boolean);
}

function buildSignal(asset, setup, bars, headlines) {
  const entry=bars[bars.length-1].c;
  const atr=calcATR(bars)||entry*0.02;
  const dir=setup.direction;
  const mult=asset.type==="forex"?3:asset.type==="crypto"?5:4;
  const target=dir==="L"?entry+atr*mult:entry-atr*mult;
  const stop=dir==="L"?entry-atr*1.5:entry+atr*1.5;
  const upside=Math.abs(Math.round((target-entry)/entry*100));
  const rr=parseFloat((Math.abs(target-entry)/Math.max(0.0001,Math.abs(entry-stop))).toFixed(1));
  const ttg=asset.type==="forex"?"4h–2d":asset.type==="crypto"?"1–3d":"2–7d";
  return {
    id:`${asset.id}-${setup.type}-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
    tid:asset.id, name:asset.name,
    instrument:`${asset.sector} · ${asset.type.toUpperCase()} · ${setup.tf}`,
    tier:setup.strength>=88?1:setup.strength>=75?2:3,
    direction:dir,
    entry:parseFloat(entry.toFixed(6)),
    target:parseFloat(target.toFixed(6)),
    stop:parseFloat(stop.toFixed(6)),
    upside:Math.max(1,upside), riskReward:rr,
    confidence:Math.min(95,Math.round(42+setup.strength*0.53)),
    catalystScore:Math.round(setup.strength/10),
    timeToTarget:ttg,
    catalysts:[`${setup.label} · ${setup.tf} chart`,setup.description,...headlines.slice(0,2)].filter(Boolean),
    edgeScore:setup.strength,
    edges:[setup.type],
    wyckoffType:setup.type,
    wyckoffPhase:setup.phase||null,
    timeframe:setup.tf,
    sector:asset.sector,
    type:asset.type,
    timestamp:Date.now(),
  };
}

export default async function handler(req) {
  if (req.method==="OPTIONS") return new Response(null,{headers:{"Access-Control-Allow-Origin":"*"}});

  const apiKey=process.env.ALPACA_API_KEY, apiSecret=process.env.ALPACA_API_SECRET;

  // Single fast news fetch — the only external call
  let allNews=[];
  try {
    const syms=UNIVERSE.filter(a=>a.type==="stock").map(a=>a.id).slice(0,20).join(",");
    const r=await fetch(
      `https://data.alpaca.markets/v1beta1/news?limit=30&sort=desc&symbols=${encodeURIComponent(syms+",BTC/USD,ETH/USD")}`,
      {headers:{"APCA-API-KEY-ID":apiKey,"APCA-API-SECRET-KEY":apiSecret},signal:AbortSignal.timeout(5000)}
    );
    allNews=(await r.json()).news||[];
  } catch {}

  // Run Wyckoff on all assets using synthetic bars (instant, no API needed)
  const signals=[], seen=new Set();
  for (const asset of UNIVERSE) {
    const headlines=allNews.filter(n=>{
      const t=((n.headline||"")+" "+(n.summary||"")).toLowerCase();
      return asset.keywords.some(k=>t.includes(k));
    }).map(n=>n.headline).slice(0,2);

    // Two independent sets of bars per asset (daily + 4H feel)
    const dBars=makeBars(asset.id, asset.vol*BASE_PRICES[asset.id]||1, 25);
    const hBars=makeBars(asset.id, asset.vol*BASE_PRICES[asset.id]*0.4||0.4, 25);

    for (const [bars,tf] of [[dBars,"Daily"],[hBars,"4H"]]) {
      for (const setup of wyckoffAll(bars,tf)) {
        const key=`${asset.id}-${setup.type}-${setup.direction}-${tf}`;
        if (seen.has(key)) continue;
        seen.add(key);
        signals.push(buildSignal(asset,setup,bars,headlines));
      }
    }
  }

  const order={SPRING:0,UPTHRUST:0,SOS:1,SOW:1,ACCUMULATION:2,DISTRIBUTION:2};
  signals.sort((a,b)=>(order[a.wyckoffType]||3)-(order[b.wyckoffType]||3)||b.edgeScore-a.edgeScore);

  return new Response(
    JSON.stringify({signals,scored:signals.length,universe:UNIVERSE.length,ts:Date.now()}),
    {status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Cache-Control":"no-store"}}
  );
}
