import type { ReactNode } from 'react'
import Svg, { Circle, G, Path } from 'react-native-svg'
import type { IconName } from '../data'

// Paths are the prototype's originals; `currentColor` became an explicit `color` prop.
const paths = (color: string): Record<IconName, ReactNode> => ({
  home: (
    <>
      <Path d="m3 10 9-7 9 7" />
      <Path d="M5 9v11h14V9M9 20v-7h6v7" />
    </>
  ),
  book: (
    <>
      <Path d="M4 4.5A3.5 3.5 0 0 1 7.5 8H12v13H7.5A3.5 3.5 0 0 0 4 17.5Z" />
      <Path d="M20 4.5A3.5 3.5 0 0 0 16.5 8H12v13h4.5a3.5 3.5 0 0 1 3.5-3.5Z" />
    </>
  ),
  sword: (
    <>
      <Path d="m14 5 5-2-2 5-7.5 7.5-3-3Z" />
      <Path d="m5 14 5 5M3 21l4-4" />
    </>
  ),
  trophy: (
    <>
      <Path d="M8 4h8v5a4 4 0 0 1-8 0Z" />
      <Path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6" />
    </>
  ),
  sun: (
    <>
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </>
  ),
  wind: <Path d="M3 8h11a3 3 0 1 0-3-3M3 12h16M3 16h11a3 3 0 1 1-3 3" />,
  droplet: <Path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z" />,
  leaf: (
    <>
      <Path d="M20 4C11 4 5 8 5 14c0 3 2 5 5 5 6 0 10-6 10-15Z" />
      <Path d="M4 21c3-6 7-9 12-12" />
    </>
  ),
  signal: (
    <>
      <Path d="M5 16.5a10 10 0 0 1 14 0M8 19.5a6 6 0 0 1 8 0" />
      <Circle cx="12" cy="22" r=".5" fill={color} />
    </>
  ),
  // Replace the ← → ↻ ✓ text glyphs, which depend on device font fallback.
  back: <Path d="M19 12H5M12 19l-7-7 7-7" />,
  arrow: <Path d="M5 12h14M12 5l7 7-7 7" />,
  refresh: <Path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />,
  check: <Path d="M20 6 9 17l-5-5" />,
})

export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {paths(color)[name]}
      </G>
    </Svg>
  )
}
