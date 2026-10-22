import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  text: string;
  /** Bumped by the parent (e.g. Date.now()) each time a new pop should play. */
  triggerKey: number;
}

/**
 * A short label that pops up, floats upward and fades out — one-shot,
 * replays whenever `triggerKey` changes. Used for "+5 XP" feedback.
 */
export function FloatingText({ text, triggerKey }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (triggerKey === 0) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 1100, useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  if (triggerKey === 0) return null;

  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        styles.text,
        {
          opacity: anim.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -36] }) },
            { scale: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.6, 1.15, 1] }) },
          ],
        },
      ]}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: colors.success,
  },
});
