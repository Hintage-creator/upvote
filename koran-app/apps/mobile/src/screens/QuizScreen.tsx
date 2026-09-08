import type { QuizQuestion } from "@koran-app/shared";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../api";
import { useNavigation } from "../navigation";
import { useSession } from "../session";
import { colors, radius, spacing } from "../theme";

type PublicQuestion = Omit<QuizQuestion, "correctAnswer">;

export function QuizScreen({ lessonId }: { lessonId: string }) {
  const { userId, applyStats } = useSession();
  const { goBack } = useNavigation();
  const [questions, setQuestions] = useState<PublicQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    api.getQuiz(lessonId).then(setQuestions);
  }, [lessonId]);

  if (!questions) return null;

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.summary}>Für diese Lektion gibt es noch keine Quizfragen.</Text>
        <Pressable style={styles.doneButton} onPress={goBack}>
          <Text style={styles.doneButtonText}>Zurück</Text>
        </Pressable>
      </View>
    );
  }

  if (index >= questions.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.summaryTitle}>Quiz beendet!</Text>
        <Text style={styles.summary}>
          {correctCount} von {questions.length} richtig
        </Text>
        <Pressable style={styles.doneButton} onPress={goBack}>
          <Text style={styles.doneButtonText}>Zurück zur Lektion</Text>
        </Pressable>
      </View>
    );
  }

  const question = questions[index];

  async function selectAnswer(answer: string) {
    setSelected(answer);
    const res = await api.answerQuiz(question.id, userId, answer);
    setFeedback({ correct: res.correct, correctAnswer: res.correctAnswer });
    if (res.correct) setCorrectCount((c) => c + 1);
    applyStats(res.stats);
  }

  function next() {
    setSelected(null);
    setFeedback(null);
    setIndex((i) => i + 1);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Frage {index + 1} / {questions.length}
      </Text>
      <Text style={styles.prompt}>{question.prompt}</Text>

      {question.options.map((option) => {
        const isSelected = selected === option;
        const isCorrectOption = feedback && option === feedback.correctAnswer;
        return (
          <Pressable
            key={option}
            disabled={!!selected}
            onPress={() => selectAnswer(option)}
            style={[
              styles.option,
              isSelected && !feedback?.correct && styles.optionWrong,
              (isSelected && feedback?.correct) || isCorrectOption ? styles.optionCorrect : null,
            ]}
          >
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        );
      })}

      {feedback && (
        <Pressable style={styles.nextButton} onPress={next}>
          <Text style={styles.nextButtonText}>Weiter →</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  progress: { color: colors.textMuted, marginBottom: spacing.sm },
  prompt: { color: colors.text, fontSize: 18, fontWeight: "600", marginBottom: spacing.lg },
  option: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionCorrect: { backgroundColor: colors.primaryDark },
  optionWrong: { backgroundColor: colors.danger },
  optionText: { color: colors.text, textAlign: "right", fontSize: 16 },
  nextButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  nextButtonText: { color: "#1c1917", fontWeight: "700" },
  summaryTitle: { color: colors.text, fontSize: 24, fontWeight: "800", marginTop: spacing.xl },
  summary: { color: colors.textMuted, fontSize: 16, marginTop: spacing.sm },
  doneButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  doneButtonText: { color: "#052e16", fontWeight: "700" },
});
