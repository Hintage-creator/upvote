import { randomUUID } from "node:crypto";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app";

const app = createApp();

describe("GET /api/health", () => {
  it("responds ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe("lessons", () => {
  it("lists lessons sorted by order with resolved items", async () => {
    const res = await request(app).get("/api/lessons");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    const orders = res.body.map((l: { order: number }) => l.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(res.body[0].resolvedItems.length).toBeGreaterThan(0);
  });

  it("404s for an unknown lesson id", async () => {
    const res = await request(app).get("/api/lessons/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("awards XP once for completing a lesson, and is idempotent on repeat", async () => {
    const userId = randomUUID();
    const first = await request(app).post("/api/lessons/l-vocab-1/complete").send({ userId });
    expect(first.status).toBe(200);
    expect(first.body.wasNewlyCompleted).toBe(true);
    expect(first.body.stats.xp).toBeGreaterThan(0);

    const second = await request(app).post("/api/lessons/l-vocab-1/complete").send({ userId });
    expect(second.body.wasNewlyCompleted).toBe(false);
    expect(second.body.stats.xp).toBe(first.body.stats.xp);
  });

  it("puts every lesson item into the due review queue after completion", async () => {
    const userId = randomUUID();
    await request(app).post("/api/lessons/l-fatiha-1/complete").send({ userId });

    const due = await request(app).get(`/api/review/due?userId=${userId}`);
    expect(due.status).toBe(200);
    expect(due.body.length).toBe(4); // Al-Fatiha 1/2 has 4 verses
  });
});

describe("quiz", () => {
  it("never leaks the correct answer in the question list", async () => {
    const res = await request(app).get("/api/quiz/lesson/l-fatiha-1");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    for (const q of res.body) {
      expect(q).not.toHaveProperty("correctAnswer");
    }
  });

  it("grades an answer server-side and rewards correct answers with XP", async () => {
    const userId = randomUUID();
    const questions = await request(app).get("/api/quiz/lesson/l-fatiha-1");
    const questionId = questions.body[0].id;

    // Look up the real answer through the (test-only) full question list export.
    const { QUIZ_QUESTIONS } = await import("@koran-app/shared");
    const fullQuestion = QUIZ_QUESTIONS.find((q) => q.id === questionId)!;

    const wrong = await request(app)
      .post(`/api/quiz/questions/${questionId}/answer`)
      .send({ userId, answer: "definitely not the answer" });
    expect(wrong.body.correct).toBe(false);
    expect(wrong.body.correctAnswer).toBe(fullQuestion.correctAnswer);

    const right = await request(app)
      .post(`/api/quiz/questions/${questionId}/answer`)
      .send({ userId, answer: fullQuestion.correctAnswer });
    expect(right.body.correct).toBe(true);
    expect(right.body.stats.xp).toBeGreaterThan(0);
  });
});

describe("pronunciation scoring (mock heuristic)", () => {
  it("scores 0 and flags a missing recording when duration is implausibly short", async () => {
    const userId = randomUUID();
    const res = await request(app)
      .post("/api/pronunciation/score")
      .field("userId", userId)
      .field("itemType", "verse")
      .field("itemId", "112:1")
      .field("recordingDurationMs", "50");
    expect(res.status).toBe(200);
    expect(res.body.result.score).toBe(0);
    expect(res.body.result.engine).toBe("mock-heuristic");
  });

  it("scores highly when recording duration matches the expected length", async () => {
    const userId = randomUUID();
    // "Qul huwa llahu ahad" -> ~17 letters * 90ms/letter
    const res = await request(app)
      .post("/api/pronunciation/score")
      .field("userId", userId)
      .field("itemType", "verse")
      .field("itemId", "112:1")
      .field("recordingDurationMs", "1530");
    expect(res.status).toBe(200);
    expect(res.body.result.score).toBeGreaterThanOrEqual(85);
    expect(res.body.reviewCard.repetitions).toBe(1);
  });

  it("404s for an unknown item", async () => {
    const res = await request(app)
      .post("/api/pronunciation/score")
      .field("userId", randomUUID())
      .field("itemType", "verse")
      .field("itemId", "999:999")
      .field("recordingDurationMs", "1000");
    expect(res.status).toBe(404);
  });
});

describe("user session", () => {
  it("creates a demo user on first call and is idempotent after", async () => {
    const first = await request(app).post("/api/users/session");
    const second = await request(app).post("/api/users/session");
    expect(first.body.userId).toBe(second.body.userId);
  });
});
