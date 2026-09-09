import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { getLanguagePack } from '../../data/languages';
import { lessonItemIds, unitsSorted } from '../../data/contentLookup';
import { CourseStackParamList } from '../../navigation/types';
import { isLessonUnlocked, orderedLessons } from '../dungeon/dungeon';
import { progressRepository } from '../progress';
import { FadeSlideIn } from '../../components/animations/FadeSlideIn';
import { useShake } from '../../components/animations/useShake';
import { AnimatedPressable } from '../../components/animations/AnimatedPressable';
import { PawNode } from '../../components/paw/PawNode';
import { Lesson } from '../../types/content';

type Props = NativeStackScreenProps<CourseStackParamList, 'CourseList'>;

const pack = getLanguagePack('mnk');

/** Horizontal offset per path position, cycling every 4 rooms — the same gentle S-curve Duolingo uses for its unit path. */
const ZIGZAG: Array<'center' | 'right' | 'left'> = ['center', 'right', 'center', 'left'];

export function CourseListScreen({ navigation }: Props) {
  const units = unitsSorted(pack);
  const unitTitleById = new Map(units.map((u) => [u.id, `Kammer ${u.order} · ${u.titleDe}`]));
  const lessons = orderedLessons(pack);

  const [completedLessonIds, setCompletedLessonIds] = useState<string[] | null>(null);
  const [reviewedItemIds, setReviewedItemIds] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([progressRepository.getCompletedLessonIds(), progressRepository.getAllReviewStates()]).then(
        ([ids, reviewStates]) => {
          if (cancelled) return;
          setCompletedLessonIds(ids);
          setReviewedItemIds(new Set(reviewStates.map((s) => s.itemId)));
        }
      );
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const completed = completedLessonIds ?? [];
  const firstPlayableIndex = lessons.findIndex(
    (l) => !completed.includes(l.id) && (completedLessonIds === null || isLessonUnlocked(pack, l.id, completed))
  );

  let previousUnitId: string | null = null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <FadeSlideIn>
        <Text style={styles.header}>Die Pyramide</Text>
        <Text style={styles.subheader}>
          Kungbäkola sitzt fest. Löse die Rätsel Kammer für Kammer, um tiefer vorzudringen — und
          irgendwann wieder hinauszufinden. Ihre Pfoten werden rußiger, je mehr sie löst.
        </Text>
      </FadeSlideIn>

      {lessons.map((lesson, index) => {
        const showUnitHeader = lesson.unitId !== previousUnitId;
        previousUnitId = lesson.unitId;
        const unlocked = completedLessonIds === null || isLessonUnlocked(pack, lesson.id, completed);
        const isCompleted = completed.includes(lesson.id);
        const itemIds = lessonItemIds(lesson);
        const reviewedCount = itemIds.filter((id) => reviewedItemIds.has(id)).length;
        const progress = itemIds.length > 0 ? reviewedCount / itemIds.length : 0;

        return (
          <React.Fragment key={lesson.id}>
            {showUnitHeader ? (
              <Text style={styles.unitTitle}>{unitTitleById.get(lesson.unitId)}</Text>
            ) : null}
            <PathStop
              lesson={lesson}
              unlocked={unlocked}
              isCompleted={isCompleted}
              progress={progress}
              isCurrent={index === firstPlayableIndex}
              position={ZIGZAG[index % ZIGZAG.length]}
              index={index}
              onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id })}
            />
          </React.Fragment>
        );
      })}
    </ScrollView>
  );
}

function PathStop({
  lesson,
  unlocked,
  isCompleted,
  progress,
  isCurrent,
  position,
  index,
  onPress,
}: {
  lesson: Lesson;
  unlocked: boolean;
  isCompleted: boolean;
  progress: number;
  isCurrent: boolean;
  position: 'center' | 'left' | 'right';
  index: number;
  onPress: () => void;
}) {
  const { style: shakeStyle, shake } = useShake();

  return (
    <FadeSlideIn delay={Math.min(index, 8) * 60}>
      <View
        style={[
          styles.stopRow,
          position === 'right' && styles.stopRowRight,
          position === 'left' && styles.stopRowLeft,
        ]}
      >
        <Animated.View style={[styles.stopColumn, shakeStyle]}>
          <AnimatedPressable
            style={styles.stopColumn}
            pressScale={0.94}
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
            <PawNode
              progress={progress}
              locked={!unlocked}
              completed={isCompleted}
              isCurrent={unlocked && isCurrent}
              label={lesson.level}
            />
            <Text style={[styles.stopTitle, !unlocked && styles.textLocked]} numberOfLines={2}>
              {lesson.titleDe}
            </Text>
          </AnimatedPressable>
        </Animated.View>
      </View>
    </FadeSlideIn>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  header: { fontSize: 26, fontWeight: '700', color: colors.text },
  subheader: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 24, lineHeight: 18 },
  unitTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryDark, marginTop: 8, marginBottom: 14 },
  stopRow: { width: '100%', alignItems: 'center', marginBottom: 6 },
  stopRowRight: { alignItems: 'flex-end', paddingRight: '12%' },
  stopRowLeft: { alignItems: 'flex-start', paddingLeft: '12%' },
  stopColumn: { alignItems: 'center', width: 92 },
  stopTitle: { fontSize: 11.5, color: colors.text, textAlign: 'center', marginTop: 4, fontWeight: '600' },
  textLocked: { color: colors.textMuted },
});
