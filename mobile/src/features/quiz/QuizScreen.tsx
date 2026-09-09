import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../theme/colors';
import { getLanguagePack } from '../../data/languages';
import { lessonById, phrasesByIds, vocabByIds } from '../../data/contentLookup';
import { CourseStackParamList } from '../../navigation/types';
import { ScriptText } from '../script/ScriptText';
import { buildQuiz, checkTranslationAnswer } from './quizGenerator';
import { QuizQuestion } from '../../types/content';
import { progressRepository } from '../progress';
import { addXp, gradeReview, initReviewState, recordActivity } from '../progress/srs';
import { FadeSlideIn } from '../../components/animations/FadeSlideIn';
import { AnimatedBar } from '../../components/animations/AnimatedBar';
import { useShake } from '../../components/animations/useShake';
import { Celebration } from '../../components/animations/Celebration';

type Props = NativeStackScreenProps<CourseStackParamList, 'Quiz'>;

const pack = getLanguagePack('mnk');
const XP_PER_CORRECT_ANSWER = 5;
/** Minimum score to "solve the room's riddle" and unlock the next chamber. */
const PASS_RATIO = 0.6;

export function QuizScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const lesson = lessonById(pack, lessonId);

  const items = useMemo(() => {
    if (!lesson) return [];
    const vocabIds = lesson.sections.filter((s) => s.type === 'vocab' || s.type === 'alphabet').flatMap((s) => s.itemIds);
    const phraseIds = lesson.sections.filter((s) => s.type === 'phrases').flatMap((s) => s.itemIds);
    return [...vocabByIds(pack, vocabIds), ...phrasesByIds(pack, phraseIds)];
  }, [lesson]);

  const questions = useMemo(() => buildQuiz(items, pack.vocabItems, 'mnk', 'de'), [items]);

  const [index, setIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const resultPop = useRef(new Animated.Value(0.7)).current;

  if (!lesson || questions.length === 0) {
    return (
      <View style={styles.screen}>
        <Text>Für diese Lektion gibt es noch kein Quiz-Material.</Text>
      </View>
    );
  }

  const question: QuizQuestion = questions[index];

  async function recordResult(isCorrect: boolean) {
    if (isCorrect) setCorrectCount((c) => c + 1);

    const existing = await progressRepository.getReviewState(question.promptItemId);
    const state = existing ?? initReviewState(question.promptItemId);
    const grade = isCorrect ? 4 : 1;
    await progressRepository.saveReviewState(gradeReview(state, grade));

    if (isCorrect) {
      const progress = await progressRepository.getUserProgress();
      await progressRepository.saveUserProgress(addXp(progress, XP_PER_CORRECT_ANSWER));
    }
  }

  async function handleMultipleChoiceSelect(choiceIndex: number) {
    if (revealed || question.type !== 'multiple-choice') return;
    setSelectedChoice(choiceIndex);
    setRevealed(true);
    await recordResult(choiceIndex === question.correctChoiceIndex);
  }

  async function handleTranslationSubmit() {
    if (revealed || question.type !== 'translation') return;
    const isCorrect = checkTranslationAnswer(question, textAnswer);
    setRevealed(true);
    await recordResult(isCorrect);
  }

  async function goNext() {
    if (index + 1 >= questions.length) {
      const progress = await progressRepository.getUserProgress();
      await progressRepository.saveUserProgress(recordActivity(progress));
      const passed = correctCount / questions.length >= PASS_RATIO;
      if (passed) {
        await progressRepository.markLessonCompleted(lessonId);
      }
      setFinished(true);
      resultPop.setValue(0.7);
      Animated.spring(resultPop, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 }).start();
      return;
    }
    setIndex(index + 1);
    setSelectedChoice(null);
    setTextAnswer('');
    setRevealed(false);
  }

  if (finished) {
    const passed = correctCount / questions.length >= PASS_RATIO;
    return (
      <View style={styles.screen}>
        <Animated.View style={[styles.resultBlock, { transform: [{ scale: resultPop }] }]}>
          {passed ? <Celebration /> : null}
          <Text style={styles.resultTitle}>{passed ? 'Rätsel gelöst!' : 'Noch nicht ganz…'}</Text>
          <Text style={styles.resultScore}>
            {correctCount} / {questions.length} richtig
          </Text>
          <Text style={styles.resultMessage}>
            {passed
              ? 'Ein Steinblock gleitet zur Seite — der Weg in die nächste Kammer ist frei.'
              : `Kungbäkola braucht mindestens ${Math.ceil(questions.length * PASS_RATIO)} richtige Antworten, um diese Kammer zu knacken. Versuch es noch einmal!`}
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Zurück zur Kammer</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.progressBlock}>
        <Text style={styles.progressLabel}>
          Frage {index + 1} / {questions.length}
        </Text>
        <AnimatedBar progress={(index + (revealed ? 1 : 0)) / questions.length} />
      </View>

      <FadeSlideIn key={index} duration={280} distance={10}>
        <View style={styles.promptCard}>
          <ScriptText script={question.prompt} size="large" />
          <Text style={styles.promptHint}>Was bedeutet das auf Deutsch?</Text>
        </View>

        {question.type === 'multiple-choice' ? (
          <View style={styles.choices}>
            {question.choices.map((choice, i) => (
              <QuizChoice
                key={i}
                index={i}
                label={choice}
                isCorrect={i === question.correctChoiceIndex}
                isSelected={i === selectedChoice}
                revealed={revealed}
                onPress={() => handleMultipleChoiceSelect(i)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.translationBlock}>
            <TextInput
              style={styles.textInput}
              value={textAnswer}
              onChangeText={setTextAnswer}
              editable={!revealed}
              placeholder="Deine Übersetzung..."
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!revealed ? (
              <Pressable style={styles.primaryButton} onPress={handleTranslationSubmit} accessibilityRole="button" testID="quiz-submit">
                <Text style={styles.primaryButtonText}>Prüfen</Text>
              </Pressable>
            ) : (
              <Text style={styles.answerReveal}>Richtige Antwort: {question.acceptedAnswers[0]}</Text>
            )}
          </View>
        )}

        {revealed ? (
          <Pressable style={styles.primaryButton} onPress={goNext} accessibilityRole="button" testID="quiz-next">
            <Text style={styles.primaryButtonText}>{index + 1 >= questions.length ? 'Ergebnis anzeigen' : 'Weiter'}</Text>
          </Pressable>
        ) : null}
      </FadeSlideIn>
    </View>
  );
}

function QuizChoice({
  index,
  label,
  isCorrect,
  isSelected,
  revealed,
  onPress,
}: {
  index: number;
  label: string;
  isCorrect: boolean;
  isSelected: boolean;
  revealed: boolean;
  onPress: () => void;
}) {
  const { style: shakeStyle, shake } = useShake();
  const scale = useRef(new Animated.Value(1)).current;
  const showState = revealed && (isCorrect || isSelected);

  useEffect(() => {
    if (!revealed || !isSelected) return;
    if (isCorrect) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.05, useNativeDriver: true, speed: 20, bounciness: 10 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }),
      ]).start();
    } else {
      shake();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  return (
    <Animated.View style={[shakeStyle, { transform: [...shakeStyle.transform, { scale }] }]}>
      <Pressable
        onPress={onPress}
        disabled={revealed}
        accessibilityRole="button"
        testID={`quiz-choice-${index}`}
        style={[
          styles.choiceButton,
          showState && isCorrect && styles.choiceCorrect,
          showState && isSelected && !isCorrect && styles.choiceWrong,
        ]}
      >
        <Text style={styles.choiceText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 16 },
  progressBlock: { marginBottom: 20, gap: 6 },
  progressLabel: { fontSize: 13, color: colors.textMuted },
  promptCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  promptHint: { fontSize: 12, color: colors.textMuted, marginTop: 10 },
  choices: { gap: 10 },
  choiceButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
  },
  choiceCorrect: { backgroundColor: '#E4F3EA', borderColor: colors.success },
  choiceWrong: { backgroundColor: '#FBE7E5', borderColor: colors.danger },
  choiceText: { fontSize: 15, color: colors.text },
  translationBlock: { gap: 12 },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: colors.surface,
  },
  answerReveal: { fontSize: 14, color: colors.text },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  resultBlock: { alignItems: 'center' },
  resultTitle: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: 40 },
  resultScore: { fontSize: 18, color: colors.textMuted, marginTop: 8 },
  resultMessage: { fontSize: 14, color: colors.text, marginTop: 12, marginBottom: 24, lineHeight: 20, textAlign: 'center' },
});
