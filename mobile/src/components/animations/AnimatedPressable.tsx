import React, { useRef } from 'react';
import { Animated, GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** How far it shrinks on press, 0.96 = 4% smaller. */
  pressScale?: number;
  children: React.ReactNode;
}

/**
 * Drop-in replacement for Pressable that springs down slightly on press and
 * back on release — used everywhere in the app so every tap gives instant
 * physical feedback instead of a flat, static button.
 */
export function AnimatedPressable({ style, pressScale = 0.96, onPressIn, onPressOut, children, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn(e: GestureResponderEvent) {
    Animated.spring(scale, { toValue: pressScale, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
    onPressIn?.(e);
  }

  function handlePressOut(e: GestureResponderEvent) {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 8 }).start();
    onPressOut?.(e);
  }

  return (
    <AnimatedPressableBase
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressableBase>
  );
}
