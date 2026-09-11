import { VocabItem } from '../src/types/content';
import {
  buildMultipleChoiceQuestion,
  buildQuiz,
  buildTranslationQuestion,
  checkTranslationAnswer,
} from '../src/features/quiz/quizGenerator';

function makeVocab(id: string, latin: string, de: string): VocabItem {
  return {
    id,
    languageCode: 'mnk',
    script: { latin, nko: latin },
    translations: { de, en: de },
    partOfSpeech: 'number',
    status: { needsReview: true },
  };
}

// Deterministic RNG (simple LCG) so shuffles are reproducible in tests.
function seededRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const pool: VocabItem[] = [
  makeVocab('v1', 'kelen', 'eins'),
  makeVocab('v2', 'fila', 'zwei'),
  makeVocab('v3', 'saba', 'drei'),
  makeVocab('v4', 'naani', 'vier'),
];

describe('buildMultipleChoiceQuestion', () => {
  it('includes the correct answer exactly once among the choices', () => {
    const q = buildMultipleChoiceQuestion(pool[0], pool, 'mnk', 'de', seededRng(1));
    expect(q).not.toBeNull();
    expect(q!.choices.filter((c) => c === 'eins')).toHaveLength(1);
    expect(q!.choices[q!.correctChoiceIndex]).toBe('eins');
  });

  it('never puts the target item itself among the distractors', () => {
    const q = buildMultipleChoiceQuestion(pool[0], pool, 'mnk', 'de', seededRng(7));
    expect(q!.choices).not.toContain('kelen');
  });

  it('returns null when the pool is too small to build fair distractors', () => {
    const smallPool = [pool[0], pool[1]];
    const q = buildMultipleChoiceQuestion(pool[0], smallPool, 'mnk', 'de', seededRng(3));
    expect(q).toBeNull();
  });
});

describe('translation questions', () => {
  it('accepts the correct answer case-insensitively and trimmed', () => {
    const q = buildTranslationQuestion(pool[1], 'mnk', 'de');
    expect(checkTranslationAnswer(q, 'Zwei')).toBe(true);
    expect(checkTranslationAnswer(q, '  zwei  ')).toBe(true);
    expect(checkTranslationAnswer(q, 'drei')).toBe(false);
  });
});

describe('buildQuiz', () => {
  it('produces one question per item and covers every item id', () => {
    const questions = buildQuiz(pool, pool, 'mnk', 'de', seededRng(42));
    expect(questions).toHaveLength(pool.length);
    const promptIds = questions.map((q) => q.promptItemId).sort();
    expect(promptIds).toEqual(pool.map((p) => p.id).sort());
  });
});
