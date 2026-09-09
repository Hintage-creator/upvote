import { InMemoryKeyValueStore } from '../src/services/keyValueStore';
import { ProgressRepository } from '../src/features/progress/progressRepository';
import { initReviewState, gradeReview } from '../src/features/progress/srs';

describe('ProgressRepository', () => {
  it('round-trips review states', async () => {
    const repo = new ProgressRepository(new InMemoryKeyValueStore());
    const state = initReviewState('mnk-number-1', new Date('2026-01-01'));
    await repo.saveReviewState(state);

    const loaded = await repo.getReviewState('mnk-number-1');
    expect(loaded).toEqual(state);
    expect(await repo.getReviewState('does-not-exist')).toBeNull();
  });

  it('finds only due items among several saved states', async () => {
    const repo = new ProgressRepository(new InMemoryKeyValueStore());
    const now = new Date('2026-01-09T12:00:00.000Z');

    const due = initReviewState('due-item', new Date('2026-01-01'));
    const notDue = gradeReview(initReviewState('future-item', new Date('2026-01-09')), 5, new Date('2026-01-09'));

    await repo.saveReviewState(due);
    await repo.saveReviewState(notDue);

    const dueStates = await repo.getDueReviewStates(now);
    expect(dueStates.map((s) => s.itemId)).toEqual(['due-item']);
  });

  it('defaults user progress when nothing is stored yet', async () => {
    const repo = new ProgressRepository(new InMemoryKeyValueStore());
    const progress = await repo.getUserProgress();
    expect(progress).toEqual({ xp: 0, currentStreak: 0, longestStreak: 0, lastActivityDate: null });
  });

  it('tracks completed lessons without duplicates', async () => {
    const repo = new ProgressRepository(new InMemoryKeyValueStore());
    await repo.markLessonCompleted('mnk-l1');
    await repo.markLessonCompleted('mnk-l1');
    await repo.markLessonCompleted('mnk-l2');
    expect(await repo.getCompletedLessonIds()).toEqual(['mnk-l1', 'mnk-l2']);
  });
});
