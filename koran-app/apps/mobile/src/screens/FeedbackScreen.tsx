import type { Badge, PronunciationScore, Verse, VocabItem } from "@koran-app/shared";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "../navigation";
import { colors, radius, spacing } from "../theme";

function scoreColor(score: number): string {
  if (score >= 85) return colors.primary;
  if (score >= 60) return colors.accent;
  return colors.danger;
}

export function FeedbackScreen({
  lessonId,
  item,
  result,
  newlyEarnedBadges,
}: {
  lessonId: string;
  item: Verse | VocabItem;
  result: PronunciationScore;
  newlyEarnedBadges: Badge[];
}) {
  const { navigate, goBack } = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.scoreCircle}>
        <Text style={[styles.scoreValue, { color: scoreColor(result.score) }]}>
          {result.score}
        </Text>
        <Text style={styles.scoreMax}>/100</Text>
      </View>

      <Text style={styles.feedback}>{result.feedback}</Text>

      {result.engine === "mock-heuristic" && (
        <Text style={styles.disclaimer}>
          Hinweis: Dies ist eine einfache Platzhalter-Bewertung auf Basis der Aufnahmedauer, keine
          echte Aussprache-/Phonem-Analyse. Für eine echte Bewertung wird ein ASR-Dienst mit
          Arabisch-Unterstützung benötigt (siehe README).
        </Text>
      )}

      {newlyEarnedBadges.length > 0 && (
        <View style={styles.badgeBox}>
          <Text style={styles.badgeTitle}>Neues Abzeichen freigeschaltet!</Text>
          {newlyEarnedBadges.map((b) => (
            <Text key={b.id} style={styles.badgeName}>
              🏅 {b.name} — {b.description}
            </Text>
          ))}
        </View>
      )}

      <Pressable style={styles.retryButton} onPress={() => navigate({ screen: "record", lessonId, item })}>
        <Text style={styles.retryButtonText}>🔁 Nochmal versuchen</Text>
      </Pressable>

      <Pressable style={styles.doneButton} onPress={goBack}>
        <Text style={styles.doneButtonText}>Weiter zur Lektion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, alignItems: "center" },
  scoreCircle: {
    marginTop: spacing.xl,
    alignItems: "center",
    flexDirection: "row",
  },
  scoreValue: { fontSize: 64, fontWeight: "800" },
  scoreMax: { fontSize: 20, color: colors.textMuted, marginLeft: spacing.xs },
  feedback: { color: colors.text, fontSize: 16, textAlign: "center", marginTop: spacing.md },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.md,
  },
  badgeBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    width: "100%",
  },
  badgeTitle: { color: colors.accent, fontWeight: "700", marginBottom: spacing.xs },
  badgeName: { color: colors.text },
  retryButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  retryButtonText: { color: colors.text, fontWeight: "600" },
  doneButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  doneButtonText: { color: "#052e16", fontWeight: "700" },
});
