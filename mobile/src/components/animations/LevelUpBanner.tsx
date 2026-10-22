import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { Celebration } from './Celebration';

interface Props {
  level: number;
  /** Bumped by the parent each time a new level-up should play. */
  triggerKey: number;
}

/** Full-width banner that drops in from the top, celebrates, then slides back out. Non-interactive. */
export function LevelUpBanner({ level, triggerKey }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (triggerKey === 0) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 }),
      Animated.delay(1800),
      Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  if (triggerKey === 0) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.banner,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) },
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
          ],
        },
      ]}
    >
      <View style={styles.celebrationAnchor}>
        <Celebration />
      </View>
      <Text style={styles.title}>Level {level} erreicht! 🎉</Text>
      <Text style={styles.subtitle}>Kungbäkola wird stärker.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 20,
  },
  celebrationAnchor: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center' },
  title: { color: '#fff', fontWeight: '800', fontSize: 16 },
  subtitle: { color: '#fff', fontSize: 12, marginTop: 2, opacity: 0.9 },
});
