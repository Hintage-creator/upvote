import type { ReviewCard, Verse, VocabItem } from "@koran-app/shared";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { api, type ResolvedLesson } from "../api";
import { StatsHeader } from "../components/StatsHeader";
import { useNavigation } from "../navigation";
import { useSession } from "../session";
import { colors, radius, spacing } from "../theme";

export function HomeScreen() {
  const { userId } = useSession();
  const { navigate } = useNavigation();
  const [lessons, setLessons] = useState<ResolvedLesson[] | null>(null);
  const [dueReviews, setDueReviews] = useState<Array<{ card: ReviewCard; item: Verse | VocabItem }>>([]);

  const load = useCallback(() => {
    api.listLessons().then(setLessons);
    api.getDueReviews(userId).then(setDueReviews);
  }, [userId]);

  useEffect(load, [load]);

  return (
    <View style={styles.container}>
      <StatsHeader />
      <Pressable style={styles.profileLink} onPress={() => navigate({ screen: "profile" })}>
        <Text style={styles.profileLinkText}>Profil & Abzeichen ansehen →</Text>
      </Pressable>

      <Pressable style={styles.alphabetCard} onPress={() => navigate({ screen: "alphabet" })}>
        <Text style={styles.alphabetCardTitle}>📖 Arabisches Alphabet</Text>
        <Text style={styles.alphabetCardSubtitle}>
          Buchstaben, Schreibformen und Vokalzeichen — die Grundlage, um Verse überhaupt lesen zu können.
        </Text>
      </Pressable>

      {dueReviews.length > 0 && (
        <View style={styles.reviewBanner}>
          <Text style={styles.reviewBannerText}>
            {dueReviews.length} Wiederholung{dueReviews.length === 1 ? "" : "en"} heute fällig
          </Text>
        </View>
      )}

      <FlatList
        data={lessons ?? []}
        keyExtractor={(l) => l.id}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Lektionen</Text>}
        renderItem={({ item: lesson }) => (
          <Pressable
            style={styles.lessonCard}
            onPress={() => navigate({ screen: "lesson", lessonId: lesson.id })}
          >
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDescription}>{lesson.description}</Text>
            <Text style={styles.lessonMeta}>
              Schwierigkeit {"★".repeat(lesson.difficulty)}
              {"☆".repeat(5 - lesson.difficulty)} · {lesson.resolvedItems.length} Inhalte
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  profileLink: { marginBottom: spacing.md },
  profileLinkText: { color: colors.accent, fontWeight: "600" },
  alphabetCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  alphabetCardTitle: { color: colors.text, fontWeight: "700", fontSize: 16 },
  alphabetCardSubtitle: { color: colors.textMuted, marginTop: spacing.xs, fontSize: 13 },
  reviewBanner: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewBannerText: { color: colors.text, fontWeight: "600" },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "700", marginBottom: spacing.sm },
  lessonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  lessonTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  lessonDescription: { color: colors.textMuted, marginTop: spacing.xs },
  lessonMeta: { color: colors.accent, marginTop: spacing.xs, fontSize: 12 },
});
