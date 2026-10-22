import { GrammarNote, LanguagePack, Lesson, PhraseItem, Unit, VocabItem } from '../types/content';

/** Small lookup helpers over a LanguagePack — kept generic so they work for any registered language. */
export function unitsSorted(pack: LanguagePack): Unit[] {
  return [...pack.units].sort((a, b) => a.order - b.order);
}

export function lessonsForUnit(pack: LanguagePack, unitId: string): Lesson[] {
  return pack.lessons.filter((l) => l.unitId === unitId).sort((a, b) => a.order - b.order);
}

export function lessonById(pack: LanguagePack, lessonId: string): Lesson | undefined {
  return pack.lessons.find((l) => l.id === lessonId);
}

export function vocabByIds(pack: LanguagePack, ids: string[]): VocabItem[] {
  const byId = new Map(pack.vocabItems.map((v) => [v.id, v]));
  return ids.map((id) => byId.get(id)).filter((v): v is VocabItem => v !== undefined);
}

export function grammarByIds(pack: LanguagePack, ids: string[]): GrammarNote[] {
  const byId = new Map(pack.grammarNotes.map((g) => [g.id, g]));
  return ids.map((id) => byId.get(id)).filter((g): g is GrammarNote => g !== undefined);
}

export function phrasesByIds(pack: LanguagePack, ids: string[]): PhraseItem[] {
  const byId = new Map(pack.phraseItems.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is PhraseItem => p !== undefined);
}

/** All vocab + phrase item ids a lesson quizzes on, in section order. */
export function lessonItemIds(lesson: Lesson): string[] {
  const vocabIds = lesson.sections.filter((s) => s.type === 'vocab' || s.type === 'alphabet').flatMap((s) => s.itemIds);
  const phraseIds = lesson.sections.filter((s) => s.type === 'phrases').flatMap((s) => s.itemIds);
  return [...vocabIds, ...phraseIds];
}

export function phrasesByCategory(pack: LanguagePack): Map<string, PhraseItem[]> {
  const map = new Map<string, PhraseItem[]>();
  for (const phrase of pack.phraseItems) {
    const list = map.get(phrase.category) ?? [];
    list.push(phrase);
    map.set(phrase.category, list);
  }
  return map;
}
