// Streaks, XP/levels and badges. Kept as pure functions over plain data so the
// same logic runs unchanged on the server (source of truth) and can be unit
// tested without a database or UI.
import type { Badge, UserStats } from "./types";

export const XP_PER_LESSON_COMPLETED = 20;
export const XP_PER_QUIZ_CORRECT = 5;
export const XP_PER_GOOD_PRONUNCIATION = 10; // awarded when score >= 85

/** XP required to reach a given level: grows so higher levels take longer. */
export function xpForLevel(level: number): number {
  return 50 * level * (level + 1); // level 1 -> 100, level 2 -> 300, level 3 -> 600, ...
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level)) level += 1;
  return level;
}

function toDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Rolls a streak forward by one day of activity. Call once per learning
 * session; calling it twice on the same day is a no-op for the streak count.
 */
export function recordActivity(
  stats: UserStats,
  now: Date = new Date()
): UserStats {
  const today = toDateOnly(now.toISOString());
  if (stats.lastActivityDate === today) {
    return stats; // already counted today
  }

  const yesterday = toDateOnly(
    new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  );

  const currentStreakDays =
    stats.lastActivityDate === yesterday ? stats.currentStreakDays + 1 : 1;

  return {
    ...stats,
    lastActivityDate: today,
    currentStreakDays,
    longestStreakDays: Math.max(stats.longestStreakDays, currentStreakDays),
  };
}

export function addXp(stats: UserStats, amount: number): UserStats {
  const xp = stats.xp + amount;
  return { ...stats, xp, level: levelForXp(xp) };
}

export const BADGES: Badge[] = [
  {
    id: "first-lesson",
    name: "Erste Schritte",
    description: "Erste Lektion abgeschlossen",
    icon: "seedling",
  },
  {
    id: "streak-7",
    name: "Eine Woche dran",
    description: "7 Tage in Folge gelernt",
    icon: "flame",
  },
  {
    id: "streak-30",
    name: "Ein Monat dran",
    description: "30 Tage in Folge gelernt",
    icon: "fire",
  },
  {
    id: "pronunciation-pro",
    name: "Klare Aussprache",
    description: "Aussprache-Bewertung von 95+ erreicht",
    icon: "microphone",
  },
  {
    id: "level-5",
    name: "Aufsteiger",
    description: "Level 5 erreicht",
    icon: "star",
  },
];

/** Given fresh stats and any new events this session, returns badge ids newly earned (not previously in earnedBadgeIds). */
export function evaluateNewBadges(
  stats: UserStats,
  events: { lessonsCompletedTotal?: number; bestPronunciationScore?: number }
): string[] {
  const earned = new Set(stats.earnedBadgeIds);
  const newly: string[] = [];

  const maybeAward = (id: string, condition: boolean) => {
    if (condition && !earned.has(id)) {
      newly.push(id);
    }
  };

  maybeAward("first-lesson", (events.lessonsCompletedTotal ?? 0) >= 1);
  maybeAward("streak-7", stats.currentStreakDays >= 7);
  maybeAward("streak-30", stats.currentStreakDays >= 30);
  maybeAward(
    "pronunciation-pro",
    (events.bestPronunciationScore ?? 0) >= 95
  );
  maybeAward("level-5", stats.level >= 5);

  return newly;
}
