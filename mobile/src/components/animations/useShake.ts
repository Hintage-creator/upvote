import { useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Small horizontal shake, e.g. for a wrong quiz answer or tapping a locked
 * dungeon room. Returns the animated style to spread onto a view plus a
 * `shake()` trigger.
 */
export function useShake() {
  const offset = useRef(new Animated.Value(0)).current;

  function shake() {
    offset.setValue(0);
    Animated.sequence([
      Animated.timing(offset, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(offset, { toValue: -1, duration: 55, useNativeDriver: true }),
      Animated.timing(offset, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(offset, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  }

  const style = {
    transform: [
      {
        translateX: offset.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-8, 0, 8],
        }),
      },
    ],
  };

  return { style, shake };
}
