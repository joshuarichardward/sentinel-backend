export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body', detail: e.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const { name, dir, entry, target, stop, rr, ttg, upside, conf, catalysts } = body;

  const prompt = `Signal: ${dir} ${name} | Upside: +${upside}% | Entry: ${entry} Target: ${target} Stop: ${stop} | R/R: ${rr}x | TTG: ${ttg} | Conf: ${conf}% | Catalysts: ${(catalysts || []).join('; ')}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'Aggressive market analyst hunting asymmetric upside trades. Blunt, specific, conviction-driven. Max 90 words. State: the single key level to watch, catalyst conviction score 1-10, the main thing that could kill the trade, and one sentence on why this could be special.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const rawText = await r.text();

    // Try to parse — if it fails, return the raw response so we can debug
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return new Response(JSON.stringify({ error: 'Anthropic returned non-JSON', raw: rawText.slice(0, 500) }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Surface Anthropic errors clearly
    if (data.error) {
      return new Response(JSON.stringify({ error: 'Anthropic API error', detail: data.error }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const analysis = data.content?.map(c => c.text || '').join('') || 'No content returned.';

    return new Response(JSON.stringify({ analysis }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Fetch failed', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
