import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleProp, TextStyle } from 'react-native';

interface Props {
  value: number;
  style?: StyleProp<TextStyle>;
  duration?: number;
  /** Text before/after the number, e.g. suffix=" XP". */
  prefix?: string;
  suffix?: string;
}

/** Text that smoothly counts up/down to a new numeric value instead of snapping. */
export function AnimatedCounter({ value, style, duration = 600, prefix = '', suffix = '' }: Props) {
  const anim = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(Math.round(value));

  useEffect(() => {
    const listenerId = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(anim, { toValue: value, duration, useNativeDriver: false }).start();
    return () => anim.removeListener(listenerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Animated.Text style={style}>
      {prefix}
      {display}
      {suffix}
    </Animated.Text>
  );
}
