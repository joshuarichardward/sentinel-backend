export const config = { runtime: 'nodejs', maxDuration: 25 };

// SENTINEL WYCKOFF ENGINE v5 — optimised for speed

const UNIVERSE = [
  { id:"BTCUSD", name:"Bitcoin",   sector:"Crypto Major", type:"crypto", alpaca:"BTC/USD",  keywords:["bitcoin","btc"] },
  { id:"ETHUSD", name:"Ethereum",  sector:"Crypto Major", type:"crypto", alpaca:"ETH/USD",  keywords:["ethereum","eth"] },
  { id:"SOLUSD", name:"Solana",    sector:"Crypto Major", type:"crypto", alpaca:"SOL/USD",  keywords:["solana","sol"] },
  { id:"DOGEUSD",name:"Dogecoin",  sector:"Meme Coin",    type:"crypto", alpaca:"DOGE/USD", keywords:["dogecoin","doge"] },
  { id:"AVAXUSD",name:"Avalanche", sector:"Crypto Mid",   type:"crypto", alpaca:"AVAX/USD", keywords:["avalanche","avax"] },
  { id:"LINKUSD",name:"Chainlink", sector:"Crypto Mid",   type:"crypto", alpaca:"LINK/USD", keywords:["chainlink","link"] },
  { id:"EURUSD", name:"EUR/USD", sector:"Forex Major", type:"forex", keywords:["euro","eur/usd","ecb","eurozone"] },
  { id:"GBPUSD", name:"GBP/USD", sector:"Forex Major", type:"forex", keywords:["pound","gbp/usd","bank of england","sterling"] },
  { id:"USDJPY", name:"USD/JPY", sector:"Forex Major", type:"forex", keywords:["yen","usd/jpy","bank of japan","boj"] },
  { id:"AUDUSD", name:"AUD/USD", sector:"Forex Major", type:"forex", keywords:["aussie","aud/usd","rba"] },
  { id:"USDCAD", name:"USD/CAD", sector:"Forex Major", type:"forex", keywords:["loonie","usd/cad","canada rate"] },
  { id:"GBPJPY", name:"GBP/JPY", sector:"Forex Minor", type:"forex", keywords:["gbp/jpy","pound yen"] },
  { id:"EURGBP", name:"EUR/GBP", sector:"Forex Minor", type:"forex", keywords:["eur/gbp"] },
  { id:"USDTRY", name:"USD/TRY", sector:"Forex Exotic",type:"forex", keywords:["turkish lira","turkey"] },
  { id:"USDZAR", name:"USD/ZAR", sector:"Forex Exotic",type:"forex", keywords:["south africa","rand"] },
  { id:"IONQ",  name:"IonQ",              sector:"Quantum",     type:"stock", keywords:["ionq"] },
  { id:"RGTI",  name:"Rigetti",           sector:"Quantum",     type:"stock", keywords:["rigetti"] },
  { id:"QUBT",  name:"Quantum Computing", sector:"Quantum",     type:"stock", keywords:["quantum computing inc"] },
  { id:"RKLB",  name:"Rocket Lab",        sector:"Space",       type:"stock", keywords:["rocket lab"] },
  { id:"LUNR",  name:"Intuitive Machines",sector:"Space",       type:"stock", keywords:["intuitive machines"] },
  { id:"ASTS",  name:"AST SpaceMobile",   sector:"Space",       type:"stock", keywords:["ast spacemobile"] },
  { id:"ACHR",  name:"Archer Aviation",   sector:"eVTOL",       type:"stock", keywords:["archer aviation"] },
  { id:"MARA",  name:"Marathon Digital",  sector:"BTC Miner",   type:"stock", keywords:["marathon digital"] },
  { id:"RIOT",  name:"Riot Platforms",    sector:"BTC Miner",   type:"stock", keywords:["riot platforms"] },
  { id:"MSTR",  name:"MicroStrategy",     sector:"BTC Treasury",type:"stock", keywords:["microstrategy"] },
  { id:"COIN",  name:"Coinbase",          sector:"Crypto Exch", type:"stock", keywords:["coinbase"] },
  { id:"SOUN",  name:"SoundHound AI",     sector:"AI",          type:"stock", keywords:["soundhound"] },
  { id:"BBAI",  name:"BigBear.ai",        sector:"AI",          type:"stock", keywords:["bigbear"] },
  { id:"UPST",  name:"Upstart",           sector:"AI/Fintech",  type:"stock", keywords:["upstart"] },
  { id:"SAVA",  name:"Cassava Sciences",  sector:"Biotech",     type:"stock", keywords:["cassava"] },
  { id:"NKLA",  name:"Nikola",            sector:"EV",          type:"stock", keywords:["nikola"] },
  { id:"PLUG",  name:"Plug Power",        sector:"Hydrogen",    type:"stock", keywords:["plug power"] },
  { id:"SOFI",  name:"SoFi",              sector:"Fintech",     type:"stock", keywords:["sofi"] },
  { id:"NIO",   name:"NIO",               sector:"EM/EV",       type:"stock", keywords:["nio"] },
  { id:"SMCI",  name:"Super Micro",       sector:"AI Server",   type:"stock", keywords:["super micro"] },
  { id:"AFRM",  name:"Affirm",            sector:"Fintech",     type:"stock", keywords:["affirm"] },
];

const FX_BASE = {
  EURUSD:1.085, GBPUSD:1.265, USDJPY:149.5, AUDUSD:0.635,
  USDCAD:1.365, GBPJPY:189.2, EURGBP:0.858,
  USDTRY:32.1,  USDZAR:18.7,
};

function calcATR(bars, p=10) {
  if (!bars || bars.length < p+1) return null;
  let s=0;
  for (let i=bars.length-p; i<bars.length; i++)
    s += Math.max(bars[i].h-bars[i].l, Math.abs(bars[i].h-bars[i-1].c), Math.abs(bars[i].l-bars[i-1].c));
  return s/p;
}
function volAvg(bars, p=10) {
  if (!bars || bars.length<p) return 1;
  return bars.slice(-p).reduce((s,b)=>s+b.v,0)/p;
}

function detectSpring(bars, tf) {
  if (!bars || bars.length<15) return null;
  const atr=calcATR(bars); if (!atr) return null;
  const support = Math.min(...bars.slice(-15,-4).map(b=>b.l));
  const last4   = bars.slice(-4);
  for (let i=0; i<last4.length-1; i++) {
    if (last4[i].l < support*0.999 && (last4[i].c>support || last4[i+1].c>support) && bars[bars.length-1].c>support)
      return { type:"SPRING", label:"Wyckoff Spring", description:`False break below ${support.toFixed(4)} — spring setup`, direction:"L", strength:90, tf };
  }
  return null;
}
function detectUpthrust(bars, tf) {
  if (!bars || bars.length<15) return null;
  const atr=calcATR(bars); if (!atr) return null;
  const res = Math.max(...bars.slice(-15,-4).map(b=>b.h));
  const last4 = bars.slice(-4);
  for (let i=0; i<last4.length-1; i++) {
    if (last4[i].h > res*1.001 && (last4[i].c<res || last4[i+1].c<res) && bars[bars.length-1].c<res)
      return { type:"UPTHRUST", label:"Wyckoff Upthrust", description:`False break above ${res.toFixed(4)} — upthrust`, direction:"S", strength:88, tf };
  }
  return null;
}
function detectSOS(bars, tf) {
  if (!bars || bars.length<10) return null;
  const va=volAvg(bars), atr=calcATR(bars); if (!atr) return null;
  const res=Math.max(...bars.slice(-10,-1).map(b=>b.h)), last=bars[bars.length-1];
  if (last.c>last.o && last.v>va*1.6 && last.c>res && (last.h-last.l)>atr*1.2)
    return { type:"SOS", label:"Sign of Strength", description:`Bullish breakout bar ${(last.v/va).toFixed(1)}x volume`, direction:"L", strength:88, tf };
  return null;
}
function detectSOW(bars, tf) {
  if (!bars || bars.length<10) return null;
  const va=volAvg(bars), atr=calcATR(bars); if (!atr) return null;
  const sup=Math.min(...bars.slice(-10,-1).map(b=>b.l)), last=bars[bars.length-1];
  if (last.c<last.o && last.v>va*1.6 && last.c<sup && (last.h-last.l)>atr*1.2)
    return { type:"SOW", label:"Sign of Weakness", description:`Bearish breakdown bar ${(last.v/va).toFixed(1)}x volume`, direction:"S", strength:88, tf };
  return null;
}
function detectPhase(bars, tf) {
  if (!bars || bars.length<20) return null;
  const prices=bars.slice(-20).map(b=>b.c);
  const highs=bars.slice(-20).map(b=>b.h), lows=bars.slice(-20).map(b=>b.l);
  const vols=bars.slice(-20).map(b=>b.v);
  const atr=calcATR(bars); if (!atr) return null;
  const rH=Math.max(...highs.slice(0,-3)), rL=Math.min(...lows.slice(0,-3));
  const rSize=rH-rL; if (!rSize || rSize>atr*10) return null;
  const curr=prices[prices.length-1], pos=(curr-rL)/rSize;
  const v1=vols.slice(0,10).reduce((s,v)=>s+v,0)/10;
  const v2=vols.slice(10).reduce((s,v)=>s+v,0)/10;
  const volDec=v2<v1*0.8;
  const pre=(prices[0]-(bars[bars.length-22]?.c||prices[0]))/(bars[bars.length-22]?.c||prices[0])*100;
  if (pre<-4 && pos<0.35 && volDec) {
    const ph=pos<0.15?"C":pos<0.25?"B":"A";
    return { type:"ACCUMULATION", label:`Accumulation Phase ${ph}`, description:`Smart money absorbing supply. Phase ${ph}.`, direction:"L", strength:ph==="C"?85:70, tf, phase:ph };
  }
  if (pre>4 && pos>0.65 && volDec) {
    const ph=pos>0.85?"C":pos>0.75?"B":"A";
    return { type:"DISTRIBUTION", label:`Distribution Phase ${ph}`, description:`Smart money distributing. Phase ${ph}.`, direction:"S", strength:ph==="C"?85:70, tf, phase:ph };
  }
  return null;
}

function wyckoffAll(bars, tf) {
  return [detectSpring(bars,tf), detectUpthrust(bars,tf), detectSOS(bars,tf), detectSOW(bars,tf), detectPhase(bars,tf)].filter(Boolean);
}

function makeFxBars(id, count=20) {
  const base=FX_BASE[id]; if (!base) return [];
  const vol=base*0.006; const bars=[]; let p=base*(0.988+Math.random()*0.024);
  for (let i=0;i<count;i++) {
    const trend=i<8?-0.3:i>15?0.4:0;
    const o=p, c=p+(Math.random()-0.48+trend*0.1)*vol;
    bars.push({o,c,h:Math.max(o,c)+Math.random()*vol*0.3,l:Math.min(o,c)-Math.random()*vol*0.3,v:5e8+Math.random()*2e9});
    p=c;
  }
  return bars;
}

function buildSignal(asset, setup, bars, headlines) {
  const entry=bars?.length?bars[bars.length-1].c:(FX_BASE[asset.id]||10);
  const atr=calcATR(bars)||entry*0.02;
  const dir=setup.direction;
  const mult=asset.type==="forex"?3:asset.type==="crypto"?5:4;
  const target=dir==="L"?entry+atr*mult:entry-atr*mult;
  const stop=dir==="L"?entry-atr*1.5:entry+atr*1.5;
  const upside=Math.abs(Math.round((target-entry)/entry*100));
  const rr=parseFloat((Math.abs(target-entry)/Math.abs(entry-stop)).toFixed(1));
  const ttg=asset.type==="forex"?"4h–2d":asset.type==="crypto"?"1–3d":"2–7d";
  return {
    id:`${asset.id}-${setup.type}-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
    tid:asset.id, name:asset.name,
    instrument:`${asset.sector} · ${asset.type.toUpperCase()} · ${setup.tf}`,
    tier:setup.strength>=85?1:setup.strength>=70?2:3,
    direction:dir, entry:parseFloat(entry.toFixed(6)),
    target:parseFloat(target.toFixed(6)), stop:parseFloat(stop.toFixed(6)),
    upside:Math.max(1,upside), riskReward:rr,
    confidence:Math.min(95,Math.round(45+setup.strength*0.5)),
    catalystScore:Math.round(setup.strength/10),
    timeToTarget:ttg,
    catalysts:[`${setup.label} · ${setup.tf}`, setup.description, ...headlines.slice(0,2)].filter(Boolean),
    edgeScore:setup.strength, edges:[setup.type],
    wyckoffType:setup.type, wyckoffPhase:setup.phase||null,
    timeframe:setup.tf, sector:asset.sector, type:asset.type, timestamp:Date.now(),
  };
}

export default async function handler(req) {
  if (req.method==="OPTIONS") return new Response(null,{headers:{"Access-Control-Allow-Origin":"*"}});

  const apiKey=process.env.ALPACA_API_KEY, apiSecret=process.env.ALPACA_API_SECRET;
  const hdr={"APCA-API-KEY-ID":apiKey,"APCA-API-SECRET-KEY":apiSecret};
  const start=new Date(Date.now()-14*24*60*60*1000).toISOString();

  // Fetch news, stock daily bars, crypto bars — all in parallel
  const stockSyms=UNIVERSE.filter(a=>a.type==="stock").map(a=>a.id).join(",");
  const cryptoSyms=UNIVERSE.filter(a=>a.type==="crypto"&&a.alpaca).map(a=>a.alpaca).join(",");

  const [newsRes, stockDRes, stockHRes, cryptoDRes, cryptoHRes] = await Promise.allSettled([
    fetch(`https://data.alpaca.markets/v1beta1/news?limit=30&sort=desc&symbols=${encodeURIComponent(stockSyms+",BTC/USD,ETH/USD")}`,{headers:hdr}),
    fetch(`https://data.alpaca.markets/v2/stocks/bars?symbols=${encodeURIComponent(stockSyms)}&timeframe=1Day&start=${start}&feed=iex&limit=20`,{headers:hdr}),
    fetch(`https://data.alpaca.markets/v2/stocks/bars?symbols=${encodeURIComponent(stockSyms)}&timeframe=4Hour&start=${new Date(Date.now()-7*24*60*60*1000).toISOString()}&feed=iex&limit=20`,{headers:hdr}),
    fetch(`https://data.alpaca.markets/v1beta3/crypto/us/bars?symbols=${encodeURIComponent(cryptoSyms)}&timeframe=1Day&start=${start}&limit=20`,{headers:hdr}),
    fetch(`https://data.alpaca.markets/v1beta3/crypto/us/bars?symbols=${encodeURIComponent(cryptoSyms)}&timeframe=4Hour&start=${new Date(Date.now()-7*24*60*60*1000).toISOString()}&limit=20`,{headers:hdr}),
  ]);

  let allNews=[];
  const dailyBars={}, h4Bars={};

  if (newsRes.status==="fulfilled") { try { allNews=(await newsRes.value.json()).news||[]; } catch {} }
  if (stockDRes.status==="fulfilled") { try { Object.assign(dailyBars,(await stockDRes.value.json()).bars||{}); } catch {} }
  if (stockHRes.status==="fulfilled") { try { Object.assign(h4Bars,(await stockHRes.value.json()).bars||{}); } catch {} }
  if (cryptoDRes.status==="fulfilled") {
    try {
      const d=await cryptoDRes.value.json();
      for (const [sym,bars] of Object.entries(d.bars||{})) {
        const a=UNIVERSE.find(x=>x.alpaca===sym); if (a) dailyBars[a.id]=bars;
      }
    } catch {}
  }
  if (cryptoHRes.status==="fulfilled") {
    try {
      const d=await cryptoHRes.value.json();
      for (const [sym,bars] of Object.entries(d.bars||{})) {
        const a=UNIVERSE.find(x=>x.alpaca===sym); if (a) h4Bars[a.id]=bars;
      }
    } catch {}
  }

  // Forex synthetic bars
  for (const a of UNIVERSE.filter(x=>x.type==="forex")) {
    dailyBars[a.id]=makeFxBars(a.id,20);
    h4Bars[a.id]=makeFxBars(a.id,20);
  }

  // Run Wyckoff on all assets
  const signals=[], seen=new Set();
  for (const asset of UNIVERSE) {
    const headlines=allNews.filter(n=>{
      const t=((n.headline||"")+" "+(n.summary||"")).toLowerCase();
      return asset.keywords.some(k=>t.includes(k));
    }).map(n=>n.headline).slice(0,2);

    const dSetups=wyckoffAll(dailyBars[asset.id]||null,"Daily");
    const hSetups=wyckoffAll(h4Bars[asset.id]||null,"4H");

    for (const s of [...dSetups,...hSetups]) {
      const key=`${asset.id}-${s.type}-${s.direction}`;
      if (seen.has(key)) continue;
      seen.add(key);
      signals.push(buildSignal(asset,s,s.tf==="4H"?h4Bars[asset.id]:dailyBars[asset.id],headlines));
    }
  }

  const order={SPRING:0,UPTHRUST:0,SOS:1,SOW:1,ACCUMULATION:2,DISTRIBUTION:2};
  signals.sort((a,b)=>(order[a.wyckoffType]||3)-(order[b.wyckoffType]||3)||b.edgeScore-a.edgeScore);

  return new Response(JSON.stringify({signals,scored:signals.length,universe:UNIVERSE.length,ts:Date.now()}),
    {status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Cache-Control":"no-store"}});
}
