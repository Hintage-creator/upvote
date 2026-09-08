import { randomUUID } from "node:crypto";
import { Router } from "express";
import { db } from "../db";
import { getOrCreateUserStats } from "../repositories/userStats";

export const usersRouter = Router();

/**
 * There is no real authentication in this prototype. Every client currently
 * shares one fixed demo account so the lesson/progress/gamification loop can
 * be exercised end-to-end. Production needs real auth (e.g. sign in with
 * email/OAuth, a session token) before this can hold more than one person's
 * data meaningfully.
 */
const DEMO_USER_ID = "demo-user";

usersRouter.post("/session", (_req, res) => {
  const existing = db
    .prepare<[string], { id: string }>("SELECT id FROM users WHERE id = ?")
    .get(DEMO_USER_ID);
  if (!existing) {
    db.prepare("INSERT INTO users (id, email, created_at) VALUES (?, NULL, ?)").run(
      DEMO_USER_ID,
      new Date().toISOString()
    );
  }
  getOrCreateUserStats(DEMO_USER_ID);
  res.json({ userId: DEMO_USER_ID });
});

usersRouter.get("/:id/stats", (req, res) => {
  res.json(getOrCreateUserStats(req.params.id));
});

// Kept for symmetry with a future multi-user setup; unused by the demo client.
usersRouter.post("/", (_req, res) => {
  const id = randomUUID();
  db.prepare("INSERT INTO users (id, email, created_at) VALUES (?, NULL, ?)").run(
    id,
    new Date().toISOString()
  );
  getOrCreateUserStats(id);
  res.json({ userId: id });
});
