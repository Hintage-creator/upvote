import cors from "cors";
import express from "express";
import "./db"; // ensures schema is created before any route runs
import { lessonsRouter } from "./routes/lessons";
import { pronunciationRouter } from "./routes/pronunciation";
import { quizRouter } from "./routes/quiz";
import { reviewRouter } from "./routes/review";
import { usersRouter } from "./routes/users";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/lessons", lessonsRouter);
  app.use("/api/quiz", quizRouter);
  app.use("/api/pronunciation", pronunciationRouter);
  app.use("/api/review", reviewRouter);
  app.use("/api/users", usersRouter);

  return app;
}
