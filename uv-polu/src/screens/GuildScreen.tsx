import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { heroClassFor, type Weather } from '../data'
import { useMetrics } from '../hooks'
import { font, mix, useTheme } from '../theme'

type Props = {
  weather: Weather
  encouraged: string[]
  onEncourage: (name: string) => void
}

const FEED = [
  ['Maya', 'unlocked Chapter VIII'],
  ['Alex', 'completed The Golden Hour'],
  ['Bhavya', 'discovered the Forgotten Grove'],
]

export function GuildScreen({ weather, encouraged, onEncourage }: Props) {
  const theme = useTheme()
  const { width, compact, pad } = useMetrics()
  const headingSize = Math.min(46, Math.max(28, width * 0.05))
  const heroClass = heroClassFor(weather)

  const standings = [
    ['1', 'Alex', 'Sun Knight', '12', '2,450'],
    ['2', 'Bhavya', 'Forest Guardian', '10', '2,180'],
    ['3', 'Maya', 'Moon Mage', '9', '1,920'],
    ['4', 'You', heroClass, '4', '720'],
  ]

  return (
    <View style={[styles.page, { paddingHorizontal: pad }]}>
      <LinearGradient colors={[mix(theme.paper, '#ffffff', 16), theme.paper]} style={StyleSheet.absoluteFill} />

      <View style={styles.heading}>
        <Text style={[styles.kicker, { color: theme.gold }]}>THE FELLOWSHIP HALL</Text>
        <Text style={[styles.title, { color: theme.ink, fontSize: headingSize, lineHeight: headingSize * 1.15 }]}>
          Your Guild
        </Text>
        <Text style={[styles.sub, { color: theme.ink }]}>Celebrate friends and the stories they are writing</Text>
      </View>

      <View style={[styles.layout, !compact && styles.layoutWide]}>
        <View style={[styles.panel, { borderColor: theme.gold }, !compact && { flex: 1.2 }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={[styles.panelKicker, { color: theme.gold }]}>THIS MOON</Text>
              <Text style={styles.panelTitle}>Guild standings</Text>
            </View>
            <Pressable accessibilityRole="button" style={styles.addFriend}>
              <Text style={styles.addFriendText}>+ Add friend</Text>
            </Pressable>
          </View>

          <View style={styles.rankLabels}>
            <Text style={styles.rankLabel}>RANK / PLAYER</Text>
            <Text style={styles.rankLabel}>LEVEL · XP</Text>
          </View>

          {standings.map(([rank, name, title, level, points]) => (
            <View key={name} style={[styles.row, name === 'You' && styles.rowYou]}>
              <Text style={styles.rank}>{rank}</Text>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{name[0]}</Text>
              </View>
              <View style={styles.rowName}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.title2}>{title}</Text>
              </View>
              <View style={styles.rowScore}>
                <Text style={styles.level}>Lv {level}</Text>
                <Text style={styles.points}>{points} XP</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.panel, { borderColor: theme.gold }, !compact && { flex: 0.8 }]}>
          <Text style={[styles.panelKicker, { color: theme.gold }]}>FRIEND ACTIVITY</Text>
          <Text style={styles.panelTitle}>Tales from the guild</Text>
          {FEED.map(([name, action]) => {
            const sent = encouraged.includes(name)
            return (
              <View key={name} style={styles.feedItem}>
                <View style={[styles.avatar, { width: 35, height: 35 }]}>
                  <Text style={styles.avatarText}>{name[0]}</Text>
                </View>
                <Text style={styles.feedText}>
                  <Text style={styles.feedName}>{name}</Text> {action}
                </Text>
                <Pressable
                  disabled={sent}
                  onPress={() => onEncourage(name)}
                  accessibilityRole="button"
                  accessibilityLabel={`Encourage ${name}`}
                  hitSlop={8}
                  style={styles.feedButton}
                >
                  <Text style={[styles.feedButtonText, sent && styles.feedButtonSent]}>
                    {sent ? 'Sent' : 'Encourage'}
                  </Text>
                </Pressable>
              </View>
            )
          })}
        </View>
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

  layout: { width: '100%', maxWidth: 1000, alignSelf: 'center', gap: 18 },
  layoutWide: { flexDirection: 'row', alignItems: 'flex-start' },
  panel: { padding: 20, borderWidth: 1, backgroundColor: '#eadbb8' },
  panelHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#bca46e',
  },
  panelKicker: { fontFamily: font.cinzel, fontSize: 10, letterSpacing: 1.8 },
  panelTitle: { fontFamily: font.cinzel, fontSize: 20, marginTop: 4, marginBottom: 14, color: '#29382d' },
  addFriend: { paddingVertical: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: '#947538', marginBottom: 14 },
  addFriendText: { fontFamily: font.cinzel, fontSize: 9, color: '#29382d' },

  rankLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 4 },
  rankLabel: { fontFamily: font.cinzel, fontSize: 8, letterSpacing: 0.8, color: '#876c38' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 5,
    borderBottomWidth: 1, borderBottomColor: '#cbb888',
  },
  rowYou: { backgroundColor: '#dfc98f' },
  rank: { width: 25, fontFamily: font.cinzel, fontSize: 14, color: '#29382d' },
  avatar: {
    width: 34, height: 34, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#8f713a', backgroundColor: '#4b654e',
  },
  avatarText: { fontFamily: font.cinzel, fontSize: 13, color: '#ffffff' },
  rowName: { flex: 1 },
  name: { fontFamily: font.bodyBold, fontSize: 16, color: '#29382d' },
  title2: { fontFamily: font.body, fontSize: 13, color: '#29382d' },
  rowScore: { alignItems: 'flex-end' },
  level: { fontFamily: font.bodyBold, fontSize: 16, color: '#29382d' },
  points: { fontFamily: font.body, fontSize: 13, color: '#29382d' },

  feedItem: {
    flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#cbb888',
  },
  feedText: { flex: 1, fontFamily: font.body, fontSize: 14, color: '#29382d' },
  feedName: { fontFamily: font.bodyBold },
  feedButton: { padding: 6 },
  feedButtonText: { fontFamily: font.cinzel, fontSize: 8, color: '#7f3944' },
  feedButtonSent: { color: '#62705e' },
})
