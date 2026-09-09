import type { ItemType } from "@koran-app/shared";
import { randomUUID } from "node:crypto";
import { db } from "../db";

export type AttemptKind = "pronunciation" | "quiz";

export function recordAttempt(params: {
  userId: string;
  itemType: ItemType;
  itemId: string;
  kind: AttemptKind;
  score: number;
}): void {
  db.prepare(
    `INSERT INTO attempts (id, user_id, item_type, item_id, kind, score, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(),
    params.userId,
    params.itemType,
    params.itemId,
    params.kind,
    params.score,
    new Date().toISOString()
  );
}

export function getBestPronunciationScore(userId: string): number {
  const row = db
    .prepare<[string], { best: number | null }>(
      "SELECT MAX(score) as best FROM attempts WHERE user_id = ? AND kind = 'pronunciation'"
    )
    .get(userId);
  return row?.best ?? 0;
}
