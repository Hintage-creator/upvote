import { reviewCard, scoreToQuality, type ItemType, type ReviewCard } from "@koran-app/shared";
import { getOrCreateReviewCard, saveReviewCard } from "../repositories/reviewCards";

/** Feeds a 0-100 performance score into the SM-2 scheduler and persists the result. */
export function applyReview(
  userId: string,
  itemType: ItemType,
  itemId: string,
  score0to100: number
): ReviewCard {
  const card = getOrCreateReviewCard(userId, itemType, itemId);
  const updated = reviewCard(card, scoreToQuality(score0to100));
  saveReviewCard(updated);
  return updated;
}
