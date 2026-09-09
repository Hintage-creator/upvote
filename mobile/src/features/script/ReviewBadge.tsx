import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { ContentStatus } from '../../types/content';

/**
 * Visible marker for placeholder/unverified content (ContentStatus.needsReview).
 * Never hide this silently — the whole point is that learners and
 * reviewers can tell at a glance which items still need a native-speaker
 * check.
 */
export function ReviewBadge({ status }: { status: ContentStatus }) {
  if (!status.needsReview) return null;
  return (
    <View style={styles.badge} accessibilityRole="text">
      <Text style={styles.text}>⚠ ungeprüft</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    color: colors.warningText,
    fontSize: 11,
    fontWeight: '700',
  },
});
