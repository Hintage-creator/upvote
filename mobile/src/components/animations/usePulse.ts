import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/** Continuous, gentle breathing loop (scale 1 -> peak -> 1) for idle mascot liveliness. */
export function usePulse(peak = 1.05, duration = 1400) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: peak, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { transform: [{ scale }] };
}
