import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { BatHero } from '../components/BatHero'
import { ChamferBox } from '../components/ChamferBox'
import { Icon } from '../components/Icon'
import { TrendChart } from '../components/TrendChart'
import { WorldScene } from '../components/WorldScene'
import type { LiveWeather } from '../weather'
import {
  fahrenheit,
  heroClassFor,
  reactionFor,
  weatherCopy,
  type Character,
  type History,
  type IconName,
  type Readings,
  type Weather,
} from '../data'
import { useMetrics } from '../hooks'
import { font, mix, useTheme } from '../theme'

type Props = {
  weather: Weather
  readings: Readings
  history: History
  selected: Character
  live: LiveWeather | null   
  message: number
  onOpenStory: () => void  
}

export function HomeScreen({ weather, readings, history, selected, live, message, onOpenStory }: Props) {
  const theme = useTheme()
  const { width, height, compact, tiny, pad } = useMetrics()
  const copy = weatherCopy[weather]

  const worldH = compact ? 478 : Math.min(610, Math.max(490, height * 0.58))
  const batW = compact ? 300 : Math.min(350, width * 0.55)
  const speechW = tiny ? 220 : compact ? 245 : Math.min(320, width * 0.42)
  const speechLeft = compact ? 20 : Math.min(130, Math.max(20, width * 0.08))
  const levelW = Math.min(520, width - 40)

  const messages = [
    `${selected.name}, ${copy.quest}`,
    `The kingdom needs the courage of a ${selected.title.toLowerCase()}. Adventure is close!`,
    `A new chapter written for ${selected.name} is ready. Tap to begin.`,
  ]
  const heroClass = heroClassFor(weather)
  const reaction = reactionFor(weather, readings)

  const cards: { key: string; icon: IconName; tint: string; bg: string; label: string; value: string; note: string }[] = [
    { key: 'temp', icon: 'sun', tint: '#b67d1d', bg: '#fff3d4', label: 'Temperature', value: `${fahrenheit(readings.temp)}°F`, note: 'Warm & gentle' },
    { key: 'uv', icon: 'wind', tint: '#7f6cad', bg: '#f0eafa', label: 'UV Index', value: `${readings.uv}`, note: 'Low today' },
    { key: 'air', icon: 'leaf', tint: '#4e8b60', bg: '#e5f3e7', label: 'Air Quality', value: `${readings.air}`, note: 'Fresh air' },
    {
      key: 'rain', icon: 'droplet', tint: '#4884a4', bg: '#e5f2f7', label: 'Precipitation',
      value: `${readings.precipitation}%`, note: readings.precipitation >= 45 ? 'High chance' : 'Low chance',
    },
  ]
  const cols = compact ? 2 : 4
  const gap = 12
  const cardW = (width - pad * 2 - gap * (cols - 1)) / cols
  const chartCols = compact ? 1 : 2
  const chartW = (width - pad * 2 - gap * (chartCols - 1)) / chartCols

  return (
    <>
      {/* ───────── hero world ───────── */}
      <View style={[styles.world, { height: worldH }]}>
        <WorldScene weather={weather} temp={readings.temp} width={width} height={worldH} />

        <View style={[styles.bat, { left: (width - batW) / 2 }]}>
          <BatHero weather={weather} uv={readings.uv} width={batW} />
        </View>

        <Pressable
          onPress={onOpenStory}
          accessibilityRole="button"
          accessibilityLabel="Enter your story"
          style={[styles.speechWrap, { left: speechLeft, width: speechW }]}
        >
          <ChamferBox
            cut={[12, 12, 12, 20]}
            fill="rgba(245,237,214,0.95)"
            stroke={theme.gold}
            strokeWidth={2}
            style={styles.speech}
          >
            <Text style={styles.speechKicker}>MILO SAYS</Text>
            <Text style={styles.speechCopy}>“{messages[message]}”</Text>
            <View style={styles.speechAction}>
              <Text style={styles.speechActionText}>Enter your story </Text>
              <Icon name="arrow" size={11} color="#b6434e" />
            </View>
          </ChamferBox>
          <View style={styles.speechTail} />
        </Pressable>

        <View style={[styles.ribbon, { borderColor: theme.gold, right: compact ? 14 : Math.min(100, Math.max(20, width * 0.07)) }]}>
          <Text style={[styles.ribbonText, { fontSize: compact ? 11 : 13 }]}>{reaction}</Text>
        </View>

        <ChamferBox
          cut={12}
          fill={{ angle: 110, stops: [[0, 'rgba(18,39,31,0.97)'], [1, 'rgba(49,57,54,0.96)']] }}
          stroke={theme.gold}
          strokeWidth={2}
          style={[styles.level, { width: levelW, left: (width - levelW) / 2 }]}
        >
          <View style={styles.medallion}>
            <Text style={styles.medallionNum}>4</Text>
            <Text style={styles.medallionLabel}>LEVEL</Text>
          </View>
          <View style={styles.levelBody}>
            <View style={styles.levelRow}>
              <Text style={styles.levelTitle} numberOfLines={1}>
                Level 4 — {heroClass}
              </Text>
              <Text style={styles.levelXp}>72 / 100 XP</Text>
            </View>
            <View style={styles.track}>
              <LinearGradient
                colors={['#e0b84f', '#f2da82']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.trackFill}
              />
            </View>
            <Text style={styles.levelNote} numberOfLines={1}>
              {selected.name} · 28 XP until the next level
            </Text>
          </View>
        </ChamferBox>
      </View>

      {/* ───────── conditions ───────── */}
      <View style={{ paddingTop: 24, paddingBottom: 28, paddingHorizontal: pad }}>
        <LinearGradient
          colors={[mix(theme.paper, '#ffffff', 12), theme.paper]}
          style={[StyleSheet.absoluteFill]}
        />
        <View style={styles.heading}>
          <View style={styles.headingText}>
            <Text style={[styles.headingKicker, { color: theme.gold }]}>YOUR WORLD RIGHT NOW</Text>
            <Text style={[styles.headingTitle, { color: theme.ink }]}>{copy.condition}</Text>
          </View>
        </View>

        <View style={[styles.grid, { gap }]}>
          {cards.map((c) => (
            <ChamferBox
              key={c.key}
              cut={9}
              fill={{ angle: 145, stops: [[0, '#f8efd8'], [1, '#dfd0aa']] }}
              stroke={theme.gold}
              strokeWidth={1}
              style={[styles.card, { width: cardW, gap: tiny ? 7 : 11, padding: tiny ? 9 : 14 }]}
            >
              <View style={[styles.iconBox, { backgroundColor: c.bg, width: tiny ? 32 : 38, height: tiny ? 32 : 38 }]}>
                <Icon name={c.icon} color={c.tint} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>{c.label.toUpperCase()}</Text>
                <Text style={styles.cardValue}>{c.value}</Text>
                <Text style={styles.cardNote}>{c.note}</Text>
              </View>
            </ChamferBox>
          ))}
        </View>

        <View style={styles.trendHead}>
          <Text style={[styles.headingKicker, { color: theme.gold }]}>WORLD TRENDS</Text>
          <Text style={[styles.headingTitle, { color: theme.ink }]}>How the day is unfolding</Text>
        </View>

        <View style={[styles.grid, { gap }]}>
          <TrendChart
            title="UV Index"
            color="#7f6cad"
            width={chartW}
            series={{
              day: history.day.map((p) => ({ time: p.time, value: p.uv })),
              week: history.week.map((p) => ({ time: p.time, value: p.uv })),
            }}
          />
          <TrendChart
            title="Air Quality"
            color="#4e8b60"
            width={chartW}
            domain={[70, 100]}
            series={{
              day: history.day.map((p) => ({ time: p.time, value: p.air })),
              week: history.week.map((p) => ({ time: p.time, value: p.air })),
            }}
          />
        </View>

        <View style={styles.note}>
          <Icon name="signal" size={18} color="#6f7e6d" />
          <Text style={styles.noteText}>
            {live ? `Live weather · ${live.location}` : 'Live weather unavailable — showing default world'}
          </Text>
          <Text style={styles.noteTag}>{live ? 'LIVE' : 'OFFLINE'}</Text>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  world: { overflow: 'hidden', borderBottomWidth: 5, borderBottomColor: '#c0ad70' },
  bat: { position: 'absolute', bottom: 35, zIndex: 3 },

  speechWrap: { position: 'absolute', top: 34, zIndex: 4 },
  speech: { paddingTop: 14, paddingBottom: 13, paddingHorizontal: 16 },
  speechKicker: { fontFamily: font.cinzel, fontSize: 9, letterSpacing: 1.44, marginBottom: 5, color: '#b6434e' },
  speechCopy: { fontFamily: font.bodySemi, fontSize: 16, lineHeight: 21, color: '#26372d' },
  speechAction: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  speechActionText: { fontFamily: font.bodySemi, fontSize: 9, color: '#7d8e7f' },
  // right-angled triangle, as in the prototype's ::after
  speechTail: {
    position: 'absolute',
    left: 36,
    bottom: -12,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderTopColor: 'rgba(255,255,250,0.96)',
    borderRightColor: 'transparent',
    transform: [{ rotate: '14deg' }],
  },

  ribbon: {
    position: 'absolute',
    zIndex: 4,
    bottom: 100,
    maxWidth: 155,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(244,231,194,0.92)',
    boxShadow: '0 8px 20px rgba(20,25,18,0.15)',
  },
  ribbonText: { fontFamily: font.bodySemi, color: '#2e3b31' },

  level: {
    position: 'absolute',
    zIndex: 5,
    bottom: 14,
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 15,
  },
  medallion: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e8c768',
    borderRadius: 27,
    backgroundColor: '#4d6a4e',
  },
  medallionNum: { fontFamily: font.cinzelBold, fontSize: 22, lineHeight: 24, color: '#ffffff' },
  medallionLabel: { fontFamily: font.body, fontSize: 7, letterSpacing: 0.7, marginTop: 2, color: '#f0d88c' },
  levelBody: { flex: 1, minWidth: 0 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, gap: 8 },
  levelTitle: { flexShrink: 1, fontFamily: font.cinzel, fontSize: 14, color: '#ffffff' },
  levelXp: { fontFamily: font.body, fontSize: 11, color: '#d6dfd3' },
  track: { height: 7, overflow: 'hidden', borderRadius: 1, backgroundColor: '#718171' },
  trackFill: { width: '72%', height: '100%', borderRadius: 1 },
  levelNote: { marginTop: 5, fontFamily: font.body, fontSize: 8, color: '#b8c7b6' },

  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headingText: { flex: 1, paddingRight: 12 },
  headingKicker: { fontFamily: font.cinzel, fontSize: 9, letterSpacing: 1.44, marginBottom: 5 },
  headingTitle: { fontFamily: font.cinzel, fontSize: 21 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  trendHead: { marginTop: 26, marginBottom: 14 },
  card: { flexDirection: 'row', alignItems: 'center', minHeight: 88 },
  iconBox: { alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  cardText: { flex: 1, minWidth: 0 },
  cardLabel: { fontFamily: font.bodySemi, fontSize: 8, letterSpacing: 0.4, marginBottom: 1, color: '#8a9488' },
  cardValue: { fontFamily: font.cinzelBold, fontSize: 21, color: '#26372d' },
  cardNote: { marginTop: 1, fontFamily: font.body, fontSize: 10, color: '#677367' },

  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: '#f0f2e9',
  },
  noteText: { flex: 1, fontFamily: font.body, fontSize: 9, color: '#6f7e6d' },
  noteTag: { fontFamily: font.bodyBold, fontSize: 8, letterSpacing: 0.64, color: '#506c52' },
})
