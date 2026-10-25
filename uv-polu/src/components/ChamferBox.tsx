import { useId, useState, type ReactNode } from 'react'
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native'
import Svg, { Defs, LinearGradient, Polygon, Stop } from 'react-native-svg'

/** CSS-style angle (0deg = to top, 90deg = to right) and [offset, colour] stops. */
export type GradientFill = { angle: number; stops: [number, string][] }

/** One number for all corners, or [topLeft, topRight, bottomRight, bottomLeft]. */
type Cut = number | [number, number, number, number]

type Props = {
  cut: Cut
  fill: string | GradientFill
  stroke?: string
  strokeWidth?: number
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}

/**
 * React Native has no `clip-path`. This draws the cut-corner panel as an SVG
 * polygon behind the children, sized from onLayout. The stroke follows the
 * diagonal cuts (the web version's border was clipped off at the corners).
 */
export function ChamferBox({ cut, fill, stroke, strokeWidth = 0, style, children }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  const gradientId = useId().replace(/[^a-zA-Z0-9]/g, '')

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    setSize((s) => (s.w === width && s.h === height ? s : { w: width, h: height }))
  }

  const [tl, tr, br, bl]: [number, number, number, number] =
    typeof cut === 'number' ? [cut, cut, cut, cut] : cut
  const { w, h } = size
  const i = stroke ? strokeWidth / 2 : 0 // keep the stroke inside the box
  const points = [
    [i + tl, i],
    [w - i - tr, i],
    [w - i, i + tr],
    [w - i, h - i - br],
    [w - i - br, h - i],
    [i + bl, h - i],
    [i, h - i - bl],
    [i, i + tl],
  ]
    .map((p) => p.join(','))
    .join(' ')

  let gradient: ReactNode = null
  if (typeof fill !== 'string' && w > 0) {
    // Same maths as CSS linear-gradient(<angle>, …) for a w × h box.
    const rad = (fill.angle * Math.PI) / 180
    const sin = Math.sin(rad)
    const cos = Math.cos(rad)
    const len = Math.abs(w * sin) + Math.abs(h * cos)
    gradient = (
      <Defs>
        <LinearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={w / 2 - (sin * len) / 2}
          y1={h / 2 + (cos * len) / 2}
          x2={w / 2 + (sin * len) / 2}
          y2={h / 2 - (cos * len) / 2}
        >
          {fill.stops.map(([offset, color]) => (
            <Stop key={`${offset}-${color}`} offset={offset} stopColor={color} />
          ))}
        </LinearGradient>
      </Defs>
    )
  }

  return (
    <View style={style} onLayout={onLayout}>
      {w > 0 && (
        <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          {gradient}
          <Polygon
            points={points}
            fill={typeof fill === 'string' ? fill : `url(#${gradientId})`}
            stroke={stroke}
            strokeWidth={stroke ? strokeWidth : 0}
          />
        </Svg>
      )}
      {children}
    </View>
  )
}
