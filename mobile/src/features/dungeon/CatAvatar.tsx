import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { SOOT_STAGE_COUNT } from './dungeon';

/**
 * Metro requires static string literals, so the soot-stage artwork (derived
 * from the user-supplied concept art, darkened programmatically — see
 * mobile/README.md) is mapped explicitly rather than built from a template
 * string.
 */
const SOOT_STAGE_IMAGES = [
  require('../../../assets/mascot/soot-0.png'),
  require('../../../assets/mascot/soot-1.png'),
  require('../../../assets/mascot/soot-2.png'),
  require('../../../assets/mascot/soot-3.png'),
  require('../../../assets/mascot/soot-4.png'),
] as const;

interface Props {
  sootStage: number;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/** Kungbäkola's portrait at a given soot stage (0 = clean, 4 = pitch black). */
export function CatAvatar({ sootStage, size = 96, style }: Props) {
  const clamped = Math.max(0, Math.min(SOOT_STAGE_COUNT - 1, Math.round(sootStage)));
  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: size * 0.22 }]}>
      <Image
        source={SOOT_STAGE_IMAGES[clamped]}
        style={[{ width: size, height: size, borderRadius: size * 0.22 }, style]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
});
