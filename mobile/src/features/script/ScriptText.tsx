import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScriptText as ScriptTextData } from '../../types/content';
import { colors } from '../../theme/colors';
import { useScriptDisplayMode } from './ScriptDisplayModeContext';

/** Font family registered via useFonts({ NotoSansNKo_400Regular }) in App.tsx. */
export const NKO_FONT_FAMILY = 'NotoSansNKo_400Regular';

interface Props {
  script: ScriptTextData;
  /** Visual size preset; keeps N'Ko (which needs more line height) legible. */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Renders one piece of dual-script content. Reads the app-wide display mode
 * (latin / nko / side-by-side) from context so a single toggle anywhere in
 * the app switches every ScriptText at once — see ScriptDisplayModeContext.
 */
export function ScriptText({ script, size = 'medium' }: Props) {
  const { mode } = useScriptDisplayMode();
  const latinStyle = [styles.latin, sizeStyles[size].latin];
  const nkoStyle = [styles.nko, sizeStyles[size].nko];

  if (mode === 'latin') {
    return <Text style={latinStyle}>{script.latin}</Text>;
  }
  if (mode === 'nko') {
    return <Text style={[...nkoStyle, styles.nkoDirection]}>{script.nko}</Text>;
  }
  return (
    <View style={styles.sideBySide}>
      <Text style={latinStyle}>{script.latin}</Text>
      <Text style={[...nkoStyle, styles.nkoDirection]}>{script.nko}</Text>
    </View>
  );
}

const sizeStyles = {
  small: StyleSheet.create({ latin: { fontSize: 14 }, nko: { fontSize: 18 } }),
  medium: StyleSheet.create({ latin: { fontSize: 18 }, nko: { fontSize: 24 } }),
  large: StyleSheet.create({ latin: { fontSize: 24 }, nko: { fontSize: 32 } }),
};

const styles = StyleSheet.create({
  sideBySide: {
    gap: 2,
  },
  latin: {
    color: colors.text,
    fontWeight: '600',
  },
  nko: {
    color: colors.primaryDark,
    fontFamily: NKO_FONT_FAMILY,
    textAlign: 'right',
  },
  nkoDirection: {
    writingDirection: 'rtl',
  },
});
