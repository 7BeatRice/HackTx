import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ChamferBox } from '../components/ChamferBox'
import { Icon } from '../components/Icon'
import { weatherCopy, type IconName, type Readings, type Weather } from '../data'
import { useMetrics } from '../hooks'
import { font, mix, useTheme } from '../theme'

type Props = {
  weather: Weather
  readings: Readings
  completedQuests: string[]
  onToggle: (id: string) => void
}

type Quest = { id: string; type: string; title: string; text: string; reward: string; icon: IconName }

export function QuestsScreen({ weather, readings, completedQuests, onToggle }: Props) {
  const theme = useTheme()
  const { width, compact, pad } = useMetrics()
  const headingSize = Math.min(46, Math.max(28, width * 0.05))

  const quests: Quest[] = [
    {
      id: 'golden',
      type: 'TIME-BOUND',
      title: weather === 'sunny' ? 'The Golden Hour' : 'The Weathered Path',
      text: weatherCopy[weather].quest,
      reward: '+50 XP',
      icon: 'sun',
    },
    {
      id: 'grove',
      type: 'EXPLORATION',
      title: 'The Forgotten Grove',
      text: 'Visit a nearby green space and help restore the ancient grove.',
      reward: '+75 XP',
      icon: 'leaf',
    },
    {
      id: 'shelter',
      type: 'ENVIRONMENT',
      title: readings.precipitation > 45 ? 'The Stormkeeper' : 'The Shaded Sanctuary',
      text:
        readings.precipitation > 45
          ? 'Find a safe shelter before the weather turns.'
          : 'Find a cool shaded place and pause beneath its canopy.',
      reward: '+40 XP',
      icon: 'droplet',
    },
  ]

  return (
    <View style={[styles.page, { paddingHorizontal: pad }]}>
      <LinearGradient colors={[mix(theme.paper, '#ffffff', 16), theme.paper]} style={StyleSheet.absoluteFill} />

      <View style={styles.heading}>
        <Text style={[styles.kicker, { color: theme.gold }]}>THE ADVENTURER'S LEDGER</Text>
        <Text style={[styles.title, { color: theme.ink, fontSize: headingSize, lineHeight: headingSize * 1.15 }]}>
          Quests of the Realm
        </Text>
        <Text style={[styles.sub, { color: theme.ink }]}>Real-world adventures shaped by the world around you</Text>
      </View>

      <View style={[styles.summary, { borderColor: theme.gold }]}>
        {[
          ['2', 'Active'],
          [String(completedQuests.length), 'Complete'],
          ['720', 'Total XP'],
        ].map(([value, label], i, all) => (
          <View
            key={label}
            style={[styles.summaryCell, { borderColor: theme.gold }, i === all.length - 1 && { borderRightWidth: 0 }]}
          >
            <Text style={[styles.summaryValue, { color: theme.ink }]}>{value}</Text>
            <Text style={[styles.summaryLabel, { color: theme.ink }]}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.list}>
        {quests.map((quest, index) => {
          const done = completedQuests.includes(quest.id)
          const runeSize = compact ? 40 : 52
          return (
            <ChamferBox
              key={quest.id}
              cut={[10, 0, 10, 0]}
              fill="#eadbb8"
              stroke={theme.gold}
              strokeWidth={1}
              style={[styles.card, done && styles.cardDone]}
            >
              <View style={[styles.rune, { width: runeSize, height: runeSize }]}>
                <View style={styles.runeIcon}>
                  <Icon name={quest.icon} color="#29382d" />
                </View>
              </View>

              <View style={styles.copy}>
                <Text style={styles.type}>
                  {quest.type} · QUEST {index + 1}
                </Text>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questText}>{quest.text}</Text>
                <View style={styles.footer}>
                  <Text style={styles.reward}>{quest.reward}</Text>
                  <Text style={styles.safe}>Safe conditions only</Text>
                </View>
              </View>

              <Pressable
                onPress={() => onToggle(quest.id)}
                accessibilityRole="button"
                accessibilityLabel={done ? 'Mark quest as not complete' : 'Begin quest'}
                style={[styles.action, compact && styles.actionCompact]}
              >
                {done ? <Icon name="check" size={14} color="#ffffff" /> : <Text style={styles.actionText}>Begin</Text>}
              </Pressable>
            </ChamferBox>
          )
        })}
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

  summary: { width: '100%', maxWidth: 700, alignSelf: 'center', flexDirection: 'row', marginBottom: 20, borderWidth: 1 },
  summaryCell: { flex: 1, padding: 12, alignItems: 'center', borderRightWidth: 1 },
  summaryValue: { fontFamily: font.cinzel, fontSize: 22 },
  summaryLabel: { fontFamily: font.body, fontSize: 12 },

  list: { width: '100%', maxWidth: 820, alignSelf: 'center', gap: 12 },
  card: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16, padding: 18 },
  cardDone: { opacity: 0.6 },
  rune: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#95763c', transform: [{ rotate: '45deg' }] },
  runeIcon: { transform: [{ rotate: '-45deg' }] },
  copy: { flex: 1, minWidth: 150 },
  type: { fontFamily: font.cinzel, fontSize: 9, letterSpacing: 0.9, color: '#8c6730' },
  questTitle: { fontFamily: font.cinzel, fontSize: 18, marginVertical: 3, color: '#29382d' },
  questText: { fontFamily: font.body, fontSize: 16, marginVertical: 4, color: '#29382d' },
  footer: { flexDirection: 'row', gap: 12, alignItems: 'baseline' },
  reward: { fontFamily: font.bodyBold, fontSize: 16, color: '#8f3e48' },
  safe: { fontFamily: font.body, fontSize: 12, color: '#29382d' },
  action: {
    minWidth: 66, padding: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#8d723b', backgroundColor: '#344c39',
  },
  // Phone layout: the button drops below the copy, aligned with it (prototype: grid-column 2, width 80).
  actionCompact: { width: 80, marginLeft: 56 },
  actionText: { fontFamily: font.cinzel, fontSize: 10, color: '#ffffff' },
})
