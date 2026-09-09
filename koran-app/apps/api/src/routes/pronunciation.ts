import type { ItemType } from "@koran-app/shared";
import { Router } from "express";
import multer from "multer";
import { arabicTextOf, findItem } from "../contentLookup";
import { createDefaultScorer } from "../pronunciation/scorer";
import { recordAttempt } from "../repositories/attempts";
import { onPronunciationScored } from "../services/gamificationService";
import { applyReview } from "../services/srsService";

export const pronunciationRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB is plenty for a single short recitation
});
const scorer = createDefaultScorer();

pronunciationRouter.post("/score", upload.single("audio"), async (req, res) => {
  const { userId, itemType, itemId, recordingDurationMs } = req.body as {
    userId?: string;
    itemType?: ItemType;
    itemId?: string;
    recordingDurationMs?: string;
  };

  if (!userId || !itemType || !itemId || !recordingDurationMs) {
    res.status(400).json({
      error: "userId, itemType, itemId and recordingDurationMs are required",
    });
    return;
  }

  const item = findItem(itemType, itemId);
  if (!item) {
    res.status(404).json({ error: "Unknown item" });
    return;
  }

  try {
    const result = await scorer.score({
      arabicText: arabicTextOf(item),
      transliteration: item.transliteration,
      recordingDurationMs: Number(recordingDurationMs),
      audio: req.file?.buffer ?? null,
      mimeType: req.file?.mimetype ?? null,
    });

    recordAttempt({ userId, itemType, itemId, kind: "pronunciation", score: result.score });
    const reviewCard = applyReview(userId, itemType, itemId, result.score);
    const { stats, newlyEarnedBadges } = onPronunciationScored(userId, result.score);

    res.json({ result, reviewCard, stats, newlyEarnedBadges });
  } catch (err) {
    res.status(503).json({
      error: "Pronunciation scoring is unavailable",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});
