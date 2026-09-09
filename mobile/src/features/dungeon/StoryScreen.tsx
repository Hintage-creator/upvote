import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { FadeSlideIn } from '../../components/animations/FadeSlideIn';

interface Props {
  onDone: () => void;
  buttonLabel?: string;
}

const PARAGRAPHS = [
  'Irgendwo am Rand der Sahara streunt eine kleine getigerte Katze durch den Sand — auf der Suche nach Schatten, nach Wasser, nach irgendetwas Vertrautem.',
  'Zwischen den Dünen taucht plötzlich etwas Riesiges auf: eine uralte Pyramide, halb vom Sand verschluckt. Neugierig schlüpft die Katze durch einen schmalen Spalt hinein.',
  'Kaum ist sie drinnen, schiebt sich mit einem dumpfen Grollen ein Steinblock vor den Eingang. Die Tür ist zu. Der einzige Weg zurück ans Licht führt durch die Kammern der Pyramide — und jede Kammer ist mit einem Rätsel in der Sprache der Wände verriegelt.',
  'Je tiefer Kungbäkola vordringt, desto mehr uralter Staub und Ruß legt sich auf ihr Fell. Nur wer die Rätsel löst, kommt weiter — und irgendwann wieder heraus.',
];

/**
 * The framing story, shown once before the pyramid opens (and replayable
 * from the Progress tab). Illustration is the user-supplied "standing"
 * concept artwork, used as-is.
 */
export function StoryScreen({ onDone, buttonLabel = 'Die Pyramide betreten' }: Props) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <FadeSlideIn distance={20}>
          <Image
            source={require('../../../assets/mascot/story-standing.png')}
            style={styles.illustration}
            resizeMode="cover"
          />
        </FadeSlideIn>
        <FadeSlideIn delay={150}>
          <Text style={styles.title}>Kungbäkola</Text>
        </FadeSlideIn>
        {PARAGRAPHS.map((text, i) => (
          <FadeSlideIn key={i} delay={250 + i * 220}>
            <Text style={styles.paragraph}>{text}</Text>
          </FadeSlideIn>
        ))}
      </ScrollView>
      <FadeSlideIn delay={250 + PARAGRAPHS.length * 220}>
        <Pressable style={styles.button} onPress={onDone} accessibilityRole="button">
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </Pressable>
      </FadeSlideIn>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 12, alignItems: 'center' },
  illustration: {
    width: '100%',
    aspectRatio: 1.15,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.primaryDark, marginBottom: 12 },
  paragraph: { fontSize: 15, lineHeight: 22, color: colors.text, marginBottom: 12, textAlign: 'left', alignSelf: 'stretch' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
