import { LESSONS } from "@koran-app/shared";
import { Router } from "express";
import { findLesson, resolvedLessonItems } from "../contentLookup";
import { getOrCreateReviewCard } from "../repositories/reviewCards";
import { getOrCreateUserStats } from "../repositories/userStats";
import { markLessonCompleted } from "../repositories/lessonCompletions";
import { onLessonCompleted } from "../services/gamificationService";

export const lessonsRouter = Router();

lessonsRouter.get("/", (_req, res) => {
  const sorted = [...LESSONS].sort((a, b) => a.order - b.order);
  res.json(
    sorted.map((lesson) => ({
      ...lesson,
      resolvedItems: resolvedLessonItems(lesson.id),
    }))
  );
});

lessonsRouter.get("/:id", (req, res) => {
  const lesson = findLesson(req.params.id);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  res.json({ ...lesson, resolvedItems: resolvedLessonItems(lesson.id) });
});

lessonsRouter.post("/:id/complete", (req, res) => {
  const { userId } = req.body as { userId?: string };
  const lesson = findLesson(req.params.id);
  if (!userId || !lesson) {
    res.status(400).json({ error: "userId and a valid lesson id are required" });
    return;
  }

  const wasNewlyCompleted = markLessonCompleted(userId, lesson.id);

  // Starting today, every item in this lesson enters the spaced-repetition queue.
  for (const ref of lesson.items) {
    getOrCreateReviewCard(userId, ref.type, ref.id);
  }

  const { stats, newlyEarnedBadges } = wasNewlyCompleted
    ? onLessonCompleted(userId)
    : { stats: getOrCreateUserStats(userId), newlyEarnedBadges: [] };

  res.json({ wasNewlyCompleted, stats, newlyEarnedBadges });
});
