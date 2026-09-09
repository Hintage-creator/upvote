import { describe, expect, it } from "vitest";
import {
  addXp,
  evaluateNewBadges,
  levelForXp,
  recordActivity,
  xpForLevel,
} from "./gamification";
import type { UserStats } from "./types";

const baseStats: UserStats = {
  userId: "u1",
  xp: 0,
  level: 1,
  currentStreakDays: 0,
  longestStreakDays: 0,
  lastActivityDate: null,
  earnedBadgeIds: [],
};

describe("levels", () => {
  it("level 1 requires reaching xpForLevel(1)", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(xpForLevel(1))).toBe(2);
  });

  it("addXp recomputes level", () => {
    const stats = addXp(baseStats, xpForLevel(1) + 1);
    expect(stats.level).toBe(2);
  });
});

describe("recordActivity (streaks)", () => {
  it("starts a streak at 1 on first activity", () => {
    const stats = recordActivity(baseStats, new Date("2026-01-01T10:00:00Z"));
    expect(stats.currentStreakDays).toBe(1);
    expect(stats.lastActivityDate).toBe("2026-01-01");
  });

  it("increments the streak on the very next day", () => {
    let stats = recordActivity(baseStats, new Date("2026-01-01T10:00:00Z"));
    stats = recordActivity(stats, new Date("2026-01-02T09:00:00Z"));
    expect(stats.currentStreakDays).toBe(2);
  });

  it("is a no-op if already recorded today", () => {
    let stats = recordActivity(baseStats, new Date("2026-01-01T10:00:00Z"));
    stats = recordActivity(stats, new Date("2026-01-01T22:00:00Z"));
    expect(stats.currentStreakDays).toBe(1);
  });

  it("resets the streak to 1 after a gap of more than one day", () => {
    let stats = recordActivity(baseStats, new Date("2026-01-01T10:00:00Z"));
    stats = recordActivity(stats, new Date("2026-01-05T10:00:00Z"));
    expect(stats.currentStreakDays).toBe(1);
    expect(stats.longestStreakDays).toBe(1);
  });
});

describe("evaluateNewBadges", () => {
  it("awards first-lesson only once", () => {
    const stats = { ...baseStats };
    const first = evaluateNewBadges(stats, { lessonsCompletedTotal: 1 });
    expect(first).toContain("first-lesson");

    const already = { ...stats, earnedBadgeIds: ["first-lesson"] };
    const second = evaluateNewBadges(already, { lessonsCompletedTotal: 2 });
    expect(second).not.toContain("first-lesson");
  });

  it("awards streak and pronunciation badges based on thresholds", () => {
    const stats = { ...baseStats, currentStreakDays: 7 };
    const badges = evaluateNewBadges(stats, { bestPronunciationScore: 97 });
    expect(badges).toContain("streak-7");
    expect(badges).toContain("pronunciation-pro");
    expect(badges).not.toContain("streak-30");
  });
});
