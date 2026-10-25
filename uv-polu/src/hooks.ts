import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Animated, Easing, Platform, useWindowDimensions } from 'react-native'

/** The native animation module doesn't exist on web, so only ask for it elsewhere. */
export const USE_NATIVE_DRIVER = Platform.OS !== 'web'

/** Mirrors the prototype's `prefers-reduced-motion` rule. Provided once in App. */
export const MotionContext = createContext(false)

export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    let mounted = true
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduce(v)
    })
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce)
    return () => {
      mounted = false
      sub.remove()
    }
  }, [])
  return reduce
}

/**
 * 0 → 1 → 0 loop (CSS `alternate` / keyframes with a 50% peak).
 * `delay` is a positive start delay in ms. When motion is reduced the value
 * rests at `rest`. Always starts from 0 so Animated.loop resets cleanly.
 */
export function usePingPong(duration: number, delay = 0, rest = 0.5): Animated.Value {
  const reduce = useContext(MotionContext)
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (reduce) {
      v.setValue(rest)
      return
    }
    v.setValue(0)
    const leg = (toValue: number) =>
      Animated.timing(v, {
        toValue,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(Animated.sequence([leg(1), leg(0)])),
    ])
    anim.start()
    return () => anim.stop()
  }, [reduce, duration, delay, rest, v])
  return v
}

/**
 * Linear 0 → 1 repeating ramp (rain / snow). `phase` (0–1) starts the loop part
 * way through, standing in for a negative CSS animation-delay.
 */
export function useSawtooth(duration: number, phase = 0) {
  const reduce = useContext(MotionContext)
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (reduce) {
      v.setValue(0)
      return
    }
    v.setValue(0)
    const anim = Animated.loop(
      Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: USE_NATIVE_DRIVER }),
    )
    anim.start()
    return () => anim.stop()
  }, [reduce, duration, v])
  return Animated.modulo(Animated.add(v, phase), 1)
}

/** Replaces the prototype's media queries and clamp(…vw…) values. */
export function useMetrics() {
  const { width, height } = useWindowDimensions()
  return {
    width,
    height,
    /** ≤ 520px: the prototype's mobile layout, which is what phones get. */
    compact: width <= 520,
    /** ≤ 370px: the prototype's small-phone tweaks. */
    tiny: width <= 370,
    /** clamp(20px, 7vw, 110px) */
    pad: Math.min(110, Math.max(20, width * 0.07)),
  }
}
