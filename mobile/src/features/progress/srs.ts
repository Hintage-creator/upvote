/**
 * Spaced repetition (SM-2) and streak/level logic. Pure functions only —
 * no I/O, no React — so they're trivially unit-testable and swappable.
 */

/** SM-2 quality grades, 0 (total blackout) to 5 (perfect recall). */
export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReviewState {
  itemId: string;
  /** SM-2 ease factor, minimum 1.3. */
  easeFactor: number;
  /** Current interval in days between reviews. */
  intervalDays: number;
  /** Consecutive successful (grade >= 3) repetitions. */
  repetitions: number;
  /** ISO 8601 timestamp of when this item is next due. */
  dueAt: string;
  /** ISO 8601 timestamp of the last review, or null if never reviewed. */
  lastReviewedAt: string | null;
}

const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.5;

export function initReviewState(itemId: string, now: Date = new Date()): ReviewState {
  return {
    itemId,
    easeFactor: INITIAL_EASE_FACTOR,
    intervalDays: 0,
    repetitions: 0,
    dueAt: now.toISOString(),
    lastReviewedAt: null,
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Applies the SM-2 algorithm (Piotr Wozniak) for one review.
 * grade < 3 resets repetitions and schedules a review tomorrow;
 * grade >= 3 grows the interval and (if repetitions warrant it) the ease
 * factor.
 */
export function gradeReview(state: ReviewState, grade: ReviewGrade, now: Date = new Date()): ReviewState {
  let { easeFactor, intervalDays, repetitions } = state;

  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;

  if (grade < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
  }

  return {
    itemId: state.itemId,
    easeFactor,
    intervalDays,
    repetitions,
    dueAt: addDays(now, intervalDays).toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

export function isDue(state: ReviewState, now: Date = new Date()): boolean {
  return new Date(state.dueAt).getTime() <= now.getTime();
}

// ---------------------------------------------------------------------
// Streaks, XP and levels
// ---------------------------------------------------------------------

export interface UserProgress {
  xp: number;
  currentStreak: number;
  longestStreak: number;
  /** YYYY-MM-DD (local calendar day) of the last day with recorded activity. */
  lastActivityDate: string | null;
}

export function initUserProgress(): UserProgress {
  return { xp: 0, currentStreak: 0, longestStreak: 0, lastActivityDate: null };
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00.000Z`).getTime();
  const to = new Date(`${toKey}T00:00:00.000Z`).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

/**
 * Records that the user did something today, updating the streak.
 * - Same day again: streak unchanged.
 * - Exactly one day after the last activity: streak +1.
 * - A gap of more than one day: streak resets to 1.
 */
export function recordActivity(progress: UserProgress, now: Date = new Date()): UserProgress {
  const todayKey = toDateKey(now);
  if (progress.lastActivityDate === todayKey) {
    return progress;
  }
  const gap = progress.lastActivityDate ? daysBetween(progress.lastActivityDate, todayKey) : null;
  const currentStreak = gap === 1 ? progress.currentStreak + 1 : 1;
  return {
    ...progress,
    currentStreak,
    longestStreak: Math.max(progress.longestStreak, currentStreak),
    lastActivityDate: todayKey,
  };
}

export function addXp(progress: UserProgress, amount: number): UserProgress {
  return { ...progress, xp: Math.max(0, progress.xp + amount) };
}

/** Total cumulative XP required to *reach* `level` (level 1 = 0 XP). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * (level - 1) * level;
}

export function computeLevel(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level += 1;
  }
  return level;
}

export function xpToNextLevel(xp: number): { currentLevel: number; xpIntoLevel: number; xpNeededForNext: number } {
  const currentLevel = computeLevel(xp);
  const floor = xpForLevel(currentLevel);
  const ceiling = xpForLevel(currentLevel + 1);
  return { currentLevel, xpIntoLevel: xp - floor, xpNeededForNext: ceiling - floor };
}
