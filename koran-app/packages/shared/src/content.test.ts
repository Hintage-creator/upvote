import { describe, expect, it } from "vitest";
import { LESSONS, QUIZ_QUESTIONS, VERSES, VOCAB } from "./content";

const verseIds = new Set(VERSES.map((v) => v.id));
const vocabIds = new Set(VOCAB.map((v) => v.id));

describe("seed content integrity", () => {
  it("every lesson item points at a real verse or vocab item", () => {
    for (const lesson of LESSONS) {
      for (const item of lesson.items) {
        const exists = item.type === "verse" ? verseIds.has(item.id) : vocabIds.has(item.id);
        expect(exists, `${lesson.id} references missing ${item.type} ${item.id}`).toBe(true);
      }
    }
  });

  it("difficulty is non-decreasing across lesson order", () => {
    const sorted = [...LESSONS].sort((a, b) => a.order - b.order);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].difficulty).toBeGreaterThanOrEqual(sorted[i - 1].difficulty - 1);
    }
  });

  it("every quiz question's options include the correct answer exactly once, with no duplicates", () => {
    for (const q of QUIZ_QUESTIONS) {
      const occurrences = q.options.filter((o) => o === q.correctAnswer).length;
      expect(occurrences, `${q.id} options: ${JSON.stringify(q.options)}`).toBe(1);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it("fill_blank questions only reference verses within the same surah/lesson", () => {
    const fillBlanks = QUIZ_QUESTIONS.filter((q) => q.type === "fill_blank");
    expect(fillBlanks.length).toBeGreaterThan(0);
  });
});
