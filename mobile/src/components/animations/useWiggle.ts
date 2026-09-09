import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/** Continuous small rotation wiggle — draws the eye to a locked/disabled element without being annoying. */
export function useWiggle(active = true, degrees = 8, intervalMs = 2600) {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const single = Animated.sequence([
      Animated.timing(rotate, { toValue: 1, duration: 90, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: -1, duration: 90, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: 1, duration: 90, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: 0, duration: 90, easing: Easing.linear, useNativeDriver: true }),
      Animated.delay(intervalMs),
    ]);
    const loop = Animated.loop(single);
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return {
    transform: [
      {
        rotate: rotate.interpolate({ inputRange: [-1, 0, 1], outputRange: [`-${degrees}deg`, '0deg', `${degrees}deg`] }),
      },
    ],
  };
}
