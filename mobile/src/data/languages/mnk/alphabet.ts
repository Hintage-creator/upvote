import { VocabItem } from '../../../types/content';

/**
 * N'Ko core alphabet (7 vowels + 18 primary consonants + the nasal letter
 * ߒ). This is standardized writing-system data (Unicode block U+07C0–U+07FF)
 * rather than a dialect-specific judgment call, so confidence here is
 * higher than for the vocabulary/phrase packs — but it still ships
 * `needsReview: true` because a few peripheral letters (rra, na woloso, nya
 * woloso, the three jona letters used mostly for loanwords) were left out
 * pending review; see README.md in this folder.
 */

const REVIEW_NOTE =
  'N’Ko-Kernbuchstabe (Unicode-Standard). Einige erweiterte Buchstaben (rra, woloso-Varianten, jona-Reihe) fehlen bewusst, siehe README.';

let counter = 0;
const letter = (
  latin: string,
  nko: string,
  descDe: string,
  descEn: string,
  ipa: string
): VocabItem => {
  counter += 1;
  return {
    id: `mnk-letter-${counter}`,
    languageCode: 'mnk',
    script: { latin, nko },
    translations: { de: descDe, en: descEn },
    partOfSpeech: 'letter',
    pronunciationHint: ipa,
    status: { needsReview: true, note: REVIEW_NOTE },
    tags: ['alphabet'],
  };
};

export const vowels: VocabItem[] = [
  letter('a', 'ߊ', 'Vokal A', 'Vowel A', '/a/'),
  letter('e', 'ߋ', 'Vokal E (geschlossen)', 'Vowel E (close)', '/e/'),
  letter('i', 'ߌ', 'Vokal I', 'Vowel I', '/i/'),
  letter('ɛ', 'ߍ', 'Vokal Ɛ (offen)', 'Vowel E (open)', '/ɛ/'),
  letter('u', 'ߎ', 'Vokal U', 'Vowel U', '/u/'),
  letter('o', 'ߏ', 'Vokal O (geschlossen)', 'Vowel O (close)', '/o/'),
  letter('ɔ', 'ߐ', 'Vokal O (offen)', 'Vowel O (open)', '/ɔ/'),
];

export const nasal: VocabItem[] = [letter('n', 'ߒ', 'Nasal N (silbisch)', 'Syllabic nasal N', '/ɲ̩/')];

export const consonants: VocabItem[] = [
  letter('b', 'ߓ', 'Konsonant B', 'Consonant B', '/b/'),
  letter('p', 'ߔ', 'Konsonant P', 'Consonant P', '/p/'),
  letter('t', 'ߕ', 'Konsonant T', 'Consonant T', '/t/'),
  letter('j', 'ߖ', 'Konsonant J (wie dsch)', 'Consonant J (as in "jam")', '/dʒ/'),
  letter('c', 'ߗ', 'Konsonant C (wie tsch)', 'Consonant C (as in "church")', '/tʃ/'),
  letter('d', 'ߘ', 'Konsonant D', 'Consonant D', '/d/'),
  letter('r', 'ߙ', 'Konsonant R', 'Consonant R', '/r/'),
  letter('s', 'ߛ', 'Konsonant S', 'Consonant S', '/s/'),
  letter('gb', 'ߜ', 'Konsonant GB (Doppelverschluss)', 'Consonant GB (labial-velar)', '/ɡɓ/'),
  letter('f', 'ߝ', 'Konsonant F', 'Consonant F', '/f/'),
  letter('k', 'ߞ', 'Konsonant K', 'Consonant K', '/k/'),
  letter('l', 'ߟ', 'Konsonant L', 'Consonant L', '/l/'),
  letter('m', 'ߡ', 'Konsonant M', 'Consonant M', '/m/'),
  letter('ɲ', 'ߢ', 'Konsonant NY', 'Consonant NY', '/ɲ/'),
  letter('n', 'ߣ', 'Konsonant N', 'Consonant N', '/n/'),
  letter('h', 'ߤ', 'Konsonant H', 'Consonant H', '/h/'),
  letter('w', 'ߥ', 'Konsonant W', 'Consonant W', '/w/'),
  letter('y', 'ߦ', 'Konsonant Y', 'Consonant Y', '/j/'),
];

export const alphabetItems: VocabItem[] = [...vowels, ...nasal, ...consonants];
