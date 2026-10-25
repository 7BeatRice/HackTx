import { createContext, useContext } from 'react'
import type { Weather } from './data'

/** Replaces the prototype's per-weather CSS variables (--ink, --gold, --paper). */
export type Theme = {
  ink: string
  gold: string
  paper: string
  /** Active tab colour. Dark themes need a light value so the label stays readable. */
  navActive: string
  dark: boolean
}

export const themes: Record<Weather, Theme> = {
  sunny: { ink: '#233926', gold: '#b3832d', paper: '#f3e6b8', navActive: '#31503a', dark: false },
  'bright-clouds': { ink: '#29334a', gold: '#c49b48', paper: '#dcd9e8', navActive: '#31503a', dark: false },
  'winter-storm': { ink: '#ecedf4', gold: '#b8a16d', paper: '#171b29', navActive: '#f0d88c', dark: true },
  'dark-clouds': { ink: '#e5dcc5', gold: '#9d814c', paper: '#202b2c', navActive: '#f0d88c', dark: true },
}

export const ThemeContext = createContext<Theme>(themes.sunny)
export const useTheme = () => useContext(ThemeContext)

type Sky = { colors: [string, string, string]; locations: [number, number, number] }

/** Home-screen sky gradients (`.world` backgrounds). */
export const worldSky: Record<Weather, Sky> = {
  sunny: { colors: ['#dff0e7', '#eef4d9', '#d3dda8'], locations: [0, 0.63, 1] },
  'bright-clouds': { colors: ['#a6b8dd', '#e2cce1', '#abbc91'], locations: [0, 0.52, 1] },
  'winter-storm': { colors: ['#171b2b', '#374052', '#252d34'], locations: [0, 0.58, 1] },
  'dark-clouds': { colors: ['#263335', '#495657', '#313c37'], locations: [0, 0.58, 1] },
}

/** Story illustration gradients (`.story-art` backgrounds), as [offset, colour] stops. */
export const storySky: Record<Weather, [number, string][]> = {
  sunny: [[0, '#d69e58'], [0.6, '#eee09a'], [1, '#354b31']],
  'bright-clouds': [[0, '#858dac'], [0.58, '#e6c6b5'], [1, '#526554']],
  'winter-storm': [[0, '#171929'], [0.58, '#50566b'], [1, '#222b2c']],
  'dark-clouds': [[0, '#202b34'], [0.58, '#535559'], [1, '#29372f']],
}

/**
 * Font families. React Native picks the weight from the family name, so never
 * combine these with `fontWeight`. The prototype's body text (weight 400) fell
 * back to the nearest loaded weight, 500, so that's what `body` maps to.
 */
export const font = {
  cinzelMedium: 'Cinzel_500Medium',
  cinzel: 'Cinzel_600SemiBold',
  cinzelBold: 'Cinzel_700Bold',
  body: 'CormorantGaramond_500Medium',
  bodySemi: 'CormorantGaramond_600SemiBold',
  bodyBold: 'CormorantGaramond_700Bold',
  bodyItalic: 'CormorantGaramond_600SemiBold_Italic',
} as const

type RGB = [number, number, number]

function parse(hex: string): RGB {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as RGB
}

/** `color-mix(in srgb, <hex>, transparent X%)` → rgba with the remaining opacity. */
export function alpha(hex: string, a: number): string {
  const [r, g, b] = parse(hex)
  return `rgba(${r},${g},${b},${a})`
}

/** `color-mix(in srgb, <a>, <b> pctB%)` */
export function mix(a: string, b: string, pctB: number): string {
  const A = parse(a)
  const B = parse(b)
  const t = pctB / 100
  const [r, g, bl] = A.map((v, i) => Math.round(v * (1 - t) + B[i] * t))
  return `rgb(${r},${g},${bl})`
}
