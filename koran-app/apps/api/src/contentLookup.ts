import { LESSONS, VERSES, VOCAB, type ItemType, type Verse, type VocabItem } from "@koran-app/shared";

const versesById = new Map(VERSES.map((v) => [v.id, v]));
const vocabById = new Map(VOCAB.map((v) => [v.id, v]));
const lessonsById = new Map(LESSONS.map((l) => [l.id, l]));

export function findVerse(id: string): Verse | undefined {
  return versesById.get(id);
}

export function findVocab(id: string): VocabItem | undefined {
  return vocabById.get(id);
}

export function findLesson(id: string) {
  return lessonsById.get(id);
}

export function findItem(itemType: ItemType, id: string): Verse | VocabItem | undefined {
  return itemType === "verse" ? findVerse(id) : findVocab(id);
}

/** Verse and VocabItem name their Arabic text field differently; this normalizes both for scoring. */
export function arabicTextOf(item: Verse | VocabItem): string {
  return "arabicText" in item ? item.arabicText : item.arabicWord;
}

export function resolvedLessonItems(lessonId: string): Array<Verse | VocabItem> {
  const lesson = findLesson(lessonId);
  if (!lesson) return [];
  return lesson.items
    .map((ref) => findItem(ref.type, ref.id))
    .filter((x): x is Verse | VocabItem => Boolean(x));
}
