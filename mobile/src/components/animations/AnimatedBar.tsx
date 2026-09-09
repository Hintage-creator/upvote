import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  /** 0..1 */
  progress: number;
  height?: number;
  color?: string;
  trackColor?: string;
}

/** A track + fill bar that animates smoothly whenever `progress` changes. */
export function AnimatedBar({ progress, height = 8, color = colors.primary, trackColor = colors.border }: Props) {
  const anim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.max(0, Math.min(1, progress)),
      duration: 500,
      useNativeDriver: false, // width can't use the native driver
    }).start();
  }, [progress, anim]);

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: trackColor }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            borderRadius: height / 2,
            width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', width: '100%' },
  fill: { height: '100%' },
});
