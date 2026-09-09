import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { getLanguagePack } from '../../data/languages';
import { lessonsForUnit, unitsSorted } from '../../data/contentLookup';
import { CourseStackParamList } from '../../navigation/types';
import { isLessonUnlocked } from '../dungeon/dungeon';
import { progressRepository } from '../progress';
import { FadeSlideIn } from '../../components/animations/FadeSlideIn';
import { useShake } from '../../components/animations/useShake';
import { useWiggle } from '../../components/animations/useWiggle';
import { AnimatedPressable } from '../../components/animations/AnimatedPressable';
import { Lesson } from '../../types/content';

type Props = NativeStackScreenProps<CourseStackParamList, 'CourseList'>;

const pack = getLanguagePack('mnk');

export function CourseListScreen({ navigation }: Props) {
  const units = unitsSorted(pack);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      progressRepository.getCompletedLessonIds().then((ids) => {
        if (!cancelled) setCompletedLessonIds(ids);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const completed = completedLessonIds ?? [];
  let globalIndex = 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <FadeSlideIn>
        <Text style={styles.header}>Die Pyramide</Text>
        <Text style={styles.subheader}>
          Kungbäkola sitzt fest. Löse die Rätsel Kammer für Kammer, um tiefer vorzudringen — und
          irgendwann wieder hinauszufinden.
        </Text>
      </FadeSlideIn>

      {units.map((unit) => (
        <View key={unit.id} style={styles.unitBlock}>
          <Text style={styles.unitTitle}>
            Kammer {unit.order} · {unit.titleDe}
          </Text>
          {lessonsForUnit(pack, unit.id).map((lesson) => {
            const unlocked = completedLessonIds === null || isLessonUnlocked(pack, lesson.id, completed);
            const isCompleted = completed.includes(lesson.id);
            const index = globalIndex++;
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                unlocked={unlocked}
                isCompleted={isCompleted}
                index={index}
                onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id })}
              />
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

function LessonCard({
  lesson,
  unlocked,
  isCompleted,
  index,
  onPress,
}: {
  lesson: Lesson;
  unlocked: boolean;
  isCompleted: boolean;
  index: number;
  onPress: () => void;
}) {
  const { style: shakeStyle, shake } = useShake();
  const wiggleStyle = useWiggle(!unlocked);

  return (
    <FadeSlideIn delay={Math.min(index, 8) * 50}>
      <Animated.View style={shakeStyle}>
        <AnimatedPressable
          style={[styles.lessonCard, !unlocked && styles.lessonCardLocked]}
          pressScale={0.98}
          onPress={() => {
            if (!unlocked) {
              shake();
              Alert.alert('Kammer verriegelt', 'Löse zuerst die vorherige Kammer, um hier weiterzukommen.');
              return;
            }
            onPress();
          }}
          accessibilityRole="button"
        >
          <Animated.View style={[styles.lessonLevelBadge, !unlocked && styles.lessonLevelBadgeLocked, unlocked ? undefined : wiggleStyle]}>
            <Text style={styles.lessonLevelText}>{unlocked ? (isCompleted ? '✓' : lesson.level) : '🔒'}</Text>
          </Animated.View>
          <View style={styles.lessonTextBlock}>
            <Text style={[styles.lessonTitle, !unlocked && styles.textLocked]}>{lesson.titleDe}</Text>
            {lesson.descriptionDe ? (
              <Text style={[styles.lessonDescription, !unlocked && styles.textLocked]}>{lesson.descriptionDe}</Text>
            ) : null}
          </View>
        </AnimatedPressable>
      </Animated.View>
    </FadeSlideIn>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  header: { fontSize: 26, fontWeight: '700', color: colors.text },
  subheader: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 20, lineHeight: 18 },
  unitBlock: { marginBottom: 20 },
  unitTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryDark, marginBottom: 8 },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  lessonCardLocked: {
    backgroundColor: '#F1EDE6',
    borderStyle: 'dashed',
  },
  lessonLevelBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonLevelBadgeLocked: {
    backgroundColor: colors.textMuted,
  },
  lessonLevelText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  lessonTextBlock: { flex: 1 },
  lessonTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  lessonDescription: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  textLocked: { color: colors.textMuted },
});
