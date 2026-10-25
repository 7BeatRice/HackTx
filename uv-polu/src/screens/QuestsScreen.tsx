import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { ChamferBox } from '../components/ChamferBox'
import { Icon } from '../components/Icon'
import { useMetrics } from '../hooks'
import type { Story, StoryQuest } from '../story'
import { font, mix, useTheme } from '../theme'

type Props = {
  story: Story | null
  loading: boolean
  completedQuests: string[]
  /** Lifetime XP earned. */
  xp: number
  onComplete: (quest: StoryQuest) => void
}

export function QuestsScreen({ story, loading, completedQuests, xp, onComplete }: Props) {
  const theme = useTheme()
  const { width, compact, pad } = useMetrics()
  const headingSize = Math.min(46, Math.max(28, width * 0.05))
  const [pending, setPending] = useState<StoryQuest | null>(null)

  const quests = story?.quests ?? []
  const doneCount = quests.filter((q) => completedQuests.includes(q.id)).length
  const activeCount = quests.length - doneCount

  const claim = () => {
    if (pending) onComplete(pending)
    setPending(null)
  }

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
          [String(activeCount), 'Active'],
          [String(doneCount), 'Complete'],
          [String(xp), 'Total XP'],
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
        {!story && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#93454c" />
            <Text style={[styles.sub, { color: theme.ink }]}>
              {loading ? 'The storyteller is writing your quests…' : 'No quests yet.'}
            </Text>
          </View>
        )}

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
                  <Text style={styles.reward}>+{quest.xp} XP</Text>
                  <Text style={styles.safe}>Safe conditions only</Text>
                </View>
              </View>

              <Pressable
                disabled={done}
                onPress={() => setPending(quest)}
                accessibilityRole="button"
                accessibilityLabel={done ? 'Quest complete' : `Complete quest: ${quest.title}`}
                style={[styles.action, compact && styles.actionCompact, done && styles.actionDone]}
              >
                {done ? <Icon name="check" size={14} color="#ffffff" /> : <Text style={styles.actionText}>Complete</Text>}
              </Pressable>
            </ChamferBox>
          )
        })}
      </View>

      <Modal transparent visible={pending !== null} animationType="fade" onRequestClose={() => setPending(null)}>
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { borderColor: theme.gold }]}>
            <Text style={styles.sheetKicker}>VICTORY</Text>
            <Text style={styles.sheetTitle}>{pending?.title}</Text>
            <Text style={styles.sheetText}>{pending?.victory}</Text>
            <Text style={styles.sheetXp}>+{pending?.xp} XP</Text>

            <Pressable onPress={claim} accessibilityRole="button" style={styles.claim}>
              <Text style={styles.claimText}>Claim reward</Text>
            </Pressable>
            <Pressable onPress={() => setPending(null)} accessibilityRole="button" style={styles.notYet}>
              <Text style={styles.notYetText}>Not yet</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 30 },
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
    minWidth: 86, padding: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#8d723b', backgroundColor: '#344c39',
  },
  // Phone layout: the button drops below the copy, aligned with it.
  actionCompact: { width: 96, marginLeft: 56 },
  actionDone: { backgroundColor: '#4e8b60' },
  actionText: { fontFamily: font.cinzel, fontSize: 10, color: '#ffffff' },

  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(14,20,15,0.6)' },
  sheet: {
    width: '100%', maxWidth: 440, padding: 26, borderWidth: 2, backgroundColor: '#f1e4c2',
    boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
  },
  sheetKicker: { fontFamily: font.cinzel, fontSize: 10, letterSpacing: 1.8, textAlign: 'center', color: '#8c6730' },
  sheetTitle: { fontFamily: font.cinzel, fontSize: 24, textAlign: 'center', marginVertical: 8, color: '#29382d' },
  sheetText: { fontFamily: font.body, fontSize: 18, lineHeight: 26, textAlign: 'center', color: '#29382d' },
  sheetXp: { fontFamily: font.cinzelBold, fontSize: 22, textAlign: 'center', marginVertical: 14, color: '#8f3e48' },
  claim: { padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#d5b55d', backgroundColor: '#883c48' },
  claimText: { fontFamily: font.cinzel, fontSize: 12, letterSpacing: 0.72, color: '#ffffff' },
  notYet: { padding: 12, alignItems: 'center', marginTop: 4 },
  notYetText: { fontFamily: font.bodySemi, fontSize: 14, color: '#6f7e6d' },
})