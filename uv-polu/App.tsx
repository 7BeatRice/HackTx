import {
  Cinzel_500Medium,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel'
import {
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_600SemiBold_Italic,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomNav, NAV_HEIGHT } from './src/components/BottomNav'
import { TopBar } from './src/components/TopBar'
import {
  buildHistory,
  characters,
  initialReadings,
  weatherCopy,
  weatherFor,
  type Readings,
  type Screen,
} from './src/data'
import { MotionContext, useReduceMotion } from './src/hooks'
import { CharacterSelectScreen } from './src/screens/CharacterSelectScreen'
import { GuildScreen } from './src/screens/GuildScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { QuestsScreen } from './src/screens/QuestsScreen'
import { StoryScreen } from './src/screens/StoryScreen'
import { buildStoryContext, fallbackStory, fetchStory, type Story } from './src/story'
import { ThemeContext, themes } from './src/theme'
import { fetchLiveWeather, type LiveWeather } from './src/weather'

const REFRESH_MS = 10 * 60 * 1000

export default function App() {
  const [fontsLoaded] = useFonts({
    Cinzel_500Medium,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_600SemiBold_Italic,
    CormorantGaramond_700Bold,
  })
  const reduceMotion = useReduceMotion()

  if (!fontsLoaded) return <View style={styles.loading} />

  return (
    <SafeAreaProvider>
      <MotionContext.Provider value={reduceMotion}>
        <Game />
      </MotionContext.Provider>
    </SafeAreaProvider>
  )
}

function Game() {
  const insets = useSafeAreaInsets()

  const [message, setMessage] = useState(0)
  const [screen, setScreen] = useState<Screen>('home')
  const [selected, setSelected] = useState(characters[0])
  const [storyChoice, setStoryChoice] = useState<string>()
  const [completedQuests, setCompletedQuests] = useState<string[]>([])
  const [encouraged, setEncouraged] = useState<string[]>([])
  const [live, setLive] = useState<LiveWeather | null>(null)
  const [ready, setReady] = useState(false) // first fetch attempt finished
  const [bleConnected, setBleConnected] = useState(false)
  const [story, setStory] = useState<Story | null>(null)
  const [storyLoading, setStoryLoading] = useState(true)

  // Readings start at the defaults. Live weather (SerpApi) and the ESP32 update them below.
  const [readings, setReadings] = useState<Readings>(initialReadings)

  // Load live weather (from the Supabase edge function) on mount, then on a timer.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await fetchLiveWeather()
        if (!cancelled) setLive(data)
      } catch (err) {
        console.warn('Live weather unavailable, keeping current readings', err)
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  // Merge live weather into the readings: precipitation always comes from live data,
  // and temperature does too unless the ESP32 is connected and supplying it.
  useEffect(() => {
    if (!live) return
    setReadings((current) => ({
      ...current,
      precipitation: live.precipitation,
      ...(bleConnected ? {} : { temp: live.temp }),
    }))
  }, [live, bleConnected])

  // The background/kingdom is derived, never stored.
  const weather = weatherFor(readings.temp, readings.precipitation)
  const history = useMemo(() => buildHistory(readings), [readings])
  const theme = themes[weather]

  // Everything the story depends on: character, weather, UV, villain, activity level, day.
  const ctx = useMemo(() => buildStoryContext(selected, weather, readings), [selected, weather, readings])

  // Generate a new story whenever that context changes (cached server-side, so repeats are free).
  // Step 5: the result is only logged for now. The screens don't use it yet.
  useEffect(() => {
    if (!ready) return
    let cancelled = false
    setStory(null)
    setStoryLoading(true)
    fetchStory(ctx)
      .then((s) => {
        console.log('[story]', s.source, '-', s.title)
        if (!cancelled) setStory(s)
      })
      .catch((err) => {
        console.warn('Muse story unavailable, using the built-in tale', err)
        if (!cancelled) setStory(fallbackStory(ctx))
      })
      .finally(() => {
        if (!cancelled) setStoryLoading(false)
      })
    return () => {
      cancelled = true
    }
    // ctx.key already captures every input that should trigger a new story
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ctx.key])

  const connectBLE = async () => {
    try {
      const bluetooth = (navigator as any).bluetooth
      if (!bluetooth) {
        alert('Web Bluetooth is not supported. Please use Chrome.')
        return
      }

      const SERVICE = '12345678-1234-1234-1234-123456789abc'
      const CHAR = '87654321-4321-4321-4321-cba987654321'

      const device = await bluetooth.requestDevice({
        filters: [{ name: 'Sunlit Kingdom' }],
        optionalServices: [SERVICE],
      })
      console.log('Found:', device.name, device.id)

      const applyData = (data: string) => {
        console.log('🔵 ESP32 RAW:', data)
        const [uv, temp, humidity, air] = data.split(',').map(Number)
        if ([uv, temp, humidity, air].some(Number.isNaN)) return
        setReadings((current) => ({ ...current, uv, temp, humidity, air }))
      }

      const subscribe = async () => {
        const server = await device.gatt.connect()
        const service = await server.getPrimaryService(SERVICE)
        const characteristic = await service.getCharacteristic(CHAR)
        characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
          applyData(new TextDecoder().decode(event.target.value))
        })
        await characteristic.startNotifications()
        applyData(new TextDecoder().decode(await characteristic.readValue()))
        setBleConnected(true)
      }

      device.addEventListener('gattserverdisconnected', async () => {
        console.log('🔴 BLE disconnected, retrying...')
        setBleConnected(false)
        for (let i = 0; i < 5; i++) {
          try {
            await new Promise((r) => setTimeout(r, 2000))
            await subscribe()
            return
          } catch (e) {
            console.log('retry failed', e)
          }
        }
      })

      await subscribe()
      console.log('✅ BLE CONNECTED')
    } catch (error) {
      console.error('BLE ERROR:', error)
    }
  }

  // Avoid flashing the default "sunny" world before the first fetch finishes.
  if (!ready) return <View style={styles.loading} />

  if (screen === 'characters') {
    return (
      <ThemeContext.Provider value={theme}>
        <StatusBar style="dark" />
        <CharacterSelectScreen
          selected={selected}
          onBack={() => setScreen('home')}
          onSelect={(character) => {
            setSelected(character)
            setScreen('home')
            setMessage(0)
          }}
        />
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={theme}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      <View style={[styles.flex, { backgroundColor: theme.paper }]}>
        <Pressable onPress={connectBLE} style={styles.bleButton}>
          <Text style={styles.bleButtonText}>
            {bleConnected ? '🟢 ESP32 Connected' : '🔵 Connect ESP32'}
          </Text>
        </Pressable>

        <ScrollView
          key={screen}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: NAV_HEIGHT + 10 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          <TopBar
            kingdom={weatherCopy[weather].kingdom}
            selected={selected}
            onAvatar={() => setScreen('characters')}
          />

          {screen === 'home' && (
            <HomeScreen
              weather={weather}
              readings={readings}
              history={history}
              selected={selected}
              live={live}
              message={message}
              onOpenStory={() => setScreen('story')}
            />
          )}

          {screen === 'story' && (
            <StoryScreen
              weather={weather}
              readings={readings}
              selected={selected}
              storyChoice={storyChoice}
              onChoose={setStoryChoice}
              onContinue={() => setScreen('quests')}
            />
          )}

          {screen === 'quests' && (
            <QuestsScreen
              weather={weather}
              readings={readings}
              completedQuests={completedQuests}
              onToggle={(id) =>
                setCompletedQuests((done) =>
                  done.includes(id)
                    ? done.filter((q) => q !== id)
                    : [...done, id],
                )
              }
            />
          )}

          {screen === 'guild' && (
            <GuildScreen
              weather={weather}
              encouraged={encouraged}
              onEncourage={(name) =>
                setEncouraged((sent) =>
                  sent.includes(name) ? sent : [...sent, name],
                )
              }
            />
          )}
        </ScrollView>

        <BottomNav screen={screen} onChange={setScreen} />
      </View>
    </ThemeContext.Provider>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  loading: {
    flex: 1,
    backgroundColor: '#f3e6b8',
  },

  bleButton: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#e8d9a8',
  },

  bleButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
})