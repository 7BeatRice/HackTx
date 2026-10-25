import { LinearGradient } from 'expo-linear-gradient'
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native'
import Svg, { Ellipse, Path, Polygon, Rect } from 'react-native-svg'
import type { Weather } from '../data'
import { usePingPong, useSawtooth } from '../hooks'
import { worldSky } from '../theme'
import { Icon } from './Icon'

type Props = { weather: Weather; temp: number; width: number; height: number }

const TREE = '#314b3b'

/** `.tree-left` / `.tree-right`: a faint trunk blob with two arching branches. */
function Tree({ side }: { side: 'left' | 'right' }) {
  const placement: ViewStyle =
    side === 'left'
      ? { left: -80, transform: [{ rotate: '-8deg' }] }
      : { right: -88, transform: [{ scaleX: -1 }, { rotate: '-8deg' }] }
  return (
    <View style={[styles.tree, placement]}>
      <Svg width={300} height={430} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Rect x={0} y={0} width={145} height={420} rx={62} ry={150} fill={TREE} />
        {/* ::before branch */}
        <Path
          d="M45 33.5 A201.5 111.5 0 0 1 246.5 145"
          fill="none"
          stroke={TREE}
          strokeWidth={17}
          transform="rotate(-14 150 85)"
        />
        {/* ::after branch */}
        <Path
          d="M70 81.5 A166.5 216.5 0 0 1 236.5 298"
          fill="none"
          stroke="rgba(49,75,59,0.65)"
          strokeWidth={7}
          transform="rotate(8 155 188)"
        />
      </Svg>
    </View>
  )
}

function Mushrooms({ side }: { side: 'left' | 'right' }) {
  const placement: ViewStyle =
    side === 'left' ? { left: '6%' } : { right: '8%', transform: [{ scale: 0.8 }] }
  return (
    <View style={[styles.mushrooms, placement]}>
      <View style={styles.stem} />
      <View style={styles.stemTwo} />
      <View style={styles.capTwo} />
      <View style={styles.cap} />
      <View style={[styles.dot, { left: 1, top: -2 }]} />
      <View style={[styles.dot, { left: 13, top: -3 }]} />
    </View>
  )
}

function Castle({ right }: { right: number }) {
  const pts = [
    [8, 100], [8, 35], [17, 35], [17, 17], [23, 4], [29, 17], [29, 45], [42, 45], [42, 26], [48, 12],
    [54, 26], [54, 42], [69, 42], [69, 18], [75, 5], [81, 18], [81, 34], [92, 34], [92, 100],
  ]
    .map(([x, y]) => `${x * 1.7},${y * 1.28}`)
    .join(' ')
  return (
    <View style={{ position: 'absolute', right, bottom: 84, width: 170, height: 128, opacity: 0.2 }}>
      <Svg width={170} height={128}>
        <Polygon points={pts} fill="#46634c" />
        <Path d="M74 128V93a11 11 0 0 1 22 0V128Z" fill="rgba(245,239,208,0.65)" />
      </Svg>
    </View>
  )
}

function Cloud({ style }: { style: ViewStyle }) {
  const c = 'rgba(255,255,255,0.55)'
  return (
    <View style={[{ position: 'absolute', width: 80, height: 20, borderRadius: 30, backgroundColor: c }, style]}>
      <View style={{ position: 'absolute', bottom: 0, left: 15, width: 35, height: 35, borderRadius: 18, backgroundColor: c }} />
      <View style={{ position: 'absolute', bottom: 0, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: c }} />
    </View>
  )
}

/** `border-radius: 50% 50% 0 0` rotated: a half-ellipse top over straight sides. */
function Hill({ w, h, color, style }: { w: number; h: number; color: string; style: ViewStyle }) {
  return (
    <View style={[{ position: 'absolute', width: w, height: h }, style]}>
      <Svg width={w} height={h}>
        <Path d={`M0 ${h}V${h / 2}A${w / 2} ${h / 2} 0 0 1 ${w} ${h / 2}V${h}Z`} fill={color} />
      </Svg>
    </View>
  )
}

function Sparkle({ x, y, delay }: { x: string; y: string; delay: number }) {
  const t = usePingPong(2500, delay, 1)
  return (
    <Animated.View
      style={[
        styles.sparkle,
        {
          left: x as `${number}%`,
          top: y as `${number}%`,
          opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }),
          transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.25] }) }],
        },
      ]}
    />
  )
}

const SPARKLES = [
  { x: '8%', y: '42%', delay: 0 },
  { x: '22%', y: '68%', delay: 1000 },
  { x: '68%', y: '25%', delay: 400 },
  { x: '79%', y: '61%', delay: 1700 },
  { x: '90%', y: '35%', delay: 800 },
  { x: '57%', y: '76%', delay: 2000 },
]

/** One rain/snow particle; timings reproduce the prototype's nth-child rules. */
function Drop({ n, snow, height }: { n: number; snow: boolean; height: number }) {
  const duration = (n % 3 === 0 ? 3.1 : 2.4) * 1000
  const delaySec = n >= 20 ? 1.7 : n % 4 === 0 ? 0.6 : n % 3 === 0 ? 1.2 : 0
  const t = useSawtooth(duration, (delaySec * 1000) / duration)
  const left = n >= 20 ? 50 : 4 + 5 * (n - 1)
  return (
    <Animated.View
      style={[
        snow ? styles.snow : styles.rain,
        {
          left: `${left}%`,
          top: -height * 0.1,
          transform: [
            { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, 24] }) },
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, 540] }) },
            { rotate: '12deg' },
          ],
        },
      ]}
    />
  )
}

export function WorldScene({ weather, temp, width, height }: Props) {
  const sky = worldSky[weather]
  return (
    <>
      <LinearGradient colors={sky.colors} locations={sky.locations} style={StyleSheet.absoluteFill} />

      {weather === 'bright-clouds' && (
        // Approximates the three radial-gradient cloud blobs.
        <Svg width={width} height={height} style={[StyleSheet.absoluteFill, { opacity: 0.78 }]}>
          <Ellipse cx={width * 0.25} cy={height * 0.22} rx={width * 0.085} ry={height * 0.088} fill="#ffffff" />
          <Ellipse cx={width * 0.48} cy={height * 0.15} rx={width * 0.103} ry={height * 0.168} fill="#f6edf8" />
          <Ellipse cx={width * 0.75} cy={height * 0.25} rx={width * 0.117} ry={height * 0.117} fill="#ffffff" />
        </Svg>
      )}

      <Castle right={width * 0.09} />

      {weather === 'sunny' && (
        <View style={styles.sunOrb}>
          <Icon name="sun" size={28} color="#c49327" />
        </View>
      )}

      <Cloud style={{ top: 72, left: 22 }} />
      <Cloud style={{ top: 144, right: -24, transform: [{ scale: 0.8 }] }} />

      <Hill w={520} h={180} color="#b7cb92" style={{ left: -80, bottom: -65, transform: [{ rotate: '-5deg' }] }} />
      <Hill w={540} h={125} color="#91ad74" style={{ left: 100, bottom: -60, transform: [{ rotate: '4deg' }] }} />

      <Tree side="left" />
      <Tree side="right" />
      <Mushrooms side="left" />
      <Mushrooms side="right" />

      {SPARKLES.map((s) => (
        <Sparkle key={s.x + s.y} {...s} />
      ))}

      {weather === 'winter-storm' && (
        <View style={styles.fall}>
          {Array.from({ length: 26 }, (_, i) => (
            <Drop key={i} n={i + 1} snow={temp <= 2} height={height} />
          ))}
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  tree: { position: 'absolute', top: -45, width: 145, height: 420, opacity: 0.33 },
  mushrooms: { position: 'absolute', bottom: 52, width: 16, height: 27 },
  stem: { position: 'absolute', left: 0, top: 0, width: 16, height: 27, borderRadius: 4, backgroundColor: '#eee0bd' },
  stemTwo: { position: 'absolute', left: 26, top: 7, width: 12, height: 23, borderRadius: 3, backgroundColor: '#eee0bd' },
  cap: {
    position: 'absolute', left: -11, top: -7, width: 38, height: 18,
    borderTopLeftRadius: 19, borderTopRightRadius: 19, borderBottomLeftRadius: 6, borderBottomRightRadius: 6,
    backgroundColor: '#a9474f',
  },
  capTwo: {
    position: 'absolute', left: 18, top: 6, width: 28, height: 8, borderRadius: 4, backgroundColor: '#d58a70',
  },
  dot: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: '#faeac4' },
  sparkle: {
    position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff0a1',
    boxShadow: '0 0 10px 3px rgba(255,234,133,0.7)',
  },
  sunOrb: {
    position: 'absolute', top: 27, right: 28, width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffe6a4',
    boxShadow: '0 0 0 12px rgba(255,230,164,0.22)',
  },
  fall: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', pointerEvents: 'none' },
  rain: { position: 'absolute', width: 2, height: 17, backgroundColor: 'rgba(225,242,245,0.65)' },
  snow: { position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.88)' },
})
