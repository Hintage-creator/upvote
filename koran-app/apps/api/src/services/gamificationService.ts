import {
  addXp,
  evaluateNewBadges,
  recordActivity,
  XP_PER_GOOD_PRONUNCIATION,
  XP_PER_LESSON_COMPLETED,
  XP_PER_QUIZ_CORRECT,
  type Badge,
  type UserStats,
} from "@koran-app/shared";
import { BADGES } from "@koran-app/shared";
import { getBestPronunciationScore } from "../repositories/attempts";
import { countCompletedLessons } from "../repositories/lessonCompletions";
import { getOrCreateUserStats, saveUserStats } from "../repositories/userStats";

export interface GamificationResult {
  stats: UserStats;
  newlyEarnedBadges: Badge[];
}

function applyEvent(userId: string, xpDelta: number): GamificationResult {
  let stats = getOrCreateUserStats(userId);
  stats = recordActivity(stats);
  stats = addXp(stats, xpDelta);

  const newlyEarnedIds = evaluateNewBadges(stats, {
    lessonsCompletedTotal: countCompletedLessons(userId),
    bestPronunciationScore: getBestPronunciationScore(userId),
  });
  stats = { ...stats, earnedBadgeIds: [...stats.earnedBadgeIds, ...newlyEarnedIds] };

  saveUserStats(stats);

  const newlyEarnedBadges = BADGES.filter((b) => newlyEarnedIds.includes(b.id));
  return { stats, newlyEarnedBadges };
}

export function onLessonCompleted(userId: string): GamificationResult {
  return applyEvent(userId, XP_PER_LESSON_COMPLETED);
}

export function onQuizAnswered(userId: string, correct: boolean): GamificationResult {
  return applyEvent(userId, correct ? XP_PER_QUIZ_CORRECT : 0);
}

export function onPronunciationScored(userId: string, score: number): GamificationResult {
  return applyEvent(userId, score >= 85 ? XP_PER_GOOD_PRONUNCIATION : 0);
}
