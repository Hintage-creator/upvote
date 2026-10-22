import React, { useEffect, useRef, useState } from 'react';
import { Animated, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { SOOT_STAGE_COUNT } from './dungeon';
import { usePulse } from '../../components/animations/usePulse';

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
  /** Idle breathing animation — on by default, off for e.g. tiny list thumbnails. */
  animated?: boolean;
}

/** Kungbäkola's portrait at a given soot stage (0 = clean, 4 = pitch black). Crossfades between stages and gently "breathes" when idle. */
export function CatAvatar({ sootStage, size = 96, style, animated = true }: Props) {
  const clamped = Math.max(0, Math.min(SOOT_STAGE_COUNT - 1, Math.round(sootStage)));
  const [displayedStage, setDisplayedStage] = useState(clamped);
  const [previousStage, setPreviousStage] = useState<number | null>(null);
  const crossfade = useRef(new Animated.Value(1)).current;
  const pulseStyle = usePulse(1.04, 1600);

  useEffect(() => {
    if (clamped === displayedStage) return;
    setPreviousStage(displayedStage);
    setDisplayedStage(clamped);
    crossfade.setValue(0);
    Animated.timing(crossfade, { toValue: 1, duration: 650, useNativeDriver: true }).start(() => {
      setPreviousStage(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped]);

  const imageStyle = { width: size, height: size, borderRadius: size * 0.22 };

  return (
    <Animated.View style={animated ? pulseStyle : undefined}>
      <View style={[styles.frame, { width: size, height: size, borderRadius: size * 0.22 }]}>
        {previousStage !== null ? (
          <Animated.Image source={SOOT_STAGE_IMAGES[previousStage]} style={[imageStyle, style, styles.layer]} resizeMode="cover" />
        ) : null}
        <Animated.Image
          source={SOOT_STAGE_IMAGES[displayedStage]}
          style={[imageStyle, style, styles.layer, { opacity: previousStage !== null ? crossfade : 1 }]}
          resizeMode="cover"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  layer: { position: 'absolute', top: 0, left: 0 },
});
