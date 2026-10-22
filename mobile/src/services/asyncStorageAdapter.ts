import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyValueStore } from './keyValueStore';

/** Adapts @react-native-async-storage/async-storage to the KeyValueStore interface. */
export const asyncStorageAdapter: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
  getAllKeys: () => AsyncStorage.getAllKeys(),
  multiGet: async (keys) => {
    const result = await AsyncStorage.multiGet(keys as string[]);
    return result as readonly [string, string | null][];
  },
};
