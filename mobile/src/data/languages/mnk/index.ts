import { LanguagePack } from '../../../types/content';
import { alphabetItems } from './alphabet';
import { numberItems } from './numbers';
import { pronounItems, greetingPhrases } from './greetings';
import { grammarNotes } from './grammar';
import { units } from './units';
import { lessons } from './lessons';

export const mnkPack: LanguagePack = {
  languageCode: 'mnk',
  units,
  lessons,
  vocabItems: [...alphabetItems, ...numberItems, ...pronounItems],
  grammarNotes,
  phraseItems: greetingPhrases,
};
