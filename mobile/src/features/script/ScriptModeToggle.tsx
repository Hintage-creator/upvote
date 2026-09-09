import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { ScriptDisplayMode, useScriptDisplayMode } from './ScriptDisplayModeContext';

const OPTIONS: { mode: ScriptDisplayMode; labelDe: string }[] = [
  { mode: 'latin', labelDe: 'Latein' },
  { mode: 'side-by-side', labelDe: 'Beide' },
  { mode: 'nko', labelDe: 'N’Ko' },
];

/** Segmented control switching how every ScriptText in the app renders. */
export function ScriptModeToggle() {
  const { mode, setMode } = useScriptDisplayMode();
  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = opt.mode === mode;
        return (
          <Pressable
            key={opt.mode}
            onPress={() => setMode(opt.mode)}
            style={[styles.segment, active && styles.segmentActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.labelDe}</Text>
          </Pressable>
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
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: colors.surface,
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
