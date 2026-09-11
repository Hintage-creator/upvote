import { LanguagePack, Lesson } from '../../types/content';

/**
 * "Dungeon" framing over the generic course structure: Kungbäkola the cat
 * is sealed inside a pyramid and must solve one room's riddle (= lesson)
 * before the next opens, growing visibly sootier the deeper she goes. This
 * module is pure narrative/UI logic layered on top of Unit/Lesson — it does
 * not touch the language content model, so it applies the same way to any
 * registered LanguagePack (mnk today, bm/dyu later).
 */

export const SOOT_STAGE_COUNT = 5; // 0 = sauber ... 4 = pechschwarz

/** Global, linear room order — a dungeon has one path, not parallel tracks. */
export function orderedLessons(pack: LanguagePack): Lesson[] {
  return [...pack.lessons].sort((a, b) => a.order - b.order);
}

/**
 * A room is unlocked if it's the first room, or the room immediately
 * before it (in global order) has been completed. This intentionally
 * ignores unit boundaries — the pyramid doesn't care where one "Kammer"
 * ends and the next begins.
 */
export function isLessonUnlocked(pack: LanguagePack, lessonId: string, completedLessonIds: string[]): boolean {
  const ordered = orderedLessons(pack);
  const index = ordered.findIndex((l) => l.id === lessonId);
  if (index <= 0) return true;
  const previous = ordered[index - 1];
  return completedLessonIds.includes(previous.id);
}

/**
 * Soot stage (0-4) from how far into the dungeon the player has progressed,
 * measured as completed rooms / total rooms. Deliberately independent of
 * XP/streak — those reward consistency, this reflects narrative depth.
 */
export function computeSootStage(completedLessonIds: string[], totalLessons: number): number {
  if (totalLessons <= 0) return 0;
  const ratio = Math.min(1, completedLessonIds.length / totalLessons);
  return Math.min(SOOT_STAGE_COUNT - 1, Math.floor(ratio * SOOT_STAGE_COUNT));
}

export const SOOT_STAGE_LABELS_DE = ['Sauber', 'Staubig', 'Aschfahl', 'Rußbedeckt', 'Pechschwarz'];

/** A cat paw has 5 pads (4 toes + 1 main pad) — one "paw" on the path covers this many rooms. */
export const PAW_GROUP_SIZE = 5;

/**
 * Chunks the global room order into groups of `PAW_GROUP_SIZE` — each group
 * is shown as a single paw on the course path, with one pad/toe blackening
 * per room completed inside it. The last group may be smaller than 5 if the
 * total room count isn't a multiple of it.
 */
export function pawGroups(pack: LanguagePack): Lesson[][] {
  const lessons = orderedLessons(pack);
  const groups: Lesson[][] = [];
  for (let i = 0; i < lessons.length; i += PAW_GROUP_SIZE) {
    groups.push(lessons.slice(i, i + PAW_GROUP_SIZE));
  }
  return groups;
}
