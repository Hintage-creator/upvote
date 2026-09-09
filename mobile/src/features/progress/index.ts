import { asyncStorageAdapter } from '../../services/asyncStorageAdapter';
import { ProgressRepository } from './progressRepository';

/** App-wide singleton, backed by AsyncStorage. Tests use ProgressRepository directly with an InMemoryKeyValueStore instead. */
export const progressRepository = new ProgressRepository(asyncStorageAdapter);

export * from './srs';
export * from './progressRepository';
