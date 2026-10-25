import { LinearGradient } from 'expo-linear-gradient'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Path, Polygon } from 'react-native-svg'
import { ChamferBox } from '../components/ChamferBox'
import { Icon } from '../components/Icon'
import { fahrenheit, type Character, type Readings, type Weather } from '../data'
import { useMetrics } from '../hooks'
import { ACTIVITY_LABEL, roman, type ActivityLevel, type Story } from '../story'
import { font, mix, storySky, useTheme } from '../theme'

type Props = {
  weather: Weather
  readings: Readings
  selected: Character
  story: Story | null
  loading: boolean
  chapter: number
  activity: ActivityLevel
  storyChoice?: string
  onChoose: (choice: string) => void
  onContinue: () => void
}

const CASTLE = [
  [0, 100], [0, 45], [12, 45], [12, 18], [20, 0], [28, 18], [28, 50], [43, 50], [43, 28], [50, 10],
  [57, 28], [57, 50], [72, 50], [72, 18], [80, 0], [88, 18], [88, 45], [100, 45], [100, 100],
]
  .map(([x, y]) => `${x * 2.1},${y * 1.7}`)
  .join(' ')

export function StoryScreen({
  weather,
  readings,
  selected,
  story,
  loading,
  chapter,
  activity,
  storyChoice,
  onChoose,
  onContinue,
}: Props) {
  const theme = useTheme()
  const { width, compact, pad } = useMetrics()
  const artH = compact ? 210 : 260
  const parchmentPad = Math.min(54, Math.max(22, width * 0.05))
  const headingSize = Math.min(46, Math.max(28, width * 0.05))

  const numeral = roman(chapter)
  const [first, ...rest] = story?.paragraphs ?? []

  return (
    <View style={[styles.page, { paddingHorizontal: pad }]}>
      <LinearGradient colors={[mix(theme.paper, '#ffffff', 16), theme.paper]} style={StyleSheet.absoluteFill} />

      <View style={styles.heading}>
        <Text style={[styles.kicker, { color: theme.gold }]}>CHAPTER {numeral}</Text>
        <Text style={[styles.title, { color: theme.ink, fontSize: headingSize, lineHeight: headingSize * 1.15 }]}>
          {story?.title ?? 'Writing your chapter…'}
        </Text>
        <Text style={[styles.sub, { color: theme.ink }]}>
          {story?.source === 'fallback' ? 'A tale from the royal archives' : `A living chapter for ${selected.name}`}
        </Text>
      </View>

      <ChamferBox
        cut={[18, 18, 0, 0]}
        fill={{ angle: 180, stops: storySky[weather] }}
        stroke={theme.gold}
        strokeWidth={2}
        style={[styles.art, { height: artH }]}
      >
        <View style={styles.moon} />
        <View style={styles.castle}>
          <Svg width={210} height={170}>
            <Polygon points={CASTLE} fill="#1d2c28" />
          </Svg>
        </View>
        {/* Simple serpent silhouette standing in for the ⌁ glyph, which many Android fonts lack. */}
        <View style={styles.dragon}>
          <Svg width={90} height={60} viewBox="0 0 90 60">
            <Path d="M6 38C22 6 36 56 52 28S76 14 84 30" fill="none" stroke="#372e28" strokeWidth={9} strokeLinecap="round" />
            <Path d="M40 24l10-18 6 20Z" fill="#372e28" />
          </Svg>
        </View>
        <View style={styles.seal}>
          <Text style={styles.sealText}>{numeral}</Text>
        </View>
      </ChamferBox>

      <View style={[styles.parchment, { borderColor: theme.gold, paddingHorizontal: parchmentPad }]}>
        {!story ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#93454c" />
            <Text style={styles.loadingText}>{loading ? 'The storyteller is writing your chapter…' : 'No story yet.'}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.paragraph}>
              <Text style={styles.dropcap}>{first.slice(0, 1)}</Text>
              {first.slice(1)}
            </Text>
            {rest.map((p, i) => (
              <Text key={i} style={styles.paragraph}>
                {p}
              </Text>
            ))}

            <View style={[styles.conditions, compact && styles.conditionsCompact]}>
              <View style={styles.cond}>
                <Icon name="sun" size={16} color="#29382d" />
                <Text style={styles.condText}>{fahrenheit(readings.temp)}°F</Text>
              </View>
              <View style={styles.cond}>
                <Icon name="wind" size={16} color="#29382d" />
                <Text style={styles.condText}>UV {readings.uv}</Text>
              </View>
              <View style={styles.cond}>
                <Icon name="droplet" size={16} color="#29382d" />
                <Text style={styles.condText}>{readings.precipitation}%</Text>
              </View>
              <View style={styles.cond}>
                <Icon name="leaf" size={16} color="#29382d" />
                <Text style={styles.condText}>Air {readings.air}</Text>
              </View>
            </View>
            <Text style={styles.activity}>{ACTIVITY_LABEL[activity]}</Text>

            <Text style={styles.question}>What should {selected.name} do?</Text>
            <View style={styles.choices}>
              {story.choices.map((choice) => {
                const chosen = storyChoice === choice
                return (
                  <Pressable
                    key={choice}
                    onPress={() => onChoose(choice)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: chosen }}
                    style={[styles.choice, chosen && styles.choiceChosen]}
                  >
                    <View style={[styles.diamond, chosen && styles.diamondChosen]} />
                    <Text style={[styles.choiceText, chosen && styles.choiceTextChosen]}>{choice}</Text>
                  </Pressable>
                )
              })}
            </View>

            <Pressable
              disabled={!storyChoice}
              onPress={onContinue}
              accessibilityRole="button"
              style={[styles.primary, !storyChoice && styles.primaryDisabled]}
            >
              <Text style={styles.primaryText}>Continue to the quest</Text>
              <Icon name="arrow" size={14} color="#ffffff" />
            </Pressable>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, paddingTop: 38, paddingBottom: 60 },
  heading: { maxWidth: 760, alignSelf: 'center', alignItems: 'center', marginBottom: 25 },
  kicker: { fontFamily: font.cinzel, fontSize: 10, letterSpacing: 1.8 },
  title: { fontFamily: font.cinzel, textAlign: 'center', marginVertical: 6 },
  sub: { fontFamily: font.bodyItalic, fontSize: 18, textAlign: 'center' },

  art: { width: '100%', maxWidth: 900, alignSelf: 'center', overflow: 'hidden' },
  moon: {
    position: 'absolute', right: '14%', top: 28, width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#f7dfa0', boxShadow: '0 0 35px #f7dfa0',
  },
  castle: { position: 'absolute', bottom: 0, left: '50%', marginLeft: -105 },
  dragon: { position: 'absolute', left: '17%', top: '37%', transform: [{ rotate: '-14deg' }] },
  seal: {
    position: 'absolute', right: 18, bottom: 16, width: 46, height: 46, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#d5b55d', backgroundColor: '#26372d', transform: [{ rotate: '45deg' }],
  },
  sealText: { fontFamily: font.cinzel, fontSize: 13, color: '#f2dd9a', transform: [{ rotate: '-45deg' }] },

  parchment: {
    width: '100%', maxWidth: 760, alignSelf: 'center', marginTop: -18, paddingVertical: 34,
    borderWidth: 1, backgroundColor: '#f1e4c2', boxShadow: '0 15px 40px rgba(19,25,19,0.2)',
  },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 30 },
  loadingText: { fontFamily: font.bodyItalic, fontSize: 18, color: '#29382d', textAlign: 'center' },
  paragraph: { fontFamily: font.body, fontSize: 19, lineHeight: 28, color: '#29382d', marginBottom: 12 },
  // No ::first-letter / float in RN: an inline oversized initial instead of a true drop cap.
  dropcap: { fontFamily: font.cinzelBold, fontSize: 40, lineHeight: 28, color: '#93454c' },

  conditions: {
    flexDirection: 'row', gap: 20, paddingVertical: 12,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#c8ad70',
  },
  conditionsCompact: { gap: 9, justifyContent: 'space-between' },
  cond: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  condText: { fontFamily: font.cinzel, fontSize: 12, color: '#29382d' },
  activity: { fontFamily: font.bodyItalic, fontSize: 16, color: '#8c6730', marginTop: 10 },

  question: { fontFamily: font.cinzel, fontSize: 16, color: '#29382d', marginTop: 14, marginBottom: 10 },
  choices: { gap: 8 },
  choice: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 15,
    borderWidth: 1, borderColor: '#b89a5b', backgroundColor: '#e7d6ad',
  },
  diamond: { width: 8, height: 8, borderWidth: 1.5, borderColor: '#374538', transform: [{ rotate: '45deg' }] },
  diamondChosen: { borderColor: '#ffffff' },
  choiceChosen: { backgroundColor: '#354d3b' },
  choiceText: { flex: 1, fontFamily: font.bodySemi, fontSize: 16, color: '#374538' },
  choiceTextChosen: { color: '#ffffff' },

  primary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 15, padding: 14,
    borderWidth: 1, borderColor: '#d5b55d', backgroundColor: '#883c48',
  },
  primaryDisabled: { opacity: 0.45 },
  primaryText: { fontFamily: font.cinzel, fontSize: 12, letterSpacing: 0.72, color: '#ffffff' },
})