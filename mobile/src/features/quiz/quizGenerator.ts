import {
  LanguageCode,
  MultipleChoiceQuestion,
  PhraseItem,
  QuizQuestion,
  TranslationQuestion,
  UiLanguage,
  VocabItem,
} from '../../types/content';

type Quizzable = VocabItem | PhraseItem;

/** Deterministic, injectable RNG so quiz generation is unit-testable. Defaults to Math.random. */
export type Rng = () => number;

function shuffle<T>(items: T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickDistractors(correctId: string, pool: Quizzable[], count: number, rng: Rng): string[] {
  const candidates = pool.filter((item) => item.id !== correctId);
  return shuffle(candidates, rng)
    .slice(0, count)
    .map((item) => item.translations.de);
}

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function buildMultipleChoiceQuestion(
  target: Quizzable,
  pool: Quizzable[],
  languageCode: LanguageCode,
  uiLanguage: UiLanguage = 'de',
  rng: Rng = Math.random
): MultipleChoiceQuestion | null {
  const distractors = pickDistractors(target.id, pool, 3, rng);
  if (distractors.length < 2) return null; // not enough pool to build a fair question

  const correctAnswer = target.translations[uiLanguage];
  const choices = shuffle([correctAnswer, ...distractors], rng);
  const correctChoiceIndex = choices.indexOf(correctAnswer);

  return {
    type: 'multiple-choice',
    id: nextId('mc'),
    languageCode,
    promptItemId: target.id,
    prompt: target.script,
    direction: 'target-to-de',
    choices,
    correctChoiceIndex,
  };
}

function normalize(answer: string): string {
  return answer.trim().toLowerCase();
}

export function buildTranslationQuestion(
  target: Quizzable,
  languageCode: LanguageCode,
  uiLanguage: UiLanguage = 'de'
): TranslationQuestion {
  return {
    type: 'translation',
    id: nextId('tr'),
    languageCode,
    promptItemId: target.id,
    prompt: target.script,
    direction: 'target-to-de',
    acceptedAnswers: [normalize(target.translations[uiLanguage])],
  };
}

export function checkTranslationAnswer(question: TranslationQuestion, userAnswer: string): boolean {
  return question.acceptedAnswers.includes(normalize(userAnswer));
}

/**
 * Builds a mixed quiz (multiple-choice + translation) from a set of vocab
 * and/or phrase items, using the wider pool for multiple-choice distractors.
 */
export function buildQuiz(
  items: Quizzable[],
  pool: Quizzable[],
  languageCode: LanguageCode,
  uiLanguage: UiLanguage = 'de',
  rng: Rng = Math.random
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  items.forEach((item, index) => {
    if (index % 2 === 0) {
      const mc = buildMultipleChoiceQuestion(item, pool, languageCode, uiLanguage, rng);
      questions.push(mc ?? buildTranslationQuestion(item, languageCode, uiLanguage));
    } else {
      questions.push(buildTranslationQuestion(item, languageCode, uiLanguage));
    }
  });
  return shuffle(questions, rng);
}
