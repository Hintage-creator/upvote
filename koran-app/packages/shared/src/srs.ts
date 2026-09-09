// Spaced repetition scheduling using SM-2 (SuperMemo-2), the same core algorithm
// behind Anki. It decides how many days to wait before a learner should see a
// given verse or vocabulary item again, based on how well they just recalled it.
import type { ItemType, ReviewCard, ReviewQuality } from "./types";

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

export function newReviewCard(
  userId: string,
  itemType: ItemType,
  itemId: string,
  now: Date = new Date()
): ReviewCard {
  return {
    userId,
    itemType,
    itemId,
    easeFactor: DEFAULT_EASE_FACTOR,
    intervalDays: 0,
    repetitions: 0,
    dueAt: now.toISOString(),
    lastReviewedAt: null,
  };
}

/**
 * Applies one SM-2 review step and returns the updated card.
 * quality 0-2 = forgot / wrong -> restart the interval from scratch.
 * quality 3-5 = recalled, with 5 being effortless -> interval grows.
 */
export function reviewCard(
  card: ReviewCard,
  quality: ReviewQuality,
  now: Date = new Date()
): ReviewCard {
  let { easeFactor, intervalDays, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

  const dueAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    ...card,
    easeFactor: Math.round(easeFactor * 100) / 100,
    intervalDays,
    repetitions,
    dueAt: dueAt.toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

export function isDue(card: ReviewCard, now: Date = new Date()): boolean {
  return new Date(card.dueAt).getTime() <= now.getTime();
}

/**
 * Maps a 0-100 performance score (pronunciation score or quiz correctness)
 * onto SM-2's 0-5 recall-quality scale, so both feed the same scheduler.
 */
export function scoreToQuality(score: number): ReviewQuality {
  if (score >= 95) return 5;
  if (score >= 85) return 4;
  if (score >= 70) return 3;
  if (score >= 50) return 2;
  if (score >= 25) return 1;
  return 0;
}
