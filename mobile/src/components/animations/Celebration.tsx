import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const PARTICLES = ['✨', '⭐', '✨', '🌟', '✨', '⭐'];

/** One-shot burst of little particles floating up and fading — plays once on mount. */
export function Celebration() {
  const anims = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = anims.map((v, i) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 900 + i * 60,
        delay: i * 45,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    Animated.stagger(40, animations).start();
  }, [anims]);

  return (
    <View style={styles.container} pointerEvents="none">
      {PARTICLES.map((emoji, i) => {
        const spread = (i - (PARTICLES.length - 1) / 2) * 34;
        const anim = anims[i];
        return (
          <Animated.Text
            key={i}
            style={[
              styles.particle,
              {
                opacity: anim.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
                transform: [
                  { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) },
                  { translateX: spread },
                  { scale: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1.1, 0.8] }) },
                ],
              },
            ]}
          >
            {emoji}
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: { position: 'absolute', fontSize: 22 },
});
