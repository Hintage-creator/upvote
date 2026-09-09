import { db } from "../db";

export function markLessonCompleted(userId: string, lessonId: string): boolean {
  const already = db
    .prepare<[string, string], { user_id: string }>(
      "SELECT user_id FROM lesson_completions WHERE user_id = ? AND lesson_id = ?"
    )
    .get(userId, lessonId);
  if (already) return false;

  db.prepare(
    "INSERT INTO lesson_completions (user_id, lesson_id, completed_at) VALUES (?, ?, ?)"
  ).run(userId, lessonId, new Date().toISOString());
  return true;
}

export function countCompletedLessons(userId: string): number {
  const row = db
    .prepare<[string], { count: number }>(
      "SELECT COUNT(*) as count FROM lesson_completions WHERE user_id = ?"
    )
    .get(userId)!;
  return row.count;
}
