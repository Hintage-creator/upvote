import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { getLanguagePack } from '../../data/languages';
import { CourseStackParamList } from '../../navigation/types';
import { isLessonUnlocked, orderedLessons, pawGroups } from '../dungeon/dungeon';
import { progressRepository } from '../progress';
import { FadeSlideIn } from '../../components/animations/FadeSlideIn';
import { useShake } from '../../components/animations/useShake';
import { AnimatedPressable } from '../../components/animations/AnimatedPressable';
import { PawNode } from '../../components/paw/PawNode';
import { Lesson } from '../../types/content';

type Props = NativeStackScreenProps<CourseStackParamList, 'CourseList'>;

const pack = getLanguagePack('mnk');

/** Horizontal offset per path position, cycling every 4 paws — the same gentle S-curve Duolingo uses for its unit path. */
const ZIGZAG: Array<'center' | 'right' | 'left'> = ['center', 'right', 'center', 'left'];

export function CourseListScreen({ navigation }: Props) {
  const groups = pawGroups(pack);
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
  const allLessons = orderedLessons(pack);
  const firstPlayableLesson = allLessons.find(
    (l) => !completed.includes(l.id) && (completedLessonIds === null || isLessonUnlocked(pack, l.id, completed))
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <FadeSlideIn>
        <Text style={styles.header}>Die Pyramide</Text>
        <Text style={styles.subheader}>
          Kungbäkola sitzt fest. Löse die Rätsel Kammer für Kammer, um tiefer vorzudringen — und
          irgendwann wieder hinauszufinden. Jede gelöste Kammer schwärzt eine ihrer Pfotenzehen.
        </Text>
      </FadeSlideIn>

      {groups.map((group, index) => {
        const unlocked = completedLessonIds === null || isLessonUnlocked(pack, group[0].id, completed);
        const filledSegments = group.filter((l) => completed.includes(l.id)).length;
        const isCompleted = filledSegments === group.length;
        const isCurrent = group.some((l) => l.id === firstPlayableLesson?.id);
        const targetLesson = group.find((l) => !completed.includes(l.id)) ?? group[0];

        return (
          <PawStop
            key={group[0].id}
            groupNumber={index + 1}
            totalSegments={group.length}
            filledSegments={filledSegments}
            unlocked={unlocked}
            isCompleted={isCompleted}
            isCurrent={unlocked && isCurrent}
            position={ZIGZAG[index % ZIGZAG.length]}
            index={index}
            onPress={() => navigation.navigate('Lesson', { lessonId: targetLesson.id })}
          />
        );
      })}
    </ScrollView>
  );
}

function PawStop({
  groupNumber,
  totalSegments,
  filledSegments,
  unlocked,
  isCompleted,
  isCurrent,
  position,
  index,
  onPress,
}: {
  groupNumber: number;
  totalSegments: number;
  filledSegments: number;
  unlocked: boolean;
  isCompleted: boolean;
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
              totalSegments={totalSegments}
              filledSegments={filledSegments}
              locked={!unlocked}
              completed={isCompleted}
              isCurrent={isCurrent}
              label={groupNumber}
            />
            <Text style={[styles.stopTitle, !unlocked && styles.textLocked]}>Kammer {groupNumber}</Text>
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
  stopRow: { width: '100%', alignItems: 'center', marginBottom: 6 },
  stopRowRight: { alignItems: 'flex-end', paddingRight: '12%' },
  stopRowLeft: { alignItems: 'flex-start', paddingLeft: '12%' },
  stopColumn: { alignItems: 'center', width: 92 },
  stopTitle: { fontSize: 11.5, color: colors.text, textAlign: 'center', marginTop: 4, fontWeight: '600' },
  textLocked: { color: colors.textMuted },
});
