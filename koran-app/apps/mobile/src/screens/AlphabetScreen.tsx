import { ADDITIONAL_SIGNS, ARABIC_ALPHABET, VOWEL_MARKS, type ArabicSign } from "@koran-app/shared";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "../navigation";
import { colors, radius, spacing } from "../theme";

function FormCell({ label, glyph }: { label: string; glyph: string }) {
  return (
    <View style={styles.formCell}>
      <Text style={styles.formGlyph}>{glyph}</Text>
      <Text style={styles.formLabel}>{label}</Text>
    </View>
  );
}

function SignRow({ sign }: { sign: ArabicSign }) {
  return (
    <View style={styles.signRow}>
      <Text style={styles.signSymbol}>{sign.example ?? sign.symbol}</Text>
      <View style={styles.signInfo}>
        <Text style={styles.signName}>
          {sign.name} <Text style={styles.signTransliteration}>({sign.transliteration})</Text>
        </Text>
        <Text style={styles.signSound}>{sign.soundDe}</Text>
      </View>
    </View>
  );
}

export function AlphabetScreen() {
  const { goBack } = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={goBack} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Zurück</Text>
      </Pressable>

      <Text style={styles.title}>Arabisches Alphabet</Text>
      <Text style={styles.intro}>
        Die 28 Buchstaben mit ihren vier Formen (isoliert, am Wortanfang, in der Wortmitte, am
        Wortende). Quran-Texte sind vollständig vokalisiert — die Kurzvokal-Zeichen weiter unten
        brauchst du, um Verse wie „مِنْ“ oder „قُلْ“ tatsächlich lesen zu können.
      </Text>

      <Text style={styles.sectionTitle}>Die 28 Buchstaben</Text>
      {ARABIC_ALPHABET.map((letter) => (
        <View key={letter.id} style={styles.letterCard}>
          <View style={styles.letterHeader}>
            <Text style={styles.letterName}>{letter.name}</Text>
            <Text style={styles.letterTransliteration}>{letter.transliteration}</Text>
          </View>
          <Text style={styles.letterSound}>{letter.soundDe}</Text>
          <View style={styles.formsRow}>
            <FormCell label="Isoliert" glyph={letter.isolated} />
            <FormCell label="Anfang" glyph={letter.initial} />
            <FormCell label="Mitte" glyph={letter.medial} />
            <FormCell label="Ende" glyph={letter.final} />
          </View>
          {!letter.connectsForward && (
            <Text style={styles.noConnectNote}>verbindet sich nicht mit dem nächsten Buchstaben</Text>
          )}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Zusatzzeichen</Text>
      <Text style={styles.sectionSubtitle}>
        Hamza-Formen und Sonderbuchstaben, die in Quran-Texten ständig vorkommen.
      </Text>
      <View style={styles.signList}>
        {ADDITIONAL_SIGNS.map((sign) => (
          <SignRow key={sign.id} sign={sign} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Vokalzeichen (Harakat)</Text>
      <Text style={styles.sectionSubtitle}>
        Kurzvokale und weitere Aussprachezeichen, hier am Beispiel des Buchstabens ب (ba) gezeigt.
      </Text>
      <View style={styles.signList}>
        {VOWEL_MARKS.map((sign) => (
          <SignRow key={sign.id} sign={sign} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  backLink: { marginBottom: spacing.sm },
  backLinkText: { color: colors.accent },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  intro: { color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 20 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: spacing.lg, marginBottom: spacing.xs },
  sectionSubtitle: { color: colors.textMuted, marginBottom: spacing.sm, fontSize: 13 },
  letterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  letterHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  letterName: { color: colors.text, fontSize: 20 },
  letterTransliteration: { color: colors.accent, fontWeight: "700" },
  letterSound: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs, marginBottom: spacing.sm },
  formsRow: { flexDirection: "row", justifyContent: "space-between" },
  formCell: { alignItems: "center", flex: 1 },
  formGlyph: { color: colors.text, fontSize: 26 },
  formLabel: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xs },
  noConnectNote: { color: colors.textMuted, fontSize: 11, fontStyle: "italic", marginTop: spacing.sm },
  signList: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: "hidden" },
  signRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  signSymbol: { color: colors.text, fontSize: 28, minWidth: 48, textAlign: "center" },
  signInfo: { flex: 1 },
  signName: { color: colors.text, fontWeight: "700" },
  signTransliteration: { color: colors.accent, fontWeight: "400" },
  signSound: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
