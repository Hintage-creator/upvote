import { VocabItem } from '../../../types/content';

/**
 * Numbers 1-10. Latin forms follow widely-documented Manding patterns
 * (Bambara/Maninka-cognate); N'Ko forms are mechanical letter-by-letter
 * transliterations WITHOUT tone diacritics. Both need native-speaker
 * verification for the Guinea Maninka variety specifically — see README.md.
 */

const REVIEW_NOTE =
  'Allgemein in der Manding-Linguistik belegte Form (Bambara-nah); für Guinea-Maninka noch nicht verifiziert. N’Ko-Schreibung ohne Ton-Diakritika.';

let counter = 0;
const number = (latin: string, nko: string, de: string, en: string): VocabItem => {
  counter += 1;
  return {
    id: `mnk-number-${counter}`,
    languageCode: 'mnk',
    script: { latin, nko },
    translations: { de, en },
    partOfSpeech: 'number',
    status: { needsReview: true, note: REVIEW_NOTE },
    tags: ['numbers'],
  };
};

export const numberItems: VocabItem[] = [
  number('kelen', 'ߞߋߟߋߣ', 'eins', 'one'),
  number('fila', 'ߝߌߟߊ', 'zwei', 'two'),
  number('saba', 'ߛߊߓߊ', 'drei', 'three'),
  number('naani', 'ߣߊߣߌ', 'vier', 'four'),
  number('duuru', 'ߘߎߎߙߎ', 'fünf', 'five'),
  number('wɔɔrɔ', 'ߥߐߐߙߐ', 'sechs', 'six'),
  number('wolonfila', 'ߥߏߟߏߣߝߌߟߊ', 'sieben', 'seven'),
  number('seegin', 'ߛߋߋߜߌߣ', 'acht', 'eight'),
  number('kononto', 'ߞߏߣߏߣߕߏ', 'neun', 'nine'),
  number('tan', 'ߕߊߣ', 'zehn', 'ten'),
];
