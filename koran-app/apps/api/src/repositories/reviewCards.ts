import type { ItemType, ReviewCard } from "@koran-app/shared";
import { newReviewCard } from "@koran-app/shared";
import { db } from "../db";

interface ReviewCardRow {
  user_id: string;
  item_type: ItemType;
  item_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_at: string;
  last_reviewed_at: string | null;
}

function rowToCard(row: ReviewCardRow): ReviewCard {
  return {
    userId: row.user_id,
    itemType: row.item_type,
    itemId: row.item_id,
    easeFactor: row.ease_factor,
    intervalDays: row.interval_days,
    repetitions: row.repetitions,
    dueAt: row.due_at,
    lastReviewedAt: row.last_reviewed_at,
  };
}

export function getOrCreateReviewCard(
  userId: string,
  itemType: ItemType,
  itemId: string
): ReviewCard {
  const existing = db
    .prepare<[string, string, string], ReviewCardRow>(
      "SELECT * FROM review_cards WHERE user_id = ? AND item_type = ? AND item_id = ?"
    )
    .get(userId, itemType, itemId);
  if (existing) return rowToCard(existing);

  const card = newReviewCard(userId, itemType, itemId);
  saveReviewCard(card);
  return card;
}

export function saveReviewCard(card: ReviewCard): void {
  db.prepare(
    `INSERT INTO review_cards (user_id, item_type, item_id, ease_factor, interval_days, repetitions, due_at, last_reviewed_at)
     VALUES (@userId, @itemType, @itemId, @easeFactor, @intervalDays, @repetitions, @dueAt, @lastReviewedAt)
     ON CONFLICT(user_id, item_type, item_id) DO UPDATE SET
       ease_factor = excluded.ease_factor,
       interval_days = excluded.interval_days,
       repetitions = excluded.repetitions,
       due_at = excluded.due_at,
       last_reviewed_at = excluded.last_reviewed_at`
  ).run(card);
}

export function getDueReviewCards(userId: string, now: Date = new Date()): ReviewCard[] {
  const rows = db
    .prepare<[string, string], ReviewCardRow>(
      "SELECT * FROM review_cards WHERE user_id = ? AND due_at <= ? ORDER BY due_at ASC"
    )
    .all(userId, now.toISOString());
  return rows.map(rowToCard);
}
