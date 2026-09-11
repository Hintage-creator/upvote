import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

/**
 * App-wide reminder that the shipped content is an unreviewed placeholder
 * pack (see src/data/languages/mnk/README.md). Dismissible per app
 * session only — it reappears on next launch so it can't be forgotten
 * before real content ships.
 */
export function ContentDisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        ⚠ Alle Inhalte sind Platzhalter und noch nicht von einer muttersprachlichen Person geprüft.
      </Text>
      <Pressable onPress={() => setDismissed(true)} hitSlop={8}>
        <Text style={styles.dismiss}>Ausblenden</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warningBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.warningBorder,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  text: { flex: 1, fontSize: 12, color: colors.warningText, fontWeight: '600' },
  dismiss: { fontSize: 12, color: colors.warningText, fontWeight: '700', textDecorationLine: 'underline' },
});
