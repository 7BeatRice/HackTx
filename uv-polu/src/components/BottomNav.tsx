import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import type { IconName, Screen } from '../data'
import { alpha, font, mix, useTheme } from '../theme'
import { Icon } from './Icon'

type Tab = { screen: Screen; label: string; icon: IconName; badge?: string | true }

const tabs: Tab[] = [
  { screen: 'home', label: 'Home', icon: 'home' },
  { screen: 'story', label: 'Story', icon: 'book', badge: true },
  { screen: 'quests', label: 'Quests', icon: 'sword', badge: '2' },
  { screen: 'guild', label: 'Guild', icon: 'trophy' },
]

export const NAV_HEIGHT = 82

export function BottomNav({ screen, onChange }: { screen: Screen; onChange: (s: Screen) => void }) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const inactive = alpha(theme.ink, 0.6)

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.nav,
        {
          height: NAV_HEIGHT + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          borderTopColor: theme.gold,
          backgroundColor: mix(theme.paper, '#111111', 8),
        },
      ]}
    >
      {tabs.map((tab) => {
        const active = screen === tab.screen
        const color = active ? theme.navActive : inactive
        return (
          <Pressable
            key={tab.screen}
            onPress={() => onChange(tab.screen)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            style={styles.tab}
          >
            {active && (
              <View style={styles.marker}>
                <Svg width={12} height={12} viewBox="0 0 12 12">
                  <Path d="M6 0 7.5 4.5 12 6 7.5 7.5 6 12 4.5 7.5 0 6 4.5 4.5Z" fill="#a77a24" />
                </Svg>
              </View>
            )}
            <Icon name={tab.icon} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
            {tab.badge !== undefined && (
              <View style={[styles.badge, tab.badge === true && styles.badgeDot]}>
                {tab.badge !== true && <Text style={styles.badgeText}>{tab.badge}</Text>}
              </View>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 10,
    paddingHorizontal: 12,
    borderTopWidth: 2,
    boxShadow: '0 -8px 28px rgba(10,15,12,0.2)',
  },
  tab: { flex: 1, minWidth: 70, maxWidth: 150, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontFamily: font.cinzel, fontSize: 10 },
  marker: {
    position: 'absolute',
    top: -12,
    width: 34,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff9e9',
  },
  badge: {
    position: 'absolute',
    top: 5,
    left: '50%',
    marginLeft: 8,
    minWidth: 14,
    height: 14,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 2,
    backgroundColor: '#bc4851',
  },
  badgeDot: { minWidth: 7, width: 7, height: 7, paddingHorizontal: 0, borderWidth: 1 },
  badgeText: { fontFamily: font.cinzelBold, fontSize: 7, color: '#ffffff' },
})
