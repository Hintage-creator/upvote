import type { Verse, VocabItem } from "@koran-app/shared";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { api, isVerse, itemRefFor } from "../api";
import { ItemCard } from "../components/ItemCard";
import { useNavigation } from "../navigation";
import { useSession } from "../session";
import { colors, radius, spacing } from "../theme";

type Phase = "idle" | "recording" | "submitting";

export function RecordScreen({ lessonId, item }: { lessonId: string; item: Verse | VocabItem }) {
  const { userId, applyStats } = useSession();
  const { navigate, goBack } = useNavigation();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const ref = itemRefFor(item);

  async function startRecording() {
    setError(null);
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setError("Mikrofonzugriff wurde nicht erlaubt. Bitte in den Geräteeinstellungen aktivieren.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setPhase("recording");
    } catch (err) {
      setError(
        `Aufnahme konnte nicht gestartet werden (${err instanceof Error ? err.message : String(err)}). ` +
          "Läuft die App in einer Umgebung ohne Mikrofon (z. B. ein Server ohne Audiogerät), ist das erwartbar."
      );
    }
  }

  async function stopAndSubmit() {
    setPhase("submitting");
    try {
      await recorder.stop();
      const recordingDurationMs = recorder.currentTime * 1000;
      const { result, stats, newlyEarnedBadges } = await api.scorePronunciation({
        userId,
        itemType: ref.type,
        itemId: ref.id,
        recordingDurationMs,
        audioUri: recorder.uri ?? undefined,
      });
      applyStats(stats);
      navigate({ screen: "feedback", lessonId, item, result, newlyEarnedBadges });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("idle");
    }
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={goBack} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Zurück</Text>
      </Pressable>

      <ItemCard item={item} />

      <View style={styles.recordBox}>
        {phase === "idle" && (
          <Pressable style={styles.recordButton} onPress={startRecording}>
            <Text style={styles.recordButtonText}>🎙 Aufnahme starten</Text>
          </Pressable>
        )}

        {phase === "recording" && (
          <>
            <Text style={styles.timer}>
              {(recorderState.durationMillis / 1000).toFixed(1)} s
            </Text>
            <Pressable style={styles.stopButton} onPress={stopAndSubmit}>
              <Text style={styles.recordButtonText}>⏹ Aufnahme beenden & bewerten</Text>
            </Pressable>
          </>
        )}

        {phase === "submitting" && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.submittingText}>Aussprache wird bewertet…</Text>
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <Text style={styles.hint}>
        Sprich {isVerse(item) ? "den Vers" : "das Wort"} laut nach der Referenz-Aussprache nach.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  backLink: { marginBottom: spacing.sm },
  backLinkText: { color: colors.accent },
  recordBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginTop: spacing.md,
  },
  recordButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  stopButton: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  recordButtonText: { color: colors.text, fontWeight: "700", fontSize: 16 },
  timer: { color: colors.text, fontSize: 28, fontWeight: "700", marginBottom: spacing.md },
  center: { alignItems: "center" },
  submittingText: { color: colors.textMuted, marginTop: spacing.sm },
  error: { color: colors.danger, marginTop: spacing.md, textAlign: "center" },
  hint: { color: colors.textMuted, marginTop: spacing.md, textAlign: "center" },
});
