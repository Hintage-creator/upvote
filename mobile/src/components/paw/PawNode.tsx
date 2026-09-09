import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { usePulse } from '../animations/usePulse';
import { useWiggle } from '../animations/useWiggle';

const SIZE = 64;
/** Toe pads fill left-to-right, the main pad last — a lesson only looks "fully sooty" once truly done. */
const SEGMENT_COUNT = 5;

interface Props {
  /** 0 = untouched, 1 = every item in the lesson has been reviewed at least once. */
  progress: number;
  locked: boolean;
  /** True once the lesson's quiz has been passed — always renders as a fully sooty paw with a checkmark. */
  completed: boolean;
  /** The first unlocked, not-yet-completed lesson gets a gentle "play me" pulse. */
  isCurrent?: boolean;
  label: string | number;
}

export function PawNode({ progress, locked, completed, isCurrent = false, label }: Props) {
  const pulseStyle = usePulse(1.07, 1100);
  const wiggleStyle = useWiggle(locked);
  const filledSegments = completed ? SEGMENT_COUNT : Math.round(Math.max(0, Math.min(1, progress)) * SEGMENT_COUNT);

  const outerStyle = isCurrent ? pulseStyle : locked ? wiggleStyle : undefined;

  return (
    <Animated.View style={[styles.wrap, outerStyle]}>
      {isCurrent ? <View style={styles.currentRing} /> : null}
      <Toe filled={!locked && filledSegments > 0} style={styles.toe1} />
      <Toe filled={!locked && filledSegments > 1} style={styles.toe2} />
      <Toe filled={!locked && filledSegments > 2} style={styles.toe3} />
      <Toe filled={!locked && filledSegments > 3} style={styles.toe4} />
      <View style={[styles.pad, !locked && filledSegments > 4 && styles.padFilled]}>
        <Text style={[styles.label, !locked && filledSegments > 4 && styles.labelOnDark]}>
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
