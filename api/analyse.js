export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const body = req.body;
  if (!body) return res.status(400).json({ error: 'Empty request body' });

  const { name, dir, entry, target, stop, rr, ttg, upside, conf, catalysts } = body;

  const prompt = `Signal: ${dir} ${name} | Upside: ${upside}% | Entry: ${entry} Target: ${target} Stop: ${stop} | R/R: ${rr}x | TTG: ${ttg} | Conf: ${conf}% | Catalysts: ${(catalysts || []).join('; ')}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: 'You are an aggressive market analyst hunting asymmetric trades. Be blunt, specific, and conviction-driven. Max 90 words. Cover: the single key price level to watch, a catalyst conviction score 1-10, the main risk that could kill the trade, and one sentence on why this setup could be special.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await r.json();

    if (data.error) return res.status(502).json({ error: 'Anthropic API error', detail: data.error });

    const analysis = data.content?.map(c => c.text || '').join('') || 'No content returned.';
    return res.status(200).json({ analysis });

  } catch (err) {
    return res.status(500).json({ error: 'Fetch failed', detail: err.message });
  }
}
