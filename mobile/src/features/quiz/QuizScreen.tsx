import React, { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../theme/colors';
import { getLanguagePack } from '../../data/languages';
import { lessonById, phrasesByIds, vocabByIds } from '../../data/contentLookup';
import { CourseStackParamList } from '../../navigation/types';
import { ScriptText } from '../script/ScriptText';
import { buildQuiz, checkTranslationAnswer } from './quizGenerator';
import { QuizQuestion } from '../../types/content';
import { progressRepository } from '../progress';
import { addXp, gradeReview, initReviewState, recordActivity } from '../progress/srs';

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
      if (correctCount / questions.length >= PASS_RATIO) {
        await progressRepository.markLessonCompleted(lessonId);
      }
      setFinished(true);
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
        <Text style={styles.resultTitle}>{passed ? 'Rätsel gelöst!' : 'Noch nicht ganz…'}</Text>
        <Text style={styles.resultScore}>
          {correctCount} / {questions.length} richtig
        </Text>
        <Text style={styles.resultMessage}>
          {passed
            ? 'Ein Steinblock gleitet zur Seite — der Weg in die nächste Kammer ist frei.'
            : `Kungbäkola braucht mindestens ${Math.ceil(questions.length * PASS_RATIO)} richtige Antworten, um diese Kammer zu knacken. Versuch es noch einmal!`}
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Zurück zur Kammer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.progressLabel}>
        Frage {index + 1} / {questions.length}
      </Text>

      <View style={styles.promptCard}>
        <ScriptText script={question.prompt} size="large" />
        <Text style={styles.promptHint}>Was bedeutet das auf Deutsch?</Text>
      </View>

      {question.type === 'multiple-choice' ? (
        <View style={styles.choices}>
          {question.choices.map((choice, i) => {
            const isCorrect = i === question.correctChoiceIndex;
            const isSelected = i === selectedChoice;
            const showState = revealed && (isCorrect || isSelected);
            return (
              <Pressable
                key={i}
                onPress={() => handleMultipleChoiceSelect(i)}
                disabled={revealed}
                style={[
                  styles.choiceButton,
                  showState && isCorrect && styles.choiceCorrect,
                  showState && isSelected && !isCorrect && styles.choiceWrong,
                ]}
              >
                <Text style={styles.choiceText}>{choice}</Text>
              </Pressable>
            );
          })}
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
            <Pressable style={styles.primaryButton} onPress={handleTranslationSubmit}>
              <Text style={styles.primaryButtonText}>Prüfen</Text>
            </Pressable>
          ) : (
            <Text style={styles.answerReveal}>
              Richtige Antwort: {question.acceptedAnswers[0]}
            </Text>
          )}
        </View>
      )}

      {revealed ? (
        <Pressable style={styles.primaryButton} onPress={goNext}>
          <Text style={styles.primaryButtonText}>{index + 1 >= questions.length ? 'Ergebnis anzeigen' : 'Weiter'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 16 },
  progressLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
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
  resultTitle: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: 40 },
  resultScore: { fontSize: 18, color: colors.textMuted, marginTop: 8 },
  resultMessage: { fontSize: 14, color: colors.text, marginTop: 12, marginBottom: 24, lineHeight: 20 },
});
