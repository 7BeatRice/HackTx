// supabase/functions/story/index.ts
// Generates a fairytale chapter + quests with Meta's Muse Spark and caches it.
import { createClient } from 'npm:@supabase/supabase-js@2'

const MUSE_URL = 'https://api.meta.ai/v1/chat/completions'
const MODEL = Deno.env.get('MUSE_MODEL') ?? 'muse-spark-1.1'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const WEATHERS = ['sunny', 'bright-clouds', 'winter-storm', 'dark-clouds']
const VILLAINS = ['uv', 'storm', 'heat', 'cold', 'haze', 'none']
const LEVELS = ['great', 'good', 'careful', 'indoors']

const clean = (s: unknown, max = 60) =>
  String(s ?? '').replace(/[^\p{L}\p{N} '’.,\-]/gu, '').slice(0, max)
const num = (n: unknown, lo: number, hi: number, fallback: number) => {
  const v = Number(n)
  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback
}
const pick = (v: unknown, allowed: string[], fallback: string) => (allowed.includes(String(v)) ? String(v) : fallback)

const VILLAIN_GUIDE: Record<string, string> = {
  uv: 'The villain is the sun’s harmful UV rays (for example the Glare Wyrm, or the Sun Dragon’s burning light). The PROTECTION quest must be real sun protection: “magical sunscreen” (SPF 30 or higher), plus a hat, sunglasses or shade.',
  storm: 'The villain is a Storm Wraith (rain, wind, slippery paths). The PROTECTION quest: carry an umbrella or rain jacket and pick a dry, safe route or shelter.',
  heat: 'The villain is an Ember Giant (heat). The PROTECTION quest: bring water, wear light clothes, rest in the shade.',
  cold: 'The villain is a Frost Troll (cold). The PROTECTION quest: wear warm layers, a hat and gloves.',
  haze: 'The villain is a Haze Phantom (poor air quality). The PROTECTION quest: keep outdoor play gentle, take rest breaks, and go indoors if coughing or tired.',
  none: 'There is no villain today: it is a fair-weather day. The PROTECTION quest is about good habits: pack sunscreen and a water bottle before heading out.',
}

function buildPrompt(i: ReturnType<typeof sanitize>) {
  const f = Math.round((i.readings.temp * 9) / 5 + 32)
  const system =
    'You are the storyteller for a children’s fairytale weather-adventure app (readers aged 6 to 12). ' +
    'Write warm, gentle, age-appropriate fairytale chapters. The hero is always accompanied by Milo, a loyal, cheerful bat. ' +
    'Weave the real weather conditions into the plot. Never frighten the reader: villains are mischievous and always beatable. ' +
    'Quests must be real, safe, everyday actions a child can do with a grown-up’s okay. ' +
    'Never give medical claims or advice to stay out in dangerous weather. Reply with JSON only.'

  const user = `Write today’s chapter.

Hero: ${i.character.name} (${i.character.title})
Kingdom: ${i.kingdom}
Conditions: ${f}°F (${Math.round(i.readings.temp)}°C), UV index ${i.readings.uv}, air quality ${i.readings.air}/100, ${i.readings.precipitation}% chance of precipitation
Adventure level today: ${i.activity.level}
Activity ideas that suit today’s weather: ${i.activity.ideas.join('; ') || 'none'}

Villain rules: ${VILLAIN_GUIDE[i.villain]}

Return ONLY a JSON object, no markdown, in exactly this shape:
{
  "title": "chapter title, 3 to 7 words, fairytale style",
  "paragraphs": ["2 or 3 paragraphs, each 2 to 3 sentences, mentioning the hero, Milo and the conditions"],
  "choices": ["two short choices the hero could make, max 7 words each"],
  "quests": [
    {"type": "PROTECTION", "title": "...", "text": "...", "victory": "...", "icon": "sun"},
    {"type": "ACTIVITY", "title": "...", "text": "...", "victory": "...", "icon": "leaf"},
    {"type": "WELLNESS", "title": "...", "text": "...", "victory": "...", "icon": "droplet"}
  ]
}

Quest rules:
- title: 2 to 5 words, fairytale style.
- text: one or two sentences, max 25 words, a concrete real-world action.
- victory: 2 to 3 sentences, second person, addressed to ${i.character.name}, describing how they protected themselves or defeated the villain after finishing the quest.
- The ACTIVITY quest must use one of the activity ideas above (for a "${i.activity.level}" day).
- icon must be one of: sun, droplet, leaf, wind, sword, trophy.`

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

function sanitize(body: any) {
  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(body?.date)) ? String(body.date) : new Date().toISOString().slice(0, 10),
    character: { name: clean(body?.character?.name) || 'Hero', title: clean(body?.character?.title) || 'Adventurer' },
    weather: pick(body?.weather, WEATHERS, 'sunny'),
    kingdom: clean(body?.kingdom) || 'the kingdom',
    readings: {
      temp: num(body?.readings?.temp, -40, 55, 20),
      uv: Math.round(num(body?.readings?.uv, 0, 12, 3)),
      air: Math.round(num(body?.readings?.air, 0, 100, 90)),
      precipitation: Math.round(num(body?.readings?.precipitation, 0, 100, 10)),
    },
    villain: pick(body?.villain, VILLAINS, 'none'),
    activity: {
      level: pick(body?.activity?.level, LEVELS, 'good'),
      ideas: (Array.isArray(body?.activity?.ideas) ? body.activity.ideas : []).slice(0, 4).map((s: unknown) => clean(s, 90)),
    },
  }
}

function extractJson(text: string) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error('No JSON in model output')
  return JSON.parse(text.slice(start, end + 1))
}

const looksValid = (s: any) =>
  typeof s?.title === 'string' &&
  Array.isArray(s?.paragraphs) && s.paragraphs.length >= 2 &&
  Array.isArray(s?.quests) && s.quests.length >= 2

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const body = await req.json().catch(() => null)
  if (!body) return json({ error: 'Invalid request body' }, 400)
  const input = sanitize(body)

  const key = [input.character.name, input.weather, input.readings.uv, input.villain, input.activity.level, input.date].join('|')
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data: cached } = await supabase.from('stories').select('story').eq('key', key).maybeSingle()
  if (cached?.story) return json(cached.story)

  const apiKey = Deno.env.get('MODEL_API_KEY')
  if (!apiKey) return json({ error: 'MODEL_API_KEY is not set' }, 500)

  const res = await fetch(MUSE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages: buildPrompt(input), reasoning_effort: 'low' }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('Muse request failed', res.status, detail)
    return json({ error: 'Muse request failed', status: res.status, detail: detail.slice(0, 300) }, 502)
  }

  let story: unknown
  try {
    const data = await res.json()
    story = extractJson(String(data?.choices?.[0]?.message?.content ?? ''))
  } catch (err) {
    console.error('Could not parse Muse output', err)
    return json({ error: 'Muse returned an unreadable story' }, 502)
  }
  if (!looksValid(story)) return json({ error: 'Muse returned an incomplete story' }, 502)

  const { error } = await supabase.from('stories').upsert({ key, story })
  if (error) console.error('cache write failed', error)

  return json(story)
})