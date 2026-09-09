import { asyncStorageAdapter } from '../../services/asyncStorageAdapter';

const STORY_SEEN_KEY = 'dungeon:story-seen';

export async function hasSeenStory(): Promise<boolean> {
  return (await asyncStorageAdapter.getItem(STORY_SEEN_KEY)) === 'true';
}

export async function markStorySeen(): Promise<void> {
  await asyncStorageAdapter.setItem(STORY_SEEN_KEY, 'true');
}
