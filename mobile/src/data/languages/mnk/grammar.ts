import { GrammarNote } from '../../../types/content';

const REVIEW_NOTE =
  'Allgemeine Manding-Strukturaussage aus der Sprachtypologie; Beispielsätze für Guinea-Maninka noch nicht verifiziert.';

export const grammarNotes: GrammarNote[] = [
  {
    id: 'mnk-grammar-1',
    languageCode: 'mnk',
    titleDe: 'Satzstellung: Subjekt – Objekt – Verb',
    titleEn: 'Word order: Subject – Object – Verb',
    explanationDe:
      'Manding-Sprachen wie Malinke ordnen einen einfachen Satz typischerweise als Subjekt – Objekt – Verb (SOV), anders als im Deutschen oder Englischen (SVO). Zwischen Subjekt und Verb steht oft ein Prädikatsmarker, der z. B. Zeitform oder Aussagekraft anzeigt.',
    explanationEn:
      'Manding languages such as Malinke typically order a simple sentence as Subject – Object – Verb (SOV), unlike German or English (SVO). A predicate marker often sits between subject and verb, indicating things like tense or assertion.',
    examples: [],
    status: { needsReview: true, note: REVIEW_NOTE },
  },
  {
    id: 'mnk-grammar-2',
    languageCode: 'mnk',
    titleDe: 'Personalpronomen',
    titleEn: 'Personal pronouns',
    explanationDe:
      'Die Personalpronomen (ich, du, er/sie/es, wir, ihr, sie) stehen als eigenständige Wörter vor dem Prädikat. Siehe die Vokabelliste „Pronomen“ in dieser Lektion.',
    explanationEn:
      'Personal pronouns (I, you, he/she/it, we, you-pl., they) stand as independent words before the predicate. See the "Pronouns" vocabulary list in this lesson.',
    examples: [],
    status: { needsReview: true, note: REVIEW_NOTE },
  },
];
