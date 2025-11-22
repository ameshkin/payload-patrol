import { registerBadwords } from "./lib/checks/builtins/badwords";

/**
 * Register a custom profanity/badwords list
 * This replaces the default badwords.json list
 * 
 * @example
 * ```ts
 * import { registerProfanityList } from '@ameshkin/payload-patrol';
 * 
 * // Use custom English words
 * registerProfanityList(['spam', 'scam', 'fake']);
 * 
 * // Or load from JSON
 * import badwords from './data/en/severe.json';
 * registerProfanityList(badwords);
 * ```
 */
export function registerProfanityList(words: string[]) {
  registerBadwords(words);
}