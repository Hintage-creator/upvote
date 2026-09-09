import { Router } from "express";
import { findItem } from "../contentLookup";
import { getDueReviewCards } from "../repositories/reviewCards";

export const reviewRouter = Router();

reviewRouter.get("/due", (req, res) => {
  const userId = req.query.userId as string | undefined;
  if (!userId) {
    res.status(400).json({ error: "userId query param is required" });
    return;
  }

  const due = getDueReviewCards(userId).map((card) => ({
    card,
    item: findItem(card.itemType, card.itemId),
  }));

  res.json(due);
});
