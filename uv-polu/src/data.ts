export type IconName =
  | 'home'
  | 'book'
  | 'sword'
  | 'trophy'
  | 'sun'
  | 'wind'
  | 'droplet'
  | 'leaf'
  | 'signal'
  | 'back'
  | 'refresh'
  | 'check'
  | 'arrow'

export type Weather = 'sunny' | 'bright-clouds' | 'winter-storm' | 'dark-clouds'
export type Screen = 'home' | 'story' | 'quests' | 'guild' | 'characters'
export type Character = { name: string; title: string; color: string; initial: string }
export type Readings = { temp: number; uv: number; air: number; precipitation: number }

export type Timeframe = 'day' | 'week'
export type HistoryPoint = { time: string; uv: number; air: number }
export type History = Record<Timeframe, HistoryPoint[]>

export const characters: Character[] = [
  { name: 'Red Riding Hood', title: 'Woodland Wanderer', color: '#b23e4b', initial: 'R' },
  { name: 'Snow White', title: 'Forest Friend', color: '#315b8a', initial: 'S' },
  { name: 'Cinderella', title: 'Midnight Dreamer', color: '#789ac2', initial: 'C' },
  { name: 'Aurora', title: 'Rose Dreamer', color: '#b66c82', initial: 'A' },
  { name: 'Ariel', title: 'Tide Singer', color: '#318b83', initial: 'A' },
  { name: 'Belle', title: 'Enchanted Reader', color: '#b8882c', initial: 'B' },
  { name: 'Jasmine', title: 'Starlight Voyager', color: '#317f88', initial: 'J' },
  { name: 'Pocahontas', title: 'Wind Listener', color: '#956544', initial: 'P' },
  { name: 'Mulan', title: 'Brave Guardian', color: '#884751', initial: 'M' },
  { name: 'Tiana', title: 'Bayou Visionary', color: '#58864b', initial: 'T' },
  { name: 'Rapunzel', title: 'Lantern Seeker', color: '#8c68aa', initial: 'R' },
  { name: 'Merida', title: 'Highland Archer', color: '#486c5d', initial: 'M' },
  { name: 'Moana', title: 'Ocean Wayfinder', color: '#b75f3b', initial: 'M' },
  { name: 'Raya', title: 'Dragon Guardian', color: '#53689b', initial: 'R' },
  { name: 'Elsa', title: 'Frost Weaver', color: '#669dbb', initial: 'E' },
  { name: 'Anna', title: 'Northern Adventurer', color: '#7c5985', initial: 'A' },
  { name: 'Alice in Wonderland', title: 'Curious Explorer', color: '#527eae', initial: 'A' },
]

export const weatherCopy: Record<Weather, { kingdom: string; condition: string; quest: string }> = {
  sunny: {
    kingdom: 'The Golden Wilds',
    condition: 'Sunlit skies and dry pathways',
    quest: 'The golden trail is glowing. Shall we follow it?',
  },
  'bright-clouds': {
    kingdom: 'The Opaline Realm',
    condition: 'Warm clouds gather overhead',
    quest: 'Silver clouds have opened a path toward the rainbow orchard.',
  },
  'winter-storm': {
    kingdom: 'The Frostbound Vale',
    condition: 'Cold rain and snow veil the woods',
    quest: 'Fresh tracks cross the storm-darkened, crystal woods.',
  },
  'dark-clouds': {
    kingdom: 'The Gloaming Wood',
    condition: 'Cold clouds drift through the valley',
    quest: 'A lantern glows beneath the quiet, shadowed trees.',
  },
}

export const initialReadings: Readings = { temp: 24, uv: 3, air: 92, precipitation: 12 }

/** Which kingdom a temperature (°C) and precipitation chance (%) belong to. */
export function weatherFor(temp: number, precipitation: number): Weather {
  return temp >= 16
    ? precipitation < 45
      ? 'sunny'
      : 'bright-clouds'
    : precipitation >= 45
      ? 'winter-storm'
      : 'dark-clouds'
}

/** Simulator: roll a fresh set of readings and derive the matching weather. */
export function rollWorld(): { weather: Weather; readings: Readings } {
  const temp = Math.round(-4 + Math.random() * 34)
  const precipitation = Math.round(Math.random() * 100)
  return {
    weather: weatherFor(temp, precipitation),
    readings: {
      temp,
      uv: Math.round(1 + Math.random() * 6),
      air: Math.round(82 + Math.random() * 16),
      precipitation,
    },
  }
}

export function heroClassFor(weather: Weather): string {
  return weather === 'sunny'
    ? 'Sun Knight'
    : weather === 'bright-clouds'
      ? 'Sky Weaver'
      : weather === 'winter-storm'
        ? 'Storm Rider'
        : 'Moon Mage'
}

export function storyTitleFor(weather: Weather): string {
  return weather === 'sunny'
    ? 'The Sun Dragon Awakens'
    : weather === 'bright-clouds'
      ? 'The Palace Above the Clouds'
      : weather === 'winter-storm'
        ? 'The Crown Beneath the Snow'
        : 'Lanterns in the Gloaming'
}

export function reactionFor(weather: Weather, readings: Readings): string {
  if (readings.uv >= 6) return 'Milo is excited—the Sun Dragon is near.'
  if (weather === 'winter-storm') return 'Milo has raised his enchanted umbrella.'
  if (readings.air < 85) return 'Milo notices a haze across the kingdom.'
  return 'Milo is happy—the air feels clear and fresh.'
}

const HOUR_LABELS = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
/** Rough share of the day's peak UV at each of the hours above. */
const SUN_CURVE = [0.15, 0.55, 1, 0.95, 0.5, 0.08]

const round1 = (n: number) => Math.round(n * 10) / 10
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/**
 * Simulator history for the trend charts, shaped around the current readings.
 * Replace with real stored sensor samples when the ESP32 is connected.
 */
export function buildHistory(readings: Readings): History {
  const peak = Math.max(readings.uv, 1)
  const wobble = (amount: number) => (Math.random() - 0.5) * 2 * amount
  const day = HOUR_LABELS.map((time, i) => ({
    time,
    uv: round1(clamp(peak * SUN_CURVE[i] + wobble(0.3), 0, 12)),
    air: Math.round(clamp(readings.air + wobble(6), 70, 100)),
  }))
  const week = DAY_LABELS.map((time) => ({
    time,
    uv: round1(clamp(peak * (0.55 + Math.random() * 0.6), 0, 12)),
    air: Math.round(clamp(readings.air + wobble(8), 70, 100)),
  }))
  return { day, week }
}
