import React, { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { getLanguagePack } from '../../data/languages';
import { grammarByIds, lessonById, phrasesByIds, vocabByIds } from '../../data/contentLookup';
import { CourseStackParamList } from '../../navigation/types';
import { ScriptText } from '../script/ScriptText';
import { ScriptModeToggle } from '../script/ScriptModeToggle';
import { ReviewBadge } from '../script/ReviewBadge';
import { progressRepository } from '../progress';
import { addXp, computeLevel, recordActivity } from '../progress/srs';
import { FadeSlideIn } from '../../components/animations/FadeSlideIn';
import { AnimatedPressable } from '../../components/animations/AnimatedPressable';
import { LevelUpBanner } from '../../components/animations/LevelUpBanner';

type Props = NativeStackScreenProps<CourseStackParamList, 'Lesson'>;

const pack = getLanguagePack('mnk');
const XP_PER_LESSON = 20;
const MAX_STAGGER = 8;

export function LessonScreen({ route, navigation }: Props) {
  const { lessonId } = route.params;
  const lesson = lessonById(pack, lessonId);
  const [completed, setCompleted] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [levelUpKey, setLevelUpKey] = useState(0);
  const [levelUpValue, setLevelUpValue] = useState(1);
  const bounce = React.useRef(new Animated.Value(1)).current;

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
    const levelBefore = computeLevel(progress.xp);
    const withActivity = recordActivity(progress);
    const withXp = addXp(withActivity, XP_PER_LESSON);
    await progressRepository.saveUserProgress(withXp);
    setCompleted(true);
    setJustCompleted(true);
    bounce.setValue(0.85);
    Animated.spring(bounce, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 12 }).start();

    const levelAfter = computeLevel(withXp.xp);
    if (levelAfter > levelBefore) {
      setLevelUpValue(levelAfter);
      setLevelUpKey(Date.now());
    }
  }

  let itemIndex = 0;

  return (
    <View style={styles.screen}>
      <LevelUpBanner level={levelUpValue} triggerKey={levelUpKey} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <FadeSlideIn>
        <Text style={styles.title}>{lesson.titleDe}</Text>
        {lesson.descriptionDe ? <Text style={styles.description}>{lesson.descriptionDe}</Text> : null}
      </FadeSlideIn>

      <View style={styles.toggleRow}>
        <ScriptModeToggle />
      </View>

      {lesson.sections.map((section, idx) => {
        if (section.type === 'alphabet' || section.type === 'vocab') {
          const items = vocabByIds(pack, section.itemIds);
          return (
            <View key={idx} style={styles.sectionBlock}>
              {items.map((item) => {
                const delay = Math.min(itemIndex++, MAX_STAGGER) * 45;
                return (
                  <FadeSlideIn key={item.id} delay={delay}>
                    <View style={styles.itemCard}>
                      <View style={styles.itemHeaderRow}>
                        <ScriptText script={item.script} size="medium" />
                        <ReviewBadge status={item.status} />
                      </View>
                      <Text style={styles.translation}>{item.translations.de}</Text>
                      {item.pronunciationHint ? <Text style={styles.hint}>{item.pronunciationHint}</Text> : null}
                    </View>
                  </FadeSlideIn>
                );
              })}
            </View>
          );
        }
        if (section.type === 'grammar') {
          const notes = grammarByIds(pack, section.itemIds);
          return (
            <View key={idx} style={styles.sectionBlock}>
              {notes.map((note) => {
                const delay = Math.min(itemIndex++, MAX_STAGGER) * 45;
                return (
                  <FadeSlideIn key={note.id} delay={delay}>
                    <View style={styles.grammarCard}>
                      <View style={styles.itemHeaderRow}>
                        <Text style={styles.grammarTitle}>{note.titleDe}</Text>
                        <ReviewBadge status={note.status} />
                      </View>
                      <Text style={styles.grammarText}>{note.explanationDe}</Text>
                    </View>
                  </FadeSlideIn>
                );
              })}
            </View>
          );
        }
        // phrases
        const phrases = phrasesByIds(pack, section.itemIds);
        return (
          <View key={idx} style={styles.sectionBlock}>
            {phrases.map((phrase) => {
              const delay = Math.min(itemIndex++, MAX_STAGGER) * 45;
              return (
                <FadeSlideIn key={phrase.id} delay={delay}>
                  <View style={styles.itemCard}>
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
                </FadeSlideIn>
              );
            })}
          </View>
        );
      })}

      <View style={styles.actions}>
        <Animated.View style={justCompleted ? { transform: [{ scale: bounce }] } : undefined}>
          <AnimatedPressable style={styles.completeButton} onPress={markCompleted} accessibilityRole="button">
            <Text style={styles.completeButtonText}>{completed ? 'Kammer studiert ✓' : 'Als studiert markieren'}</Text>
          </AnimatedPressable>
        </Animated.View>
        {hasQuizzableContent ? (
          <AnimatedPressable
            style={styles.quizButton}
            onPress={() => navigation.navigate('Quiz', { lessonId })}
            accessibilityRole="button"
          >
            <Text style={styles.quizButtonText}>Rätsel lösen</Text>
          </AnimatedPressable>
        ) : null}
      </View>
      </ScrollView>
    </View>
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
