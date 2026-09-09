import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { progressRepository } from './index';
import { UserProgress, xpToNextLevel } from './srs';
import { getLanguagePack } from '../../data/languages';
import { CatAvatar } from '../dungeon/CatAvatar';
import { computeSootStage, SOOT_STAGE_LABELS_DE } from '../dungeon/dungeon';
import { StoryScreen } from '../dungeon/StoryScreen';
import { FadeSlideIn } from '../../components/animations/FadeSlideIn';
import { AnimatedBar } from '../../components/animations/AnimatedBar';
import { AnimatedCounter } from '../../components/animations/AnimatedCounter';
import { AnimatedPressable } from '../../components/animations/AnimatedPressable';

const pack = getLanguagePack('mnk');

export function ProgressScreen() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [dueCount, setDueCount] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [storyVisible, setStoryVisible] = useState(false);

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
        setCompletedLessonIds(completedLessons);
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
  const sootStage = computeSootStage(completedLessonIds, pack.lessons.length);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <FadeSlideIn>
        <View style={styles.avatarRow}>
          <CatAvatar sootStage={sootStage} size={88} />
          <View style={styles.avatarTextBlock}>
            <Text style={styles.header}>Kungbäkola</Text>
            <Text style={styles.sootLabel}>{SOOT_STAGE_LABELS_DE[sootStage]} vom Pyramidenstaub</Text>
            <AnimatedPressable onPress={() => setStoryVisible(true)} pressScale={0.94} accessibilityRole="button">
              <Text style={styles.storyLink}>Geschichte noch einmal ansehen</Text>
            </AnimatedPressable>
          </View>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={60}>
        <View style={styles.row}>
          <StatCard label="Streak" numericValue={progress.currentStreak} suffix=" 🔥" sub={`Bestwert: ${progress.longestStreak}`} />
          <StatCard label="Level" numericValue={currentLevel} sub={`${xpIntoLevel} / ${xpNeededForNext} XP`} />
        </View>
      </FadeSlideIn>
      <FadeSlideIn delay={110}>
        <View style={styles.row}>
          <StatCard label="Fällige Wiederholungen" numericValue={dueCount} sub="warten auf dich" />
          <StatCard label="Kammern gelöst" numericValue={completedLessonIds.length} sub={`von ${pack.lessons.length}`} />
        </View>
      </FadeSlideIn>

      <View style={styles.levelBarBlock}>
        <AnimatedBar progress={levelProgressRatio} />
      </View>

      {dueCount > 0 ? (
        <FadeSlideIn delay={160}>
          <View style={styles.dueBlock}>
            <Text style={styles.dueTitle}>Bereit zur Wiederholung</Text>
            <Text style={styles.dueText}>
              Öffne eine Kammer und löse das Rätsel erneut — fällige Vokabeln werden dabei automatisch
              wiederholt.
            </Text>
          </View>
        </FadeSlideIn>
      ) : null}

      <Modal visible={storyVisible} animationType="slide" onRequestClose={() => setStoryVisible(false)}>
        <StoryScreen onDone={() => setStoryVisible(false)} buttonLabel="Schließen" />
      </Modal>
    </ScrollView>
  );
}

function StatCard({ label, numericValue, suffix, sub }: { label: string; numericValue: number; suffix?: string; sub: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <AnimatedCounter value={numericValue} suffix={suffix} style={styles.statValue} />
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatarTextBlock: { flex: 1 },
  header: { fontSize: 24, fontWeight: '700', color: colors.text },
  sootLabel: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  storyLink: { fontSize: 12, color: colors.primaryDark, fontWeight: '600', marginTop: 6, textDecorationLine: 'underline' },
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
  levelBarBlock: { marginTop: 4, marginBottom: 20 },
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
