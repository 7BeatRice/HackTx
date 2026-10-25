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
import { buildStoryContext, fallbackStory, fetchStory, type Story, type StoryQuest } from './src/story'
import { CharacterSelectScreen } from './src/screens/CharacterSelectScreen'
import { GuildScreen } from './src/screens/GuildScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { QuestsScreen } from './src/screens/QuestsScreen'
import { StoryScreen } from './src/screens/StoryScreen'

import { ThemeContext, themes } from './src/theme'
import { fetchLiveWeather, type LiveWeather } from './src/weather'

const REFRESH_MS = 10 * 60 * 1000

type Wristband = { uv: number; temp: number; humidity: number; air: number }

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
  const [completed, setCompleted] = useState<{ id: string; xp: number }[]>([])
  const [encouraged, setEncouraged] = useState<string[]>([])
  const [live, setLive] = useState<LiveWeather | null>(null)
  const [ready, setReady] = useState(false)
  const [story, setStory] = useState<Story | null>(null)
  const [storyLoading, setStoryLoading] = useState(true)

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

  const [readings, setReadings] = useState<Readings>({
    ...initialReadings,
    temp: initialReadings.temp,
    precipitation: initialReadings.precipitation,
  })

  // Merge live weather (SerpApi) into the readings so the world follows real conditions.
  useEffect(() => {
    if (!live) return
    setReadings((current) => ({
      ...current,
      temp: live.temp,
      precipitation: live.precipitation,
    }))
  }, [live])

  const weather = weatherFor(readings.temp, readings.precipitation)
  const history = useMemo(() => buildHistory(readings), [readings])
  const [bleConnected, setBleConnected] = useState(false)
  const [wristband, setWristband] = useState<Wristband | null>(null)
  const theme = themes[weather]
  const textColor = theme.dark ? '#fff' : '#2b2118'

  // Everything the story depends on: character, weather, UV, villain, activity level, day.
  const ctx = useMemo(() => buildStoryContext(selected, weather, readings), [selected, weather, readings])

  // Generate a new story whenever that context changes (cached server-side, so repeats are free).
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
        setWristband({ uv, temp, humidity, air })
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


  const completedIds = completed.map((c) => c.id)
const xp = completed.reduce((sum, c) => sum + c.xp, 0)
const completeQuest = (quest: StoryQuest) =>
  setCompleted((done) =>
    done.some((c) => c.id === quest.id) ? done : [...done, { id: quest.id, xp: quest.xp }],
  )

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

        {wristband && (
          <View style={styles.wristCard}>
            <Text style={[styles.wristTitle, { color: textColor }]}>WRISTBAND DATA</Text>
            <View style={styles.wristRow}>
              <Text style={[styles.wristItem, { color: textColor }]}>☀️ UV {wristband.uv.toFixed(1)}</Text>
              <Text style={[styles.wristItem, { color: textColor }]}>🌡️ {wristband.temp.toFixed(1)}°F</Text>
              <Text style={[styles.wristItem, { color: textColor }]}>💧 {wristband.humidity.toFixed(0)}%</Text>
              <Text style={[styles.wristItem, { color: textColor }]}>🌫️ Air {wristband.air}</Text>
            </View>
          </View>
        )}

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
              story={story}
              loading={storyLoading}
              chapter={Math.floor(completed.length / 3) + 1}
              activity={ctx.activity.level}
              storyChoice={storyChoice}
              onChoose={setStoryChoice}
              onContinue={() => setScreen('quests')}
            />
          )}

          {screen === 'quests' && (
  <QuestsScreen
    story={story}
    loading={storyLoading}
    completedQuests={completedIds}
    xp={xp}
    onComplete={completeQuest}
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

  wristCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(232, 217, 168, 0.6)',
  },

  wristTitle: {
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  wristRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },

  wristItem: {
    fontWeight: '600',
    fontSize: 14,
  },
})