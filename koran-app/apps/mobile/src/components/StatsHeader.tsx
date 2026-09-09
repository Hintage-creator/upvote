import { xpForLevel } from "@koran-app/shared";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSession } from "../session";
import { colors, radius, spacing } from "../theme";

export function StatsHeader() {
  const { stats } = useSession();
  const currentLevelFloor = xpForLevel(stats.level - 1);
  const nextLevelCeiling = xpForLevel(stats.level);
  const progress =
    (stats.xp - currentLevelFloor) / Math.max(1, nextLevelCeiling - currentLevelFloor);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.level}>Level {stats.level}</Text>
        <Text style={styles.streak}>🔥 {stats.currentStreakDays} Tage</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(100, Math.max(0, progress * 100))}%` }]} />
      </View>
      <Text style={styles.xpLabel}>
        {stats.xp} / {nextLevelCeiling} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  level: { color: colors.text, fontWeight: "700", fontSize: 16 },
  streak: { color: colors.accent, fontWeight: "600" },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: colors.primary },
  xpLabel: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
});
