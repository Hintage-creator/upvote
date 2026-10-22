import { KeyValueStore } from '../../services/keyValueStore';
import { ReviewState, UserProgress, initUserProgress, isDue } from './srs';

const REVIEW_KEY_PREFIX = 'progress:review:';
const USER_PROGRESS_KEY = 'progress:user';
const COMPLETED_LESSONS_KEY = 'progress:completed-lessons';

const reviewKey = (itemId: string) => `${REVIEW_KEY_PREFIX}${itemId}`;

/**
 * Repository pattern over a KeyValueStore. Screens call these methods, not
 * AsyncStorage directly — swapping local storage for a backend-synced
 * store later means writing a new KeyValueStore (or a new repository with
 * the same method signatures), not touching UI code.
 */
export class ProgressRepository {
  constructor(private store: KeyValueStore) {}

  async getReviewState(itemId: string): Promise<ReviewState | null> {
    const raw = await this.store.getItem(reviewKey(itemId));
    return raw ? (JSON.parse(raw) as ReviewState) : null;
  }

  async saveReviewState(state: ReviewState): Promise<void> {
    await this.store.setItem(reviewKey(state.itemId), JSON.stringify(state));
  }

  async getAllReviewStates(): Promise<ReviewState[]> {
    const keys = (await this.store.getAllKeys()).filter((k) => k.startsWith(REVIEW_KEY_PREFIX));
    const pairs = await this.store.multiGet(keys);
    return pairs
      .map(([, value]) => (value ? (JSON.parse(value) as ReviewState) : null))
      .filter((v): v is ReviewState => v !== null);
  }

  async getDueReviewStates(now: Date = new Date()): Promise<ReviewState[]> {
    const all = await this.getAllReviewStates();
    return all.filter((state) => isDue(state, now));
  }

  async getUserProgress(): Promise<UserProgress> {
    const raw = await this.store.getItem(USER_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as UserProgress) : initUserProgress();
  }

  async saveUserProgress(progress: UserProgress): Promise<void> {
    await this.store.setItem(USER_PROGRESS_KEY, JSON.stringify(progress));
  }

  async getCompletedLessonIds(): Promise<string[]> {
    const raw = await this.store.getItem(COMPLETED_LESSONS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  }

  async markLessonCompleted(lessonId: string): Promise<void> {
    const completed = await this.getCompletedLessonIds();
    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
      await this.store.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(completed));
    }
  }
}
