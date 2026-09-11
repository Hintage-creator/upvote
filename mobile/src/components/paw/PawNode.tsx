import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { usePulse } from '../animations/usePulse';
import { useWiggle } from '../animations/useWiggle';

const SIZE = 64;
const TOE_STYLES = ['toe1', 'toe2', 'toe3', 'toe4'] as const;

interface Props {
  /** How many pads/toes this paw has in total (one per room it covers) — 5 max: 4 toes + the main pad. */
  totalSegments: number;
  /** How many of those rooms are already completed — fills that many segments, toes first, main pad last. */
  filledSegments: number;
  locked: boolean;
  /** True once every room in this paw is done — always renders fully sooty with a checkmark. */
  completed: boolean;
  /** The paw containing the next playable, not-yet-completed room gets a gentle "play me" pulse. */
  isCurrent?: boolean;
  label: string | number;
}

export function PawNode({ totalSegments, filledSegments, locked, completed, isCurrent = false, label }: Props) {
  const pulseStyle = usePulse(1.07, 1100);
  const wiggleStyle = useWiggle(locked);
  const toeCount = Math.max(0, Math.min(TOE_STYLES.length, totalSegments - 1));
  const filled = completed ? totalSegments : Math.max(0, Math.min(totalSegments, filledSegments));

  const outerStyle = isCurrent ? pulseStyle : locked ? wiggleStyle : undefined;

  return (
    <Animated.View style={[styles.wrap, outerStyle]}>
      {isCurrent ? <View style={styles.currentRing} /> : null}
      {TOE_STYLES.slice(0, toeCount).map((styleKey, i) => (
        <Toe key={styleKey} filled={!locked && filled > i} style={styles[styleKey]} />
      ))}
      <View style={[styles.pad, !locked && filled > toeCount && styles.padFilled]}>
        <Text style={[styles.label, !locked && filled > toeCount && styles.labelOnDark]}>
          {locked ? '🔒' : completed ? '✓' : label}
        </Text>
      </View>
    </Animated.View>
  );
}

function Toe({ filled, style }: { filled: boolean; style: object }) {
  return <View style={[styles.toeBase, style, filled && styles.toeFilled]} />;
}

const SOOT = '#211A15';
const CLEAN = '#F3E6C8';
const CLEAN_BORDER = '#D8C39C';

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  currentRing: {
    position: 'absolute',
    width: SIZE + 14,
    height: SIZE + 14,
    borderRadius: (SIZE + 14) / 2,
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: 0.45,
  },
  toeBase: {
    position: 'absolute',
    width: SIZE * 0.28,
    height: SIZE * 0.28,
    borderRadius: SIZE * 0.14,
    backgroundColor: CLEAN,
    borderWidth: 1.5,
    borderColor: CLEAN_BORDER,
  },
  toeFilled: { backgroundColor: SOOT, borderColor: SOOT },
  toe1: { left: SIZE * 0.06, top: SIZE * 0.28 },
  toe2: { left: SIZE * 0.28, top: SIZE * 0.1 },
  toe3: { left: SIZE * 0.52, top: SIZE * 0.1 },
  toe4: { left: SIZE * 0.7, top: SIZE * 0.28 },
  pad: {
    position: 'absolute',
    bottom: SIZE * 0.02,
    width: SIZE * 0.5,
    height: SIZE * 0.36,
    borderRadius: SIZE * 0.18,
    backgroundColor: CLEAN,
    borderWidth: 1.5,
    borderColor: CLEAN_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padFilled: { backgroundColor: SOOT, borderColor: SOOT },
  label: { fontSize: 13, fontWeight: '800', color: colors.primaryDark },
  labelOnDark: { color: '#F3E6C8' },
});
