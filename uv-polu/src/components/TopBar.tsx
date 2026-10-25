import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { Character } from '../data'
import { alpha, font, mix, useTheme } from '../theme'

type Props = {
  kingdom: string
  selected: Character
  onAvatar: () => void
}

export function TopBar({ kingdom, selected, onAvatar }: Props) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: Math.max(insets.top, 12) + 6,
          backgroundColor: mix(theme.paper, '#ffffff', 10),
          borderBottomColor: theme.gold,
        },
      ]}
    >
      <View style={styles.brand}>
        <LinearGradient colors={['#557459', '#263f2d']} style={StyleSheet.absoluteFill} />
        <Text style={styles.brandText}>W</Text>
      </View>

      <View style={styles.titleWrap}>
        <Text style={[styles.kicker, { color: alpha(theme.ink, 0.58) }]}>GOOD MORNING, HERO</Text>
        <Text style={[styles.kingdom, { color: theme.ink }]} numberOfLines={2}>
          {kingdom}
        </Text>
      </View>

      <Pressable
        onPress={onAvatar}
        accessibilityRole="button"
        accessibilityLabel="Choose character"
        hitSlop={10}
        style={[
          styles.avatar,
          {
            backgroundColor: selected.color,
            borderColor: theme.gold,
            boxShadow: `0 0 0 2px ${mix(theme.paper, '#ffffff', 20)}`,
          },
        ]}
      >
        <Text style={styles.avatarText}>{selected.initial}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
  },
  brand: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#d8b95e',
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    borderBottomLeftRadius: 19,
    borderBottomRightRadius: 19,
    boxShadow: '0 3px 0 #8f7436',
  },
  brandText: { fontFamily: font.cinzelBold, fontSize: 21, color: '#fff0b9' },
  titleWrap: { flex: 1 },
  kicker: { fontFamily: font.cinzel, fontSize: 9, letterSpacing: 1.44, marginBottom: 5 },
  kingdom: { fontFamily: font.cinzel, fontSize: 20, lineHeight: 22, letterSpacing: 0.4 },
  avatar: {
    width: 38,
    height: 38,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  avatarText: { fontFamily: font.cinzelBold, fontSize: 16, color: '#ffffff', transform: [{ rotate: '-45deg' }] },
})