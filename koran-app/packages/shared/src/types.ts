// Domain types shared between the API and the mobile app.
// Keeping these in one package prevents the two ends of the wire from drifting apart.

export type ItemType = "verse" | "vocab";

export type Language = "ar" | "de" | "en";

/** A single Quran verse (ayah), always carrying Arabic + transliteration + two translations. */
export interface Verse {
  id: string;
  surahNumber: number;
  surahNameArabic: string;
  surahNameLatin: string;
  ayahNumber: number;
  arabicText: string;
  transliteration: string;
  translationDe: string;
  translationEn: string;
  /** 1 (easiest) .. 5 (hardest), drives lesson ordering. */
  difficulty: number;
  /**
   * URL of a reference recitation by a native speaker for this verse.
   * Left as a pointer rather than bundled audio: Quran recitation audio is
   * copyrighted/attributed content (e.g. quran.com, everyayah.com APIs) and
   * must be sourced with the right license, not fabricated here.
   */
  referenceAudioUrl: string | null;
}

/** A Modern Standard / Classical Arabic vocabulary item. */
export interface VocabItem {
  id: string;
  arabicWord: string;
  transliteration: string;
  translationDe: string;
  translationEn: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "particle" | "phrase";
  difficulty: number;
  referenceAudioUrl: string | null;
}

export type LessonItemRef =
  | { type: "verse"; id: string }
  | { type: "vocab"; id: string };

export interface Lesson {
  id: string;
  title: string;
  description: string;
  /** Lower comes first when a learner progresses through the course. */
  order: number;
  difficulty: number;
  items: LessonItemRef[];
}

export type QuizQuestionType = "multiple_choice" | "fill_blank";

export interface QuizQuestion {
  id: string;
  lessonId: string;
  verseId: string;
  type: QuizQuestionType;
  /** Shown to the learner, e.g. "Was bedeutet dieser Vers?" or "Wie geht dieser Vers weiter?" */
  prompt: string;
  /** For multiple_choice: 4 options, one correct. For fill_blank: candidate continuations. */
  options: string[];
  correctAnswer: string;
}

/** SM-2 spaced-repetition card state for one learner + one learnable item. */
export interface ReviewCard {
  userId: string;
  itemType: ItemType;
  itemId: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueAt: string; // ISO date
  lastReviewedAt: string | null;
}

/** 0-5 recall quality used by the SM-2 algorithm, SuperMemo's original scale. */
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface PronunciationScore {
  /** 0-100, higher is better. */
  score: number;
  /** Human-readable feedback, e.g. which part to work on. */
  feedback: string;
  /** Name of the scoring engine that produced this, for transparency in the UI. */
  engine: "mock-heuristic" | "azure-speech" | "whisper";
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserStats {
  userId: string;
  xp: number;
  level: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityDate: string | null; // ISO date, no time
  earnedBadgeIds: string[];
}
