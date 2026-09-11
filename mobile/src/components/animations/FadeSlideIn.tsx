import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  /** Stagger delay in ms — pass `index * 60` in a list for a cascading entrance. */
  delay?: number;
  /** Vertical distance (px) the content slides in from. */
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

/** Fade + slide-up entrance, plays once on mount. Used to give lists and cards a bit of life without pulling in a new animation dependency. */
export function FadeSlideIn({ children, delay = 0, distance = 14, duration = 380, style }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
