import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { api, type ResolvedLesson } from "../api";
import { ItemCard } from "../components/ItemCard";
import { useNavigation } from "../navigation";
import { useSession } from "../session";
import { colors, radius, spacing } from "../theme";

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const { userId, refreshStats } = useSession();
  const { navigate, goBack } = useNavigation();
  const [lesson, setLesson] = useState<ResolvedLesson | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    api.getLesson(lessonId).then(setLesson);
  }, [lessonId]);

  if (!lesson) return null;

  const hasVerses = lesson.resolvedItems.length > 0;

  return (
    <View style={styles.container}>
      <Pressable onPress={goBack} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Zurück</Text>
      </Pressable>

      <FlatList
        data={lesson.resolvedItems}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>{lesson.title}</Text>
            <Text style={styles.description}>{lesson.description}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View>
            <ItemCard item={item} />
            <Pressable
              style={styles.practiceButton}
              onPress={() => navigate({ screen: "record", lessonId, item })}
            >
              <Text style={styles.practiceButtonText}>🎙 Aussprache üben</Text>
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable
              style={styles.quizButton}
              onPress={() => navigate({ screen: "quiz", lessonId })}
            >
              <Text style={styles.quizButtonText}>📝 Quiz starten</Text>
            </Pressable>
            <Pressable
              disabled={completing || !hasVerses}
              style={styles.completeButton}
              onPress={async () => {
                setCompleting(true);
                await api.completeLesson(lessonId, userId);
                await refreshStats();
                setCompleting(false);
                goBack();
              }}
            >
              <Text style={styles.completeButtonText}>
                {completing ? "..." : "✓ Lektion abschließen"}
              </Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  backLink: { marginBottom: spacing.sm },
  backLinkText: { color: colors.accent },
  title: { color: colors.text, fontSize: 22, fontWeight: "700" },
  description: { color: colors.textMuted, marginBottom: spacing.md },
  practiceButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: "center",
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  practiceButtonText: { color: colors.text, fontWeight: "600" },
  footer: { marginTop: spacing.md, gap: spacing.sm },
  quizButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  quizButtonText: { color: "#1c1917", fontWeight: "700" },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  completeButtonText: { color: "#052e16", fontWeight: "700" },
});
