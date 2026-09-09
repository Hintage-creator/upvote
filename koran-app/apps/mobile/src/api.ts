// Thin fetch wrapper around the backend in apps/api. All endpoints are
// documented in apps/api/src/routes/*.ts.
import type {
  Badge,
  Lesson,
  LessonItemRef,
  PronunciationScore,
  QuizQuestion,
  ReviewCard,
  Verse,
  VocabItem,
  UserStats,
} from "@koran-app/shared";

// expo-web reaches the API on localhost; a real device on the same network
// needs the machine's LAN IP here instead - set EXPO_PUBLIC_API_URL to override.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${init?.method ?? "GET"} ${path} failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

export interface ResolvedLesson extends Lesson {
  resolvedItems: Array<Verse | VocabItem>;
}

export function isVerse(item: Verse | VocabItem): item is Verse {
  return "arabicText" in item;
}

export function itemRefFor(item: Verse | VocabItem): LessonItemRef {
  return isVerse(item) ? { type: "verse", id: item.id } : { type: "vocab", id: item.id };
}

export const api = {
  startSession: () => request<{ userId: string }>("/api/users/session", { method: "POST" }),

  getStats: (userId: string) => request<UserStats>(`/api/users/${userId}/stats`),

  listLessons: () => request<ResolvedLesson[]>("/api/lessons"),

  getLesson: (lessonId: string) => request<ResolvedLesson>(`/api/lessons/${lessonId}`),

  completeLesson: (lessonId: string, userId: string) =>
    request<{ wasNewlyCompleted: boolean; stats: UserStats; newlyEarnedBadges: Badge[] }>(
      `/api/lessons/${lessonId}/complete`,
      { method: "POST", body: JSON.stringify({ userId }) }
    ),

  getQuiz: (lessonId: string) =>
    request<Array<Omit<QuizQuestion, "correctAnswer">>>(`/api/quiz/lesson/${lessonId}`),

  answerQuiz: (questionId: string, userId: string, answer: string) =>
    request<{
      correct: boolean;
      correctAnswer: string;
      reviewCard: ReviewCard;
      stats: UserStats;
      newlyEarnedBadges: Badge[];
    }>(`/api/quiz/questions/${questionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ userId, answer }),
    }),

  getDueReviews: (userId: string) =>
    request<Array<{ card: ReviewCard; item: Verse | VocabItem }>>(
      `/api/review/due?userId=${encodeURIComponent(userId)}`
    ),

  scorePronunciation: (params: {
    userId: string;
    itemType: "verse" | "vocab";
    itemId: string;
    recordingDurationMs: number;
    audioUri?: string;
  }) => {
    const form = new FormData();
    form.append("userId", params.userId);
    form.append("itemType", params.itemType);
    form.append("itemId", params.itemId);
    form.append("recordingDurationMs", String(Math.round(params.recordingDurationMs)));
    if (params.audioUri) {
      // React Native's fetch/FormData accepts { uri, name, type } file objects.
      form.append("audio", {
        uri: params.audioUri,
        name: "recording.m4a",
        type: "audio/m4a",
      } as unknown as Blob);
    }
    return request<{
      result: PronunciationScore;
      reviewCard: ReviewCard;
      stats: UserStats;
      newlyEarnedBadges: Badge[];
    }>("/api/pronunciation/score", { method: "POST", body: form });
  },
};
