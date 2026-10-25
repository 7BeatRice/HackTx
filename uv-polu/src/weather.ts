import { supabase } from './supabase'

export type LiveWeather = {
  /** °C */
  temp: number
  /** chance of precipitation, 0–100 */
  precipitation: number
  humidity: number
  condition: string
  location: string
}

export const DEFAULT_LOCATION = process.env.EXPO_PUBLIC_WEATHER_LOCATION ?? 'Austin, TX'

/** Current weather from SerpApi, proxied through the `weather` Supabase Edge Function. */
export async function fetchLiveWeather(location = DEFAULT_LOCATION): Promise<LiveWeather> {
  const { data, error } = await supabase.functions.invoke<LiveWeather>('weather', { body: { location } })
  if (error) throw error
  if (!data) throw new Error('Empty weather response')
  return data
}
