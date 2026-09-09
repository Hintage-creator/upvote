import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { getLanguagePack } from '../../data/languages';
import { lessonsForUnit, unitsSorted } from '../../data/contentLookup';
import { CourseStackParamList } from '../../navigation/types';
import { isLessonUnlocked } from '../dungeon/dungeon';
import { progressRepository } from '../progress';

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

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Die Pyramide</Text>
      <Text style={styles.subheader}>
        Kungbäkola sitzt fest. Löse die Rätsel Kammer für Kammer, um tiefer vorzudringen — und
        irgendwann wieder hinauszufinden.
      </Text>

      {units.map((unit) => (
        <View key={unit.id} style={styles.unitBlock}>
          <Text style={styles.unitTitle}>
            Kammer {unit.order} · {unit.titleDe}
          </Text>
          {lessonsForUnit(pack, unit.id).map((lesson) => {
            const unlocked = completedLessonIds === null || isLessonUnlocked(pack, lesson.id, completed);
            const isCompleted = completed.includes(lesson.id);
            return (
              <Pressable
                key={lesson.id}
                style={[styles.lessonCard, !unlocked && styles.lessonCardLocked]}
                onPress={() => {
                  if (!unlocked) {
                    Alert.alert('Kammer verriegelt', 'Löse zuerst die vorherige Kammer, um hier weiterzukommen.');
                    return;
                  }
                  navigation.navigate('Lesson', { lessonId: lesson.id });
                }}
                accessibilityRole="button"
              >
                <View style={[styles.lessonLevelBadge, !unlocked && styles.lessonLevelBadgeLocked]}>
                  <Text style={styles.lessonLevelText}>{unlocked ? (isCompleted ? '✓' : lesson.level) : '🔒'}</Text>
                </View>
                <View style={styles.lessonTextBlock}>
                  <Text style={[styles.lessonTitle, !unlocked && styles.textLocked]}>{lesson.titleDe}</Text>
                  {lesson.descriptionDe ? (
                    <Text style={[styles.lessonDescription, !unlocked && styles.textLocked]}>{lesson.descriptionDe}</Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
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
