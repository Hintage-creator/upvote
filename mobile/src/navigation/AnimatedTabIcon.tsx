import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

/** Bounces the tab emoji when it becomes the focused tab. */
export function AnimatedTabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!focused) return;
    scale.setValue(0.7);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 16 }).start();
  }, [focused, scale]);

  return (
    <Animated.Text style={{ fontSize: 18, transform: [{ scale }] }}>{emoji}</Animated.Text>
  );
}
