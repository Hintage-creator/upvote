import { describe, expect, it } from "vitest";
import { isDue, newReviewCard, reviewCard, scoreToQuality } from "./srs";

describe("scoreToQuality", () => {
  it("maps high scores to high quality", () => {
    expect(scoreToQuality(100)).toBe(5);
    expect(scoreToQuality(90)).toBe(4);
    expect(scoreToQuality(70)).toBe(3);
  });
  it("maps low scores to low quality", () => {
    expect(scoreToQuality(10)).toBe(0);
    expect(scoreToQuality(30)).toBe(1);
    expect(scoreToQuality(55)).toBe(2);
  });
});

describe("reviewCard (SM-2)", () => {
  it("starts a fresh card due immediately", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const card = newReviewCard("u1", "verse", "v1", now);
    expect(card.repetitions).toBe(0);
    expect(card.easeFactor).toBe(2.5);
    expect(isDue(card, now)).toBe(true);
  });

  it("grows the interval on consecutive good recalls: 1 day, then 6, then ease-scaled", () => {
    const t0 = new Date("2026-01-01T00:00:00Z");
    let card = newReviewCard("u1", "verse", "v1", t0);

    card = reviewCard(card, 4, t0);
    expect(card.repetitions).toBe(1);
    expect(card.intervalDays).toBe(1);

    const t1 = new Date(t0.getTime() + 1 * 86400000);
    card = reviewCard(card, 4, t1);
    expect(card.repetitions).toBe(2);
    expect(card.intervalDays).toBe(6);

    const t2 = new Date(t1.getTime() + 6 * 86400000);
    card = reviewCard(card, 4, t2);
    expect(card.repetitions).toBe(3);
    expect(card.intervalDays).toBeGreaterThan(6);
  });

  it("resets repetitions and shortens the interval on a forgotten item", () => {
    const t0 = new Date("2026-01-01T00:00:00Z");
    let card = newReviewCard("u1", "verse", "v1", t0);
    card = reviewCard(card, 5, t0);
    card = reviewCard(card, 5, new Date(t0.getTime() + 86400000));
    expect(card.repetitions).toBe(2);

    card = reviewCard(card, 1, new Date(t0.getTime() + 7 * 86400000));
    expect(card.repetitions).toBe(0);
    expect(card.intervalDays).toBe(1);
  });

  it("never lets the ease factor drop below 1.3", () => {
    let card = newReviewCard("u1", "verse", "v1");
    for (let i = 0; i < 10; i++) {
      card = reviewCard(card, 0);
    }
    expect(card.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});
