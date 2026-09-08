import type { UserStats } from "@koran-app/shared";
import { db } from "../db";

interface UserStatsRow {
  user_id: string;
  xp: number;
  level: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_date: string | null;
  earned_badge_ids: string;
}

function rowToStats(row: UserStatsRow): UserStats {
  return {
    userId: row.user_id,
    xp: row.xp,
    level: row.level,
    currentStreakDays: row.current_streak_days,
    longestStreakDays: row.longest_streak_days,
    lastActivityDate: row.last_activity_date,
    earnedBadgeIds: JSON.parse(row.earned_badge_ids),
  };
}

export function getOrCreateUserStats(userId: string): UserStats {
  const existing = db
    .prepare<[string], UserStatsRow>("SELECT * FROM user_stats WHERE user_id = ?")
    .get(userId);
  if (existing) return rowToStats(existing);

  db.prepare(
    "INSERT INTO user_stats (user_id, xp, level, current_streak_days, longest_streak_days, last_activity_date, earned_badge_ids) VALUES (?, 0, 1, 0, 0, NULL, '[]')"
  ).run(userId);

  return {
    userId,
    xp: 0,
    level: 1,
    currentStreakDays: 0,
    longestStreakDays: 0,
    lastActivityDate: null,
    earnedBadgeIds: [],
  };
}

export function saveUserStats(stats: UserStats): void {
  db.prepare(
    `UPDATE user_stats
     SET xp = ?, level = ?, current_streak_days = ?, longest_streak_days = ?,
         last_activity_date = ?, earned_badge_ids = ?
     WHERE user_id = ?`
  ).run(
    stats.xp,
    stats.level,
    stats.currentStreakDays,
    stats.longestStreakDays,
    stats.lastActivityDate,
    JSON.stringify(stats.earnedBadgeIds),
    stats.userId
  );
}
