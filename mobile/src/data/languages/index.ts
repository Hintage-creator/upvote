import { LanguageCode, LanguagePack } from '../../types/content';
import { mnkPack } from './mnk';

/**
 * Registry of available language packs. To add Bambara or Dyula later:
 * 1. Create `src/data/languages/bm/` (or `dyu/`) mirroring the `mnk/`
 *    folder structure (alphabet.ts, numbers.ts, greetings.ts, grammar.ts,
 *    units.ts, lessons.ts, index.ts exporting a `LanguagePack`).
 * 2. Register it below.
 * No changes to types, screens, quiz logic, or storage are required — every
 * consumer reads through `getLanguagePack` / `LANGUAGE_PACKS`.
 */
export const LANGUAGE_PACKS: Partial<Record<LanguageCode, LanguagePack>> = {
  mnk: mnkPack,
};

export function getLanguagePack(code: LanguageCode): LanguagePack {
  const pack = LANGUAGE_PACKS[code];
  if (!pack) {
    throw new Error(`No language pack registered for "${code}" yet.`);
  }
  return pack;
}

export function getAvailableLanguages(): LanguageCode[] {
  return Object.keys(LANGUAGE_PACKS) as LanguageCode[];
}
