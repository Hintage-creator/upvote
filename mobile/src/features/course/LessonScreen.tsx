import React, { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { getLanguagePack } from '../../data/languages';
import { grammarByIds, lessonById, phrasesByIds, vocabByIds } from '../../data/contentLookup';
import { CourseStackParamList } from '../../navigation/types';
import { ScriptText } from '../script/ScriptText';
import { ScriptModeToggle } from '../script/ScriptModeToggle';
import { ReviewBadge } from '../script/ReviewBadge';
import { progressRepository } from '../progress';
import { addXp, recordActivity } from '../progress/srs';

type Props = NativeStackScreenProps<CourseStackParamList, 'Lesson'>;

const pack = getLanguagePack('mnk');
const XP_PER_LESSON = 20;

export function LessonScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const lesson = lessonById(pack, lessonId);
  const [completed, setCompleted] = useState(false);

  const hasQuizzableContent = useMemo(
    () => lesson?.sections.some((s) => s.type === 'vocab' || s.type === 'alphabet' || s.type === 'phrases') ?? false,
    [lesson]
  );

  if (!lesson) {
    return (
      <View style={styles.screen}>
        <Text>Lektion nicht gefunden.</Text>
      </View>
    );
  }

  async function markCompleted() {
    await progressRepository.markLessonCompleted(lessonId);
    const progress = await progressRepository.getUserProgress();
    const withActivity = recordActivity(progress);
    const withXp = addXp(withActivity, XP_PER_LESSON);
    await progressRepository.saveUserProgress(withXp);
    setCompleted(true);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{lesson.titleDe}</Text>
      {lesson.descriptionDe ? <Text style={styles.description}>{lesson.descriptionDe}</Text> : null}

      <View style={styles.toggleRow}>
        <ScriptModeToggle />
      </View>

      {lesson.sections.map((section, idx) => {
        if (section.type === 'alphabet' || section.type === 'vocab') {
          const items = vocabByIds(pack, section.itemIds);
          return (
            <View key={idx} style={styles.sectionBlock}>
              {items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeaderRow}>
                    <ScriptText script={item.script} size="medium" />
                    <ReviewBadge status={item.status} />
                  </View>
                  <Text style={styles.translation}>{item.translations.de}</Text>
                  {item.pronunciationHint ? <Text style={styles.hint}>{item.pronunciationHint}</Text> : null}
                </View>
              ))}
            </View>
          );
        }
        if (section.type === 'grammar') {
          const notes = grammarByIds(pack, section.itemIds);
          return (
            <View key={idx} style={styles.sectionBlock}>
              {notes.map((note) => (
                <View key={note.id} style={styles.grammarCard}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.grammarTitle}>{note.titleDe}</Text>
                    <ReviewBadge status={note.status} />
                  </View>
                  <Text style={styles.grammarText}>{note.explanationDe}</Text>
                </View>
              ))}
            </View>
          );
        }
        // phrases
        const phrases = phrasesByIds(pack, section.itemIds);
        return (
          <View key={idx} style={styles.sectionBlock}>
            {phrases.map((phrase) => (
              <View key={phrase.id} style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                  <ScriptText script={phrase.script} size="medium" />
                  <ReviewBadge status={phrase.status} />
                </View>
                <Text style={styles.translation}>{phrase.translations.de}</Text>
                <Text style={styles.translationEn}>{phrase.translations.en}</Text>
                {phrase.literalTranslation ? (
                  <Text style={styles.hint}>{phrase.literalTranslation.de}</Text>
                ) : null}
              </View>
            ))}
          </View>
        );
      })}

      <View style={styles.actions}>
        <Pressable style={styles.completeButton} onPress={markCompleted}>
          <Text style={styles.completeButtonText}>{completed ? 'Kammer studiert ✓' : 'Als studiert markieren'}</Text>
        </Pressable>
        {hasQuizzableContent ? (
          <Pressable
            style={styles.quizButton}
            onPress={() => navigation.navigate('Quiz', { lessonId })}
          >
            <Text style={styles.quizButtonText}>Rätsel lösen</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  description: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 12 },
  toggleRow: { marginBottom: 16 },
  sectionBlock: { marginBottom: 16, gap: 8 },
  itemCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  translation: { fontSize: 14, color: colors.text, marginTop: 6 },
  translationEn: { fontSize: 13, color: colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  grammarCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  grammarTitle: { fontSize: 15, fontWeight: '700', color: colors.primaryDark, flex: 1 },
  grammarText: { fontSize: 14, color: colors.text, marginTop: 6, lineHeight: 20 },
  actions: { marginTop: 12, gap: 10 },
  completeButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  completeButtonText: { color: '#fff', fontWeight: '700' },
  quizButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quizButtonText: { color: '#fff', fontWeight: '700' },
});
