import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { getLanguagePack } from '../../data/languages';
import { lessonsForUnit, unitsSorted } from '../../data/contentLookup';
import { CourseStackParamList } from '../../navigation/types';
import { LANGUAGES } from '../../types/content';

type Props = NativeStackScreenProps<CourseStackParamList, 'CourseList'>;

const pack = getLanguagePack('mnk');

export function CourseListScreen({ navigation }: Props) {
  const units = unitsSorted(pack);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Grundkurs</Text>
      <Text style={styles.subheader}>{LANGUAGES[pack.languageCode].nameDe}</Text>

      {units.map((unit) => (
        <View key={unit.id} style={styles.unitBlock}>
          <Text style={styles.unitTitle}>{unit.titleDe}</Text>
          {lessonsForUnit(pack, unit.id).map((lesson) => (
            <Pressable
              key={lesson.id}
              style={styles.lessonCard}
              onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id })}
              accessibilityRole="button"
            >
              <View style={styles.lessonLevelBadge}>
                <Text style={styles.lessonLevelText}>{lesson.level}</Text>
              </View>
              <View style={styles.lessonTextBlock}>
                <Text style={styles.lessonTitle}>{lesson.titleDe}</Text>
                {lesson.descriptionDe ? <Text style={styles.lessonDescription}>{lesson.descriptionDe}</Text> : null}
              </View>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  header: { fontSize: 26, fontWeight: '700', color: colors.text },
  subheader: { fontSize: 14, color: colors.textMuted, marginBottom: 20 },
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
  lessonLevelBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonLevelText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  lessonTextBlock: { flex: 1 },
  lessonTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  lessonDescription: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
