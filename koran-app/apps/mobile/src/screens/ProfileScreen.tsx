import { BADGES } from "@koran-app/shared";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatsHeader } from "../components/StatsHeader";
import { useNavigation } from "../navigation";
import { useSession } from "../session";
import { colors, radius, spacing } from "../theme";

export function ProfileScreen() {
  const { stats } = useSession();
  const { goBack } = useNavigation();

  return (
    <View style={styles.container}>
      <Pressable onPress={goBack} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Zurück</Text>
      </Pressable>

      <StatsHeader />

      <View style={styles.streaksRow}>
        <View style={styles.streakBox}>
          <Text style={styles.streakValue}>{stats.currentStreakDays}</Text>
          <Text style={styles.streakLabel}>Aktuelle Streak</Text>
        </View>
        <View style={styles.streakBox}>
          <Text style={styles.streakValue}>{stats.longestStreakDays}</Text>
          <Text style={styles.streakLabel}>Beste Streak</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Abzeichen</Text>
      <View style={styles.badgeGrid}>
        {BADGES.map((badge) => {
          const earned = stats.earnedBadgeIds.includes(badge.id);
          return (
            <View key={badge.id} style={[styles.badge, !earned && styles.badgeLocked]}>
              <Text style={styles.badgeIcon}>{earned ? "🏅" : "🔒"}</Text>
              <View>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  backLink: { marginBottom: spacing.sm },
  backLinkText: { color: colors.accent },
  streaksRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  streakBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  streakValue: { color: colors.accent, fontSize: 28, fontWeight: "800" },
  streakLabel: { color: colors.textMuted, marginTop: spacing.xs },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: spacing.sm },
  badgeGrid: { gap: spacing.sm },
  badge: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  badgeLocked: { opacity: 0.5 },
  badgeIcon: { fontSize: 24 },
  badgeName: { color: colors.text, fontWeight: "700" },
  badgeDescription: { color: colors.textMuted, fontSize: 12 },
});
