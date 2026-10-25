// Supabase Edge Function: looks up current weather via SerpApi's Google weather
// answer box so the SerpApi key never ships inside the app.
// Deploy: supabase functions deploy weather
// Secret:  supabase secrets set SERPAPI_API_KEY=...

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

/** "12%" → 12, "8 mph" → 8 */
const num = (s: unknown) => Number.parseFloat(String(s ?? '').replace(/[^\d.-]/g, ''))

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const apiKey = Deno.env.get('SERPAPI_API_KEY')
  if (!apiKey) return json({ error: 'SERPAPI_API_KEY is not set' }, 500)

  const { location } = await req.json().catch(() => ({}))
  if (!location || typeof location !== 'string') return json({ error: 'location is required' }, 400)

  const params = new URLSearchParams({
    engine: 'google',
    q: `weather ${location}`,
    hl: 'en',
    gl: 'us',
    api_key: apiKey,
  })
  const res = await fetch(`https://serpapi.com/search.json?${params}`)
  if (!res.ok) return json({ error: `SerpApi responded ${res.status}` }, 502)

  const box = (await res.json()).answer_box
  if (box?.type !== 'weather_result') return json({ error: 'No weather result for that location' }, 404)

  const raw = num(box.temperature)
  const temp = String(box.unit).toLowerCase().startsWith('f') ? ((raw - 32) * 5) / 9 : raw

  return json({
    temp: Math.round(temp),
    precipitation: Math.round(num(box.precipitation)) || 0,
    humidity: Math.round(num(box.humidity)) || 0,
    condition: box.weather ?? '',
    location: box.location ?? location,
  })
})
