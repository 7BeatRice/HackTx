import { forwardRef, useContext, useEffect, useId, useMemo, useRef, useState, type ComponentProps } from 'react'
import { Animated, Easing, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native'
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg'
import type { Timeframe } from '../data'
import { MotionContext } from '../hooks'
import { font, useTheme } from '../theme'
import { ChamferBox } from './ChamferBox'

/**
 * Animated.createAnimatedComponent always passes `collapsable={false}`. On web
 * react-native-svg forwards that to the DOM <path>/<circle>, which React warns
 * about, so these thin wrappers drop it. Native is unaffected.
 */
const SvgPath = forwardRef<Path, ComponentProps<typeof Path>>(function SvgPath({ collapsable: _c, ...props }, ref) {
  return <Path ref={ref} {...props} />
})
const SvgCircle = forwardRef<Circle, ComponentProps<typeof Circle>>(function SvgCircle(
  { collapsable: _c, ...props },
  ref,
) {
  return <Circle ref={ref} {...props} />
})

const AnimatedPath = Animated.createAnimatedComponent(SvgPath)
const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle)

export type TrendPoint = { time: string; value: number }

type Props = {
  title: string
  series: Record<Timeframe, TrendPoint[]>
  color: string
  /** Card width, so the chart can size itself before the first layout pass. */
  width: number
  /** Fixed y-axis range. Defaults to 0 → a "nice" maximum. */
  domain?: [number, number]
}

const H = 140
const M = { l: 30, r: 12, t: 10, b: 24 }
const STEPS = [1, 1.5, 2, 3, 4, 5, 6, 8, 10]
const PARCHMENT = { angle: 145, stops: [[0, '#f8efd8'], [1, '#dfd0aa']] as [number, string][] }

function niceMax(max: number): number {
  if (max <= 0) return 1
  const mag = Math.pow(10, Math.floor(Math.log10(max)))
  const norm = max / mag
  const step = STEPS.find((s) => norm <= s) ?? 10
  return step * mag
}

type Pt = { x: number; y: number; label: string }

/** Smooth curve through the points (Catmull-Rom converted to cubic beziers). */
function smooth(pts: Pt[]): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    d += ` C${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`
  }
  return d
}

export function TrendChart({ title, series, color, width, domain }: Props) {
  const theme = useTheme()
  const reduceMotion = useContext(MotionContext)
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '')

  const [timeframe, setTimeframe] = useState<Timeframe>('day')
  const [w, setW] = useState(Math.max(160, width - 28))
  const data = series[timeframe]

  const { lineD, areaD, pts, ticks, len } = useMemo(() => {
    const values = data.map((p) => p.value)
    const lo = domain ? domain[0] : 0
    const hi = domain ? domain[1] : niceMax(Math.max(...values))
    const iw = w - M.l - M.r
    const ih = H - M.t - M.b
    const baseY = M.t + ih
    const pts: Pt[] = data.map((p, i) => ({
      x: M.l + (data.length === 1 ? 0 : (i / (data.length - 1)) * iw),
      y: baseY - Math.min(1, Math.max(0, (p.value - lo) / (hi - lo))) * ih,
      label: p.time,
    }))
    const lineD = smooth(pts)
    const areaD = pts.length > 1 ? `${lineD} L${pts[pts.length - 1].x} ${baseY} L${pts[0].x} ${baseY} Z` : ''
    const ticks = [0, 0.5, 1].map((f) => ({
      y: baseY - f * ih,
      text: String(+(lo + (hi - lo) * f).toFixed(1)),
    }))
    let len = 0
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
    // Bezier curves are a little longer than the straight chords between points.
    return { lineD, areaD, pts, ticks, len: len * 1.25 + 10 }
  }, [data, domain, w])

  // The line draws itself, the fill fades in, the dots pop, then the latest
  // reading keeps pulsing. Replays on 24H / 7D changes and on new readings.
  const draw = useRef(new Animated.Value(0)).current
  const pop = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(0)).current

  // Compare by content, not identity, so unrelated parent re-renders don't replay it.
  const signature = `${timeframe}:${data.map((p) => p.value).join(',')}`

  useEffect(() => {
    if (reduceMotion) {
      draw.setValue(1)
      pop.setValue(1)
      return
    }
    draw.setValue(0)
    pop.setValue(0)
    const run = Animated.sequence([
      Animated.timing(draw, { toValue: 1, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(pop, { toValue: 1, duration: 450, easing: Easing.out(Easing.back(2.5)), useNativeDriver: false }),
    ])
    run.start()
    return () => run.stop()
  }, [signature, reduceMotion, draw, pop])

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(1) // ring fully faded out
      return
    }
    pulse.setValue(0)
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: false }),
    )
    loop.start()
    return () => loop.stop()
  }, [reduceMotion, pulse])

  const onLayout = (e: LayoutChangeEvent) => {
    const next = e.nativeEvent.layout.width
    setW((cur) => (Math.abs(cur - next) < 0.5 ? cur : next))
  }

  const last = pts[pts.length - 1]
  const latest = data[data.length - 1]

  return (
    <ChamferBox cut={9} fill={PARCHMENT} stroke={theme.gold} strokeWidth={1} style={[styles.card, { width }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title.toUpperCase()}</Text>
          <Text style={styles.sub}>{timeframe === 'day' ? '24-hour readings' : '7-day averages'}</Text>
        </View>

        <View style={[styles.toggle, { borderColor: theme.gold }]}>
          {(['day', 'week'] as const).map((key) => {
            const on = timeframe === key
            return (
              <Pressable
                key={key}
                onPress={() => setTimeframe(key)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${title}: ${key === 'day' ? '24 hours' : '7 days'}`}
                style={[styles.toggleBtn, on && styles.toggleOn]}
              >
                <Text style={[styles.toggleText, { color: on ? '#ffffff' : '#677367' }]}>
                  {key === 'day' ? '24H' : '7D'}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      <View
        onLayout={onLayout}
        accessible
        accessibilityLabel={`${title} chart. Latest reading ${latest ? latest.value : 'unknown'}.`}
        style={styles.chart}
      >
        <Svg width={w} height={H}>
          <Defs>
            <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.05" stopColor={color} stopOpacity={0.6} />
              <Stop offset="0.95" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {ticks.map((tk, i) => (
            <Line
              key={`g${i}`}
              x1={M.l}
              x2={w - M.r}
              y1={tk.y}
              y2={tk.y}
              stroke="rgba(103,115,103,0.35)"
              strokeWidth={1}
              strokeDasharray={i === 0 ? undefined : '3 5'}
            />
          ))}
          {ticks.map((tk, i) => (
            <SvgText
              key={`t${i}`}
              x={M.l - 6}
              y={tk.y + 3}
              fontSize={9}
              fontFamily={font.bodySemi}
              fill="#677367"
              textAnchor="end"
            >
              {tk.text}
            </SvgText>
          ))}

          {areaD ? (
            <AnimatedPath
              d={areaD}
              fill={`url(#${gid})`}
              opacity={draw.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] })}
            />
          ) : null}
          {lineD ? (
            <AnimatedPath
              d={lineD}
              stroke={color}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${len} ${len}`}
              strokeDashoffset={draw.interpolate({ inputRange: [0, 1], outputRange: [len, 0] })}
            />
          ) : null}

          {pts.map((p, i) => (
            <AnimatedCircle
              key={`d${i}`}
              cx={p.x}
              cy={p.y}
              r={pop.interpolate({ inputRange: [0, 1], outputRange: [0, 3.2] })}
              fill="#fffaf0"
              stroke={color}
              strokeWidth={2}
            />
          ))}
          {last ? (
            <AnimatedCircle
              cx={last.x}
              cy={last.y}
              r={pulse.interpolate({ inputRange: [0, 1], outputRange: [4, 13] })}
              fill="none"
              stroke={color}
              strokeWidth={2}
              opacity={pop}
              strokeOpacity={pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] })}
            />
          ) : null}

          {pts.map((p, i) => (
            <SvgText
              key={`x${i}`}
              x={p.x}
              y={H - 7}
              fontSize={9}
              fontFamily={font.bodyBold}
              fill="#4d5d4f"
              textAnchor={i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}
            >
              {p.label}
            </SvgText>
          ))}
        </Svg>
      </View>
    </ChamferBox>
  )
}

const styles = StyleSheet.create({
  card: { padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  headerText: { flex: 1, minWidth: 0 },
  title: { fontFamily: font.cinzel, fontSize: 11, letterSpacing: 0.8, color: '#26372d' },
  sub: { marginTop: 1, fontFamily: font.body, fontSize: 10, color: '#677367' },
  toggle: { flexDirection: 'row', padding: 2, borderWidth: 1, borderRadius: 999, backgroundColor: 'rgba(255,250,240,0.7)' },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  toggleOn: { backgroundColor: '#4d6a4e' },
  toggleText: { fontFamily: font.cinzel, fontSize: 9, letterSpacing: 0.5 },
  chart: { marginTop: 6 },
})
