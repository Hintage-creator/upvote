import { describe, expect, it } from "vitest";
import { ADDITIONAL_SIGNS, ARABIC_ALPHABET, VOWEL_MARKS } from "./alphabet";

describe("ARABIC_ALPHABET", () => {
  it("has exactly the 28 letters of the standard alphabet", () => {
    expect(ARABIC_ALPHABET).toHaveLength(28);
  });

  it("has unique ids", () => {
    const ids = ARABIC_ALPHABET.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every letter non-empty isolated/initial/medial/final forms", () => {
    for (const letter of ARABIC_ALPHABET) {
      expect(letter.isolated.length, letter.id).toBeGreaterThan(0);
      expect(letter.initial.length, letter.id).toBeGreaterThan(0);
      expect(letter.medial.length, letter.id).toBeGreaterThan(0);
      expect(letter.final.length, letter.id).toBeGreaterThan(0);
    }
  });

  it("gives non-connecting letters an initial form matching isolated (nothing precedes at word start)", () => {
    for (const letter of ARABIC_ALPHABET.filter((l) => !l.connectsForward)) {
      expect(letter.initial, letter.id).toBe(letter.isolated);
    }
  });

  it("gives non-connecting letters the same medial and final shape (both just carry the incoming connector)", () => {
    for (const letter of ARABIC_ALPHABET.filter((l) => !l.connectsForward)) {
      expect(letter.medial, letter.id).toBe(letter.final);
    }
  });

  it("marks exactly the six known non-connecting letters as such", () => {
    const nonConnecting = ARABIC_ALPHABET.filter((l) => !l.connectsForward).map((l) => l.id);
    expect(new Set(nonConnecting)).toEqual(new Set(["alif", "dal", "dhal", "ra", "zay", "waw"]));
  });
});

describe("ADDITIONAL_SIGNS and VOWEL_MARKS", () => {
  it("have unique ids and non-empty symbols", () => {
    for (const list of [ADDITIONAL_SIGNS, VOWEL_MARKS]) {
      const ids = list.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const sign of list) {
        expect(sign.symbol.length, sign.id).toBeGreaterThan(0);
      }
    }
  });
});
