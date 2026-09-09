import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { progressRepository } from './index';
import { UserProgress, xpToNextLevel } from './srs';
import { getLanguagePack } from '../../data/languages';

const pack = getLanguagePack('mnk');

export function ProgressScreen() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [dueCount, setDueCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function load() {
        const [userProgress, dueStates, completedLessons] = await Promise.all([
          progressRepository.getUserProgress(),
          progressRepository.getDueReviewStates(),
          progressRepository.getCompletedLessonIds(),
        ]);
        if (cancelled) return;
        setProgress(userProgress);
        setDueCount(dueStates.length);
        setCompletedCount(completedLessons.length);
      }
      load();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  if (!progress) {
    return (
      <View style={styles.screen}>
        <Text>Lädt…</Text>
      </View>
    );
  }

  const { currentLevel, xpIntoLevel, xpNeededForNext } = xpToNextLevel(progress.xp);
  const levelProgressRatio = xpNeededForNext > 0 ? xpIntoLevel / xpNeededForNext : 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Fortschritt</Text>

      <View style={styles.row}>
        <StatCard label="Streak" value={`${progress.currentStreak} 🔥`} sub={`Bestwert: ${progress.longestStreak}`} />
        <StatCard label="Level" value={String(currentLevel)} sub={`${xpIntoLevel} / ${xpNeededForNext} XP`} />
      </View>
      <View style={styles.row}>
        <StatCard label="Fällige Wiederholungen" value={String(dueCount)} sub="warten auf dich" />
        <StatCard label="Lektionen gelernt" value={String(completedCount)} sub={`von ${pack.lessons.length}`} />
      </View>

      <View style={styles.levelBarTrack}>
        <View style={[styles.levelBarFill, { width: `${Math.min(100, Math.round(levelProgressRatio * 100))}%` }]} />
      </View>

      {dueCount > 0 ? (
        <View style={styles.dueBlock}>
          <Text style={styles.dueTitle}>Bereit zur Wiederholung</Text>
          <Text style={styles.dueText}>
            Öffne eine Lektion und starte das Quiz erneut — fällige Vokabeln werden dabei automatisch
            wiederholt.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  header: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  statLabel: { fontSize: 12, color: colors.textMuted },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 4 },
  statSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  levelBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 20,
  },
  levelBarFill: { height: '100%', backgroundColor: colors.primary },
  dueBlock: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: 12,
    padding: 14,
  },
  dueTitle: { fontWeight: '700', color: colors.warningText, marginBottom: 4 },
  dueText: { fontSize: 13, color: colors.warningText },
});
