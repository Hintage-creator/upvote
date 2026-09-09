import { LanguagePack } from '../src/types/content';
import { computeSootStage, isLessonUnlocked, orderedLessons, SOOT_STAGE_COUNT } from '../src/features/dungeon/dungeon';

function makePack(lessonOrders: number[]): LanguagePack {
  return {
    languageCode: 'mnk',
    units: [],
    lessons: lessonOrders.map((order) => ({
      id: `l${order}`,
      languageCode: 'mnk',
      unitId: 'u1',
      order,
      level: 1,
      titleDe: `Raum ${order}`,
      titleEn: `Room ${order}`,
      sections: [],
    })),
    vocabItems: [],
    grammarNotes: [],
    phraseItems: [],
  };
}

describe('orderedLessons', () => {
  it('sorts lessons globally by order, independent of unit', () => {
    const pack = makePack([3, 1, 2]);
    expect(orderedLessons(pack).map((l) => l.id)).toEqual(['l1', 'l2', 'l3']);
  });
});

describe('isLessonUnlocked', () => {
  const pack = makePack([1, 2, 3]);

  it('always unlocks the first room', () => {
    expect(isLessonUnlocked(pack, 'l1', [])).toBe(true);
  });

  it('keeps later rooms locked until the previous one is completed', () => {
    expect(isLessonUnlocked(pack, 'l2', [])).toBe(false);
    expect(isLessonUnlocked(pack, 'l3', ['l1'])).toBe(false);
  });

  it('unlocks a room once its predecessor is completed', () => {
    expect(isLessonUnlocked(pack, 'l2', ['l1'])).toBe(true);
    expect(isLessonUnlocked(pack, 'l3', ['l1', 'l2'])).toBe(true);
  });
});

describe('computeSootStage', () => {
  it('is stage 0 with no progress', () => {
    expect(computeSootStage([], 10)).toBe(0);
  });

  it('reaches the final stage once every room is completed', () => {
    const all = Array.from({ length: 10 }, (_, i) => `l${i}`);
    expect(computeSootStage(all, 10)).toBe(SOOT_STAGE_COUNT - 1);
  });

  it('increases monotonically with completed room count', () => {
    const total = 10;
    let previous = -1;
    for (let n = 0; n <= total; n++) {
      const completed = Array.from({ length: n }, (_, i) => `l${i}`);
      const stage = computeSootStage(completed, total);
      expect(stage).toBeGreaterThanOrEqual(previous);
      previous = stage;
    }
  });

  it('never exceeds the max stage even with more completions than lessons', () => {
    expect(computeSootStage(['a', 'b', 'c'], 1)).toBe(SOOT_STAGE_COUNT - 1);
  });

  it('is stage 0 when there are no lessons at all', () => {
    expect(computeSootStage([], 0)).toBe(0);
  });
});
