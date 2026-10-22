/**
 * Core content model.
 *
 * Designed to hold more than one Manding variety (Malinke/Maninka, Bambara,
 * Dyula, ...) side by side. Every content item is tagged with a
 * `LanguageCode` instead of assuming a single hardcoded language, so a new
 * variety is added by creating a new `src/data/languages/<code>/` folder and
 * registering it in `src/data/languages/index.ts` — no type or screen changes
 * required.
 */

/** ISO-ish codes for the Manding varieties this app is scoped to support. */
export type LanguageCode = 'mnk' | 'bm' | 'dyu';

export const LANGUAGES: Record<LanguageCode, { nameDe: string; nameEn: string; nameEndonym: string }> = {
  mnk: { nameDe: 'Malinke (Maninka, Guinea)', nameEn: 'Malinke (Maninka, Guinea)', nameEndonym: 'Maninkakan' },
  bm: { nameDe: 'Bambara', nameEn: 'Bambara', nameEndonym: 'Bamanankan' },
  dyu: { nameDe: 'Dyula', nameEn: 'Dyula', nameEndonym: 'Julakan' },
};

/**
 * Every piece of learner-facing text that exists in more than one writing
 * system is represented as a Script pair rather than a plain string, so the
 * UI can never accidentally show only one system.
 */
export interface ScriptText {
  /** Latin phonetic transliteration, e.g. "i ni sɔgɔma". */
  latin: string;
  /** N'Ko script (Unicode block U+07C0–U+07FF), written right-to-left. */
  nko: string;
}

/**
 * Review status of a content item. Placeholder content ships with
 * `needsReview: true` and must be checked by a native speaker / linguist
 * for the target variety before it is treated as authoritative. See
 * mobile/src/data/languages/mnk/README.md.
 */
export interface ContentStatus {
  needsReview: boolean;
  /** Free-text note, e.g. who reviewed it and when, or why it's a placeholder. */
  note?: string;
}

/** A single translation target. Extend this union to add more UI languages. */
export type UiLanguage = 'de' | 'en';

export type Translations = Record<UiLanguage, string>;

/**
 * Optional audio reference for a content item. The field exists from day
 * one so the data shape never has to change when native-speaker recordings
 * become available — only this field gets populated and the audio player
 * UI gets switched on.
 */
export interface AudioRef {
  /** Local asset module id or remote URL; resolved by the audio player. */
  source: string;
  /** Speaker identity/dialect note, e.g. "native speaker, Kankan region". */
  speaker?: string;
  durationMs?: number;
}

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'particle'
  | 'number'
  | 'phrase'
  | 'letter';

export interface VocabItem {
  id: string;
  languageCode: LanguageCode;
  script: ScriptText;
  translations: Translations;
  partOfSpeech: PartOfSpeech;
  /** IPA or informal pronunciation hint, independent of the transliteration. */
  pronunciationHint?: string;
  audio?: AudioRef;
  status: ContentStatus;
  /** Free-form tags for filtering/search, e.g. ["greeting", "family"]. */
  tags?: string[];
}

export interface GrammarNote {
  id: string;
  languageCode: LanguageCode;
  titleDe: string;
  titleEn: string;
  explanationDe: string;
  explanationEn: string;
  examples: Array<{ script: ScriptText; translations: Translations; audio?: AudioRef }>;
  status: ContentStatus;
}

export interface PhraseItem {
  id: string;
  languageCode: LanguageCode;
  script: ScriptText;
  translations: Translations;
  /** e.g. "greetings", "market", "family", "emergencies" */
  category: string;
  audio?: AudioRef;
  status: ContentStatus;
  literalTranslation?: Translations;
}

export type LessonSectionType = 'alphabet' | 'vocab' | 'grammar' | 'phrases';

export interface LessonSection {
  type: LessonSectionType;
  /** IDs into the corresponding content collection (vocabItems, grammarNotes, phraseItems). */
  itemIds: string[];
}

/**
 * A Lesson is the atomic teaching unit. Lessons are grouped into Units and
 * ordered by `order`, giving the linear, difficulty-ascending course
 * structure (alphabet -> basic vocab -> grammar -> phrases -> ...).
 */
export interface Lesson {
  id: string;
  languageCode: LanguageCode;
  unitId: string;
  order: number;
  titleDe: string;
  titleEn: string;
  descriptionDe?: string;
  descriptionEn?: string;
  sections: LessonSection[];
  /** Difficulty tier, ascending; used for course-wide progression display. */
  level: number;
}

export interface Unit {
  id: string;
  languageCode: LanguageCode;
  order: number;
  titleDe: string;
  titleEn: string;
}

export type QuizQuestionType = 'multiple-choice' | 'translation';

export interface MultipleChoiceQuestion {
  type: 'multiple-choice';
  id: string;
  languageCode: LanguageCode;
  /** The item being tested (a VocabItem or PhraseItem id). */
  promptItemId: string;
  prompt: ScriptText;
  /** Direction of the question, so both "recognize" and "recall" are drillable. */
  direction: 'target-to-de' | 'de-to-target';
  choices: string[];
  correctChoiceIndex: number;
}

export interface TranslationQuestion {
  type: 'translation';
  id: string;
  languageCode: LanguageCode;
  promptItemId: string;
  prompt: ScriptText;
  direction: 'target-to-de' | 'de-to-target';
  /** Accepted answers (normalized, lowercase) — supports minor spelling variants. */
  acceptedAnswers: string[];
}

export type QuizQuestion = MultipleChoiceQuestion | TranslationQuestion;

export interface LessonContentBundle {
  vocabItems: VocabItem[];
  grammarNotes: GrammarNote[];
  phraseItems: PhraseItem[];
}

/** Everything needed to render one language's course + phrasebook. */
export interface LanguagePack {
  languageCode: LanguageCode;
  units: Unit[];
  lessons: Lesson[];
  vocabItems: VocabItem[];
  grammarNotes: GrammarNote[];
  phraseItems: PhraseItem[];
}
