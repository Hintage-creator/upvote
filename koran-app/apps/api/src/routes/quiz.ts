import { QUIZ_QUESTIONS } from "@koran-app/shared";
import { Router } from "express";
import { recordAttempt } from "../repositories/attempts";
import { onQuizAnswered } from "../services/gamificationService";
import { applyReview } from "../services/srsService";

export const quizRouter = Router();

// correctAnswer is stripped before sending questions to the client - the
// server is the source of truth for grading, so the answer key never has to
// leave the backend.
function toPublicQuestion(q: (typeof QUIZ_QUESTIONS)[number]) {
  const { correctAnswer: _correctAnswer, ...pub } = q;
  return pub;
}

quizRouter.get("/lesson/:lessonId", (req, res) => {
  const questions = QUIZ_QUESTIONS.filter((q) => q.lessonId === req.params.lessonId);
  res.json(questions.map(toPublicQuestion));
});

quizRouter.post("/questions/:questionId/answer", (req, res) => {
  const { userId, answer } = req.body as { userId?: string; answer?: string };
  const question = QUIZ_QUESTIONS.find((q) => q.id === req.params.questionId);

  if (!userId || !question || typeof answer !== "string") {
    res.status(400).json({ error: "userId, answer and a valid questionId are required" });
    return;
  }

  const correct = answer === question.correctAnswer;
  const score = correct ? 100 : 0;

  recordAttempt({ userId, itemType: "verse", itemId: question.verseId, kind: "quiz", score });
  const reviewCard = applyReview(userId, "verse", question.verseId, score);
  const { stats, newlyEarnedBadges } = onQuizAnswered(userId, correct);

  res.json({ correct, correctAnswer: question.correctAnswer, reviewCard, stats, newlyEarnedBadges });
});
