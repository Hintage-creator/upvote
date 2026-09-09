import {
  initReviewState,
  gradeReview,
  isDue,
  initUserProgress,
  recordActivity,
  addXp,
  xpForLevel,
  computeLevel,
  xpToNextLevel,
} from '../src/features/progress/srs';

describe('SM-2 review scheduling', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('starts due immediately', () => {
    const state = initReviewState('v1', now);
    expect(isDue(state, now)).toBe(true);
    expect(state.repetitions).toBe(0);
  });

  it('schedules 1 day, then 6 days, then grows by ease factor on consecutive good grades', () => {
    let state = initReviewState('v1', now);

    state = gradeReview(state, 4, now);
    expect(state.repetitions).toBe(1);
    expect(state.intervalDays).toBe(1);

    const afterFirst = new Date(state.dueAt);
    state = gradeReview(state, 4, afterFirst);
    expect(state.repetitions).toBe(2);
    expect(state.intervalDays).toBe(6);

    const afterSecond = new Date(state.dueAt);
    state = gradeReview(state, 4, afterSecond);
    expect(state.repetitions).toBe(3);
    expect(state.intervalDays).toBe(Math.round(6 * state.easeFactor));
  });

  it('resets repetitions and interval on a failing grade', () => {
    let state = initReviewState('v1', now);
    state = gradeReview(state, 5, now);
    state = gradeReview(state, 5, new Date(state.dueAt));
    expect(state.repetitions).toBe(2);

    state = gradeReview(state, 1, new Date(state.dueAt));
    expect(state.repetitions).toBe(0);
    expect(state.intervalDays).toBe(1);
  });

  it('never lets the ease factor drop below 1.3', () => {
    let state = initReviewState('v1', now);
    for (let i = 0; i < 20; i++) {
      state = gradeReview(state, 0, new Date(state.dueAt));
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('is not due before its scheduled date', () => {
    let state = initReviewState('v1', now);
    state = gradeReview(state, 4, now);
    const dayBefore = new Date(new Date(state.dueAt).getTime() - 1000);
    expect(isDue(state, dayBefore)).toBe(false);
  });
});

describe('streaks', () => {
  it('starts a streak at 1 on first activity', () => {
    const progress = recordActivity(initUserProgress(), new Date('2026-01-01T09:00:00.000Z'));
    expect(progress.currentStreak).toBe(1);
    expect(progress.longestStreak).toBe(1);
  });

  it('does not double-count activity on the same day', () => {
    let progress = recordActivity(initUserProgress(), new Date('2026-01-01T09:00:00.000Z'));
    progress = recordActivity(progress, new Date('2026-01-01T20:00:00.000Z'));
    expect(progress.currentStreak).toBe(1);
  });

  it('increments the streak on the following day', () => {
    let progress = recordActivity(initUserProgress(), new Date('2026-01-01T09:00:00.000Z'));
    progress = recordActivity(progress, new Date('2026-01-02T09:00:00.000Z'));
    expect(progress.currentStreak).toBe(2);
    expect(progress.longestStreak).toBe(2);
  });

  it('resets the streak after a missed day', () => {
    let progress = recordActivity(initUserProgress(), new Date('2026-01-01T09:00:00.000Z'));
    progress = recordActivity(progress, new Date('2026-01-02T09:00:00.000Z'));
    progress = recordActivity(progress, new Date('2026-01-04T09:00:00.000Z'));
    expect(progress.currentStreak).toBe(1);
    expect(progress.longestStreak).toBe(2);
  });
});

describe('XP and levels', () => {
  it('starts at level 1 with 0 xp', () => {
    expect(computeLevel(0)).toBe(1);
    expect(xpForLevel(1)).toBe(0);
  });

  it('levels up as xp crosses thresholds', () => {
    const level2Xp = xpForLevel(2);
    expect(computeLevel(level2Xp - 1)).toBe(1);
    expect(computeLevel(level2Xp)).toBe(2);
  });

  it('addXp accumulates and never goes negative', () => {
    let progress = addXp(initUserProgress(), 30);
    progress = addXp(progress, -1000);
    expect(progress.xp).toBe(0);
  });

  it('xpToNextLevel reports progress within the current level', () => {
    const { currentLevel, xpIntoLevel, xpNeededForNext } = xpToNextLevel(xpForLevel(3) + 10);
    expect(currentLevel).toBe(3);
    expect(xpIntoLevel).toBe(10);
    expect(xpNeededForNext).toBe(xpForLevel(4) - xpForLevel(3));
  });
});
