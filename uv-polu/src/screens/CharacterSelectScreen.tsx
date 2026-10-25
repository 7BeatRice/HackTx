import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'
import { ChamferBox } from '../components/ChamferBox'
import { Icon } from '../components/Icon'
import { characters, type Character } from '../data'
import { useMetrics } from '../hooks'
import { font, mix } from '../theme'

type Props = {
  selected: Character
  onBack: () => void
  onSelect: (character: Character) => void
}

export function CharacterSelectScreen({ selected, onBack, onSelect }: Props) {
  const insets = useSafeAreaInsets()
  const { width, height, compact } = useMetrics()
  const hPad = Math.min(42, Math.max(18, width * 0.05))
  const cols = compact ? 2 : 3
  const gap = 12
  const gridW = Math.min(660, width - hPad * 2)
  const cardW = (gridW - gap * (cols - 1)) / cols
  const titleSize = Math.min(36, Math.max(25, width * 0.05))
  // circle at 85% 8%, fading out at 24% of the distance to the farthest corner
  const glowR = 0.24 * Math.hypot(width * 0.85, height * 0.92)

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#f9f3e3', '#e9efdc']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* radial-gradient(circle at 85% 8%, rgba(255,221,145,.5), transparent 24%) */}
      <Svg style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} width={width} height={height}>
        <Defs>
          <RadialGradient
            id="glow"
            gradientUnits="userSpaceOnUse"
            cx={width * 0.85}
            cy={height * 0.08}
            fx={width * 0.85}
            fy={height * 0.08}
            rx={glowR}
            ry={glowR}
          >
            <Stop offset="0" stopColor="#ffdd91" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#ffdd91" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#glow)" />
      </Svg>

      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 12) + 18,
          paddingBottom: 50 + insets.bottom,
          paddingHorizontal: hPad,
        }}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to home" style={styles.back}>
            <Icon name="back" size={20} color="#48614d" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>THE ENCHANTED WARDROBE</Text>
            <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.2 }]}>
              Choose your fairytale
            </Text>
          </View>
        </View>

        <Text style={styles.intro}>
          Every hero unlocks their own story, quests, and magical path through the kingdom.
        </Text>

        <View style={[styles.grid, { width: gridW, gap }]}>
          {characters.map((character) => {
            const isSelected = selected.name === character.name
            return (
              <Pressable
                key={character.name}
                onPress={() => onSelect(character)}
                accessibilityRole="button"
                accessibilityLabel={`${character.name}, ${character.title}`}
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [{ width: cardW }, pressed && styles.pressed]}
              >
                <ChamferBox
                  cut={10}
                  fill={isSelected ? '#ffffff' : 'rgba(255,252,236,0.78)'}
                  stroke={isSelected ? character.color : '#a98a49'}
                  strokeWidth={isSelected ? 2 : 1}
                  style={styles.option}
                >
                  <View
                    style={[
                      styles.portrait,
                      {
                        backgroundColor: character.color,
                        boxShadow: `0 0 0 2px ${mix(character.color, '#ffffff', 38)}`,
                      },
                    ]}
                  >
                    {/* "ears" and "cape" sit behind the initial */}
                    <View style={[styles.ear, { left: 7, backgroundColor: character.color }]} />
                    <View style={[styles.ear, { right: 7, backgroundColor: character.color }]} />
                    <View style={[styles.cape, { backgroundColor: character.color }]} />
                    <Text style={styles.initial}>{character.initial}</Text>
                  </View>
                  <Text style={styles.name}>{character.name}</Text>
                  <Text style={styles.role}>{character.title}</Text>
                  {isSelected && (
                    <View style={[styles.check, { backgroundColor: character.color }]}>
                      <Icon name="check" size={12} color="#ffffff" />
                    </View>
                  )}
                </ChamferBox>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9f3e3' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, width: '100%', maxWidth: 660, alignSelf: 'center' },
  back: {
    width: 42, height: 42, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#d9d7c8', borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.72)',
  },
  headerText: { flex: 1 },
  kicker: { fontFamily: font.bodyBold, fontSize: 9, letterSpacing: 1.44, color: '#a14c4f' },
  title: { fontFamily: font.cinzelBold, marginTop: 3, color: '#293b2e' },
  intro: {
    width: '100%', maxWidth: 580, alignSelf: 'center', marginTop: 18, marginBottom: 24,
    fontFamily: font.bodySemi, fontSize: 17, lineHeight: 25, color: '#596758',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center' },
  pressed: { opacity: 0.85, transform: [{ translateY: -3 }] },
  option: { minHeight: 154, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 7 },
  portrait: {
    width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 9,
    borderWidth: 3, borderColor: '#e6cf8c',
    borderTopLeftRadius: 32, borderTopRightRadius: 32, borderBottomLeftRadius: 27, borderBottomRightRadius: 27,
  },
  initial: { fontFamily: font.cinzelBold, fontSize: 22, color: '#ffffff' },
  ear: { position: 'absolute', top: -11, width: 11, height: 11, transform: [{ rotate: '45deg' }] },
  cape: {
    position: 'absolute', bottom: -8, width: 48, height: 24,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  name: { fontFamily: font.cinzel, fontSize: 13, lineHeight: 16, textAlign: 'center', color: '#324335' },
  role: { marginTop: 3, fontFamily: font.body, fontSize: 10, textAlign: 'center', color: '#687668' },
  check: {
    position: 'absolute', top: 8, right: 8, width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
    borderRadius: 1,
  },
})
