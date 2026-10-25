import type { ReactNode } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg'
import type { Weather } from '../data'
import { usePingPong } from '../hooks'

const VB_W = 390
const VB_H = 350

const WING_L = 'M150 176C108 123 48 123 18 174c30-8 48 5 48 31 24-14 46-3 49 24 15-18 29-21 48-8Z'
const WING_L_VEINS = 'M147 179C108 151 67 157 43 188M145 184c-27 1-43 17-30 45'
const WING_R = 'M240 176c42-53 102-53 132-2-30-8-48 5-48 31-24-14-46-3-49 24-15-18-29-21-48-8Z'
const WING_R_VEINS = 'M243 179c39-28 80-22 104 9M245 184c27 1 43 17 30 45'
const CLOAK =
  'M151 173c-12 27-21 72-28 132 22-8 39-5 52 9 8-14 15-19 20-19s12 5 20 19c13-14 30-17 52-9-7-60-16-105-28-132Z'

function BatDefs() {
  return (
    <Defs>
      <LinearGradient id="cloak" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0" stopColor="#ee7070" />
        <Stop offset="0.5" stopColor="#bd3e51" />
        <Stop offset="1" stopColor="#76243c" />
      </LinearGradient>
      <RadialGradient id="fur" cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor="#8f756d" />
        <Stop offset="1" stopColor="#4a363d" />
      </RadialGradient>
      <LinearGradient id="wingMembrane" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0" stopColor="#745965" />
        <Stop offset="1" stopColor="#3d303b" />
      </LinearGradient>
      {/* Stands in for the prototype's blurred `glow` filter. */}
      <RadialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor="#ffe797" stopOpacity="1" />
        <Stop offset="1" stopColor="#ffe797" stopOpacity="0" />
      </RadialGradient>
    </Defs>
  )
}

/** Every layer shares the same viewBox so they stack exactly like one SVG. */
function Layer({ children }: { children: ReactNode }) {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={StyleSheet.absoluteFill}>
      <BatDefs />
      {children}
    </Svg>
  )
}

function Umbrella({ scale }: { scale: number }) {
  const bob = usePingPong(2800, 0, 0)
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4 * scale] }) }] },
      ]}
    >
      <Layer>
        <Path d="M247 87c23-28 60-20 71 9-25-9-47-2-71 8Z" fill="#e8c66b" stroke="#644837" strokeWidth={4} />
        <Path d="M282 96v91c0 14-15 15-19 3" fill="none" stroke="#644837" strokeWidth={4} />
      </Layer>
    </Animated.View>
  )
}

function SunDragonMark() {
  const pulse = usePingPong(2000, 0, 1)
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) }]}>
      <Layer>
        <Path d="M100 83c-19-16-38 3-25 20 8 10 25 3 19-8-4-7-13-2-9 4" fill="none" stroke="#f1c75a" strokeWidth={5} />
        <Path d="m73 79-9-12 15 4M99 81l10-10-2 15" fill="#f1c75a" />
      </Layer>
    </Animated.View>
  )
}

type Props = { weather: Weather; uv: number; width: number }

export function BatHero({ weather, uv, width }: Props) {
  const scale = width / VB_W
  const height = VB_H * scale
  const flutterL = usePingPong(4000, 0, 0)
  const flutterR = usePingPong(4000, 2000, 0)

  // CSS rotated each wing about its own bounding-box centre (transform-box: fill-box).
  // Native views rotate about the view centre, so shift the pivot to the wing's centre.
  const wingStyle = (v: Animated.Value, pivotX: number) => ({
    transform: [
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -3 * scale] }) },
      { translateX: pivotX * scale },
      { translateY: 7 * scale },
      { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '3deg'] }) },
      { translateX: -pivotX * scale },
      { translateY: -7 * scale },
    ],
  })

  return (
    <View style={[{ width, height }, styles.noTouch]}>
      {/* ground shadow */}
      <Layer>
        <Ellipse cx={195} cy={319} rx={112} ry={18} fill="#4b633c" opacity={0.18} />
      </Layer>

      {/* wings (own layers so they can flutter independently) */}
      <Animated.View style={[StyleSheet.absoluteFill, wingStyle(flutterL, -105)]}>
        <Layer>
          <Path d={WING_L} fill="url(#wingMembrane)" stroke="#372d37" strokeWidth={5} />
          <Path d={WING_L_VEINS} fill="none" stroke="#a5838d" strokeWidth={3} opacity={0.65} />
        </Layer>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, wingStyle(flutterR, 105)]}>
        <Layer>
          <Path d={WING_R} fill="url(#wingMembrane)" stroke="#372d37" strokeWidth={5} />
          <Path d={WING_R_VEINS} fill="none" stroke="#a5838d" strokeWidth={3} opacity={0.65} />
        </Layer>
      </Animated.View>

      {/* body */}
      <Layer>
        <Path d={CLOAK} fill="url(#cloak)" stroke="#812c43" strokeWidth={5} />
        <Path d="M160 183c12 17 58 17 70 0l-8 106c-17 10-37 10-54 0Z" fill="#f1d6a2" />
        <Path d="M159 211c25 12 47 12 72 0M155 245c27 13 53 13 80 0" fill="none" stroke="#c1915d" strokeWidth={3} opacity={0.55} />
        <Path d="M158 71 131 23c38 5 56 24 64 49M232 71l27-48c-38 5-56 24-64 49" fill="#49333d" stroke="#30262e" strokeWidth={6} strokeLinejoin="round" />
        <Path d="m150 61-10-25 32 25M240 61l10-25-32 25" fill="#d49a9d" />
        <Path d="M118 120c3-60 34-93 77-93s74 33 77 93c2 36-20 78-77 78s-79-42-77-78Z" fill="url(#cloak)" stroke="#852d44" strokeWidth={6} />
        <Path d="M138 123c0-48 26-75 57-75s57 27 57 75c0 43-22 68-57 68s-57-25-57-68Z" fill="url(#fur)" />
        <Path d="M156 85c10-17 25-25 39-25s29 8 39 25" fill="none" stroke="#a98a7c" strokeWidth={5} strokeLinecap="round" opacity={0.55} />
        <Ellipse cx={168} cy={119} rx={17} ry={20} fill="#fff8df" />
        <Ellipse cx={222} cy={119} rx={17} ry={20} fill="#fff8df" />
        <Ellipse cx={173} cy={122} rx={8} ry={10} fill="#354b41" />
        <Ellipse cx={217} cy={122} rx={8} ry={10} fill="#354b41" />
        <Circle cx={176} cy={118} r={3} fill="white" />
        <Circle cx={220} cy={118} r={3} fill="white" />
        <Path d="m195 136-11 7 11 8 11-8Z" fill="#e5a0a1" stroke="#6f4d54" strokeWidth={2} />
        <Path d="M174 158c12 12 30 12 42 0" fill="none" stroke="#30272a" strokeWidth={4} strokeLinecap="round" />
        <Path d="M183 160v10l8-7M207 160v10l-8-7" fill="#fff9e8" stroke="#30272a" strokeWidth={2} />
        <Circle cx={156} cy={149} r={9} fill="#df8e93" opacity={0.34} />
        <Circle cx={234} cy={149} r={9} fill="#df8e93" opacity={0.34} />
        <Path d="M143 179c-4 38-1 78 8 119M247 179c4 38 1 78-8 119" fill="none" stroke="#f18a83" strokeWidth={3} opacity={0.5} />
        <Path d="M149 196c16 9 32 14 46 15 14-1 30-6 46-15" fill="none" stroke="#f2b36e" strokeWidth={4} />
        <Circle cx={195} cy={211} r={15} fill="#e9c25f" stroke="#fff0af" strokeWidth={4} />
        <Path d="m195 202 3 6 7 1-5 5 2 7-7-4-7 4 2-7-5-5 7-1Z" fill="#805b2c" />
        <Path d="M146 298c12 6 23 6 34-1M210 297c11 7 22 7 34 1" fill="none" stroke="#45343a" strokeWidth={8} strokeLinecap="round" />
        <Circle cx={279} cy={119} r={16} fill="url(#glowGrad)" />
        <Circle cx={279} cy={119} r={3} fill="#fff8cb" />
      </Layer>

      {weather === 'winter-storm' && <Umbrella scale={scale} />}
      {uv >= 6 && <SunDragonMark />}
    </View>
  )
}

const styles = StyleSheet.create({
  noTouch: { pointerEvents: 'none' },
})
