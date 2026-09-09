import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { getLanguagePack } from '../../data/languages';
import { phrasesByCategory } from '../../data/contentLookup';
import { ScriptText } from '../script/ScriptText';
import { ScriptModeToggle } from '../script/ScriptModeToggle';
import { ReviewBadge } from '../script/ReviewBadge';

const pack = getLanguagePack('mnk');

const CATEGORY_LABELS_DE: Record<string, string> = {
  greetings: 'Begrüßungen',
  basics: 'Grundlagen',
};

export function PhrasebookScreen() {
  const categories = phrasesByCategory(pack);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Phrasenbuch</Text>
      <Text style={styles.subheader}>
        Alltagssätze zum Nachschlagen — Bedeutung auf Deutsch und Englisch. Audio folgt, sobald
        Muttersprachler-Aufnahmen vorliegen.
      </Text>
      <View style={styles.toggleRow}>
        <ScriptModeToggle />
      </View>

      {Array.from(categories.entries()).map(([category, phrases]) => (
        <View key={category} style={styles.categoryBlock}>
          <Text style={styles.categoryTitle}>{CATEGORY_LABELS_DE[category] ?? category}</Text>
          {phrases.map((phrase) => (
            <View key={phrase.id} style={styles.phraseCard}>
              <View style={styles.headerRow}>
                <ScriptText script={phrase.script} size="medium" />
                <ReviewBadge status={phrase.status} />
              </View>
              <Text style={styles.de}>{phrase.translations.de}</Text>
              <Text style={styles.en}>{phrase.translations.en}</Text>
              {phrase.literalTranslation ? <Text style={styles.literal}>{phrase.literalTranslation.de}</Text> : null}
            </View>
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
  subheader: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 12 },
  toggleRow: { marginBottom: 16 },
  categoryBlock: { marginBottom: 20 },
  categoryTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryDark, marginBottom: 8 },
  phraseCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  de: { fontSize: 14, color: colors.text, marginTop: 6 },
  en: { fontSize: 13, color: colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  literal: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
