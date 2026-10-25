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
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomNav, NAV_HEIGHT } from './src/components/BottomNav'
import { TopBar } from './src/components/TopBar'
import {
  characters,
  initialReadings,
  rollWorld,
  weatherCopy,
  type Readings,
  type Screen,
  type Weather,
} from './src/data'
import { MotionContext, useReduceMotion } from './src/hooks'
import { CharacterSelectScreen } from './src/screens/CharacterSelectScreen'
import { GuildScreen } from './src/screens/GuildScreen'
import { HomeScreen } from './src/screens/HomeScreen'
import { QuestsScreen } from './src/screens/QuestsScreen'
import { StoryScreen } from './src/screens/StoryScreen'
import { ThemeContext, themes } from './src/theme'

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

  // State carried over unchanged from the web prototype.
  const [simulator, setSimulator] = useState(true)
  const [message, setMessage] = useState(0)
  const [screen, setScreen] = useState<Screen>('home')
  const [selected, setSelected] = useState(characters[0])
  const [weather, setWeather] = useState<Weather>('sunny')
  const [storyChoice, setStoryChoice] = useState<string>()
  const [completedQuests, setCompletedQuests] = useState<string[]>([])
  const [encouraged, setEncouraged] = useState<string[]>([])
  const [readings, setReadings] = useState<Readings>(initialReadings)

  const theme = themes[weather]

  const refreshWorld = () => {
    const next = rollWorld()
    setWeather(next.weather)
    setReadings(next.readings)
  }

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
        {/* key resets scroll position when switching tabs */}
        <ScrollView
          key={screen}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: NAV_HEIGHT + 10 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          <TopBar
            kingdom={weatherCopy[weather].kingdom}
            selected={selected}
            simulator={simulator}
            onAvatar={() => setScreen('characters')}
            onToggleSim={() => setSimulator(!simulator)}
          />

          {screen === 'home' && (
            <HomeScreen
              weather={weather}
              readings={readings}
              selected={selected}
              simulator={simulator}
              message={message}
              onRefresh={refreshWorld}
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
                setCompletedQuests((done) => (done.includes(id) ? done.filter((q) => q !== id) : [...done, id]))
              }
            />
          )}

          {screen === 'guild' && (
            <GuildScreen
              weather={weather}
              encouraged={encouraged}
              onEncourage={(name) => setEncouraged((sent) => (sent.includes(name) ? sent : [...sent, name]))}
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
  loading: { flex: 1, backgroundColor: '#f3e6b8' },
})
