import type { Verse, VocabItem } from "@koran-app/shared";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { isVerse } from "../api";
import { colors, radius, spacing } from "../theme";

/**
 * Displays one verse or vocabulary item with Arabic text, transliteration and
 * both translations, plus a reference-audio play button.
 *
 * referenceAudioUrl is null for every seed item in this prototype (see
 * packages/shared/src/content.ts) because bundling native-speaker Quran
 * recitation audio requires a rights-cleared source, not something to
 * fabricate here - so the button renders disabled with an explanatory label
 * instead of silently doing nothing.
 */
export function ItemCard({ item }: { item: Verse | VocabItem }) {
  const player = useAudioPlayer(item.referenceAudioUrl ?? undefined);
  const status = useAudioPlayerStatus(player);
  const verse = isVerse(item) ? item : null;

  return (
    <View style={styles.card}>
      {verse && (
        <Text style={styles.reference}>
          {verse.surahNameLatin} {verse.surahNumber}:{verse.ayahNumber}
        </Text>
      )}
      <Text style={styles.arabic}>{isVerse(item) ? item.arabicText : item.arabicWord}</Text>
      <Text style={styles.transliteration}>{item.transliteration}</Text>
      <Text style={styles.translation}>DE: {item.translationDe}</Text>
      <Text style={styles.translation}>EN: {item.translationEn}</Text>

      <Pressable
        disabled={!item.referenceAudioUrl}
        onPress={() => (status.playing ? player.pause() : player.play())}
        style={[styles.playButton, !item.referenceAudioUrl && styles.playButtonDisabled]}
      >
        <Text style={styles.playButtonText}>
          {item.referenceAudioUrl
            ? status.playing
              ? "⏸ Pause"
              : "▶ Referenz abspielen"
            : "Keine Referenz-Audiodatei hinterlegt"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  reference: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs },
  arabic: {
    color: colors.text,
    fontSize: 32,
    textAlign: "right",
    marginBottom: spacing.sm,
    lineHeight: 48,
  },
  transliteration: {
    color: colors.accent,
    fontStyle: "italic",
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  translation: { color: colors.textMuted, fontSize: 14, marginBottom: spacing.xs },
  playButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  playButtonDisabled: { backgroundColor: colors.surfaceAlt },
  playButtonText: { color: colors.text, fontWeight: "600" },
});
