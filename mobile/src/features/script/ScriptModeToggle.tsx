import React, { useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { ScriptDisplayMode, useScriptDisplayMode } from './ScriptDisplayModeContext';
import { AnimatedPressable } from '../../components/animations/AnimatedPressable';

const OPTIONS: { mode: ScriptDisplayMode; labelDe: string }[] = [
  { mode: 'latin', labelDe: 'Latein' },
  { mode: 'side-by-side', labelDe: 'Beide' },
  { mode: 'nko', labelDe: 'N’Ko' },
];

type SegmentLayout = { x: number; width: number };

/** Segmented control switching how every ScriptText in the app renders, with a sliding indicator pill. */
export function ScriptModeToggle() {
  const { mode, setMode } = useScriptDisplayMode();
  const [layouts, setLayouts] = useState<Record<string, SegmentLayout>>({});
  const indicatorLeft = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const measuredModes = useRef(new Set<string>());

  function animateTo(target: SegmentLayout) {
    Animated.spring(indicatorLeft, { toValue: target.x, useNativeDriver: false, speed: 18, bounciness: 6 }).start();
    Animated.spring(indicatorWidth, { toValue: target.width, useNativeDriver: false, speed: 18, bounciness: 6 }).start();
  }

  function handleLayout(optMode: ScriptDisplayMode, e: LayoutChangeEvent) {
    const { x, width } = e.nativeEvent.layout;
    const layout = { x, width };
    setLayouts((prev) => ({ ...prev, [optMode]: layout }));
    const firstMeasurement = !measuredModes.current.has(optMode);
    measuredModes.current.add(optMode);
    if (optMode === mode && firstMeasurement) {
      indicatorLeft.setValue(x);
      indicatorWidth.setValue(width);
    }
  }

  function selectMode(optMode: ScriptDisplayMode) {
    setMode(optMode);
    const target = layouts[optMode];
    if (target) animateTo(target);
  }

  return (
    <View style={styles.row}>
      <Animated.View
        style={[styles.indicator, { left: indicatorLeft, width: indicatorWidth }]}
        pointerEvents="none"
      />
      {OPTIONS.map((opt) => {
        const active = opt.mode === mode;
        return (
          <AnimatedPressable
            key={opt.mode}
            onPress={() => selectMode(opt.mode)}
            onLayout={(e) => handleLayout(opt.mode, e)}
            style={styles.segment}
            pressScale={0.92}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.labelDe}</Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 10,
    padding: 3,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    backgroundColor: colors.surface,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.primaryDark,
  },
});
