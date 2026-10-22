/**
 * Minimal async key-value store interface. `AsyncStorage` from
 * @react-native-async-storage/async-storage already satisfies this shape,
 * so the repositories below depend on this interface instead of the
 * concrete package — swapping in a backend-synced store later means
 * writing one adapter, not touching every screen.
 */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
  multiGet(keys: readonly string[]): Promise<readonly [string, string | null][]>;
}

/** In-memory implementation used in tests and as a fallback. */
export class InMemoryKeyValueStore implements KeyValueStore {
  private data = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }
  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  }
  async getAllKeys(): Promise<readonly string[]> {
    return Array.from(this.data.keys());
  }
  async multiGet(keys: readonly string[]): Promise<readonly [string, string | null][]> {
    return keys.map((k) => [k, this.data.has(k) ? this.data.get(k)! : null]);
  }
}
