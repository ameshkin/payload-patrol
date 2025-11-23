import badwordsSevereData from "../../../../data/en/severe.json";
import type { CheckFn } from "../../../types";

// NOTE: Uses English severe profanity by default. Use registerBadwords() to customize.
const badwordsSevere = badwordsSevereData as string[];
const defaultBadSet = new Set(badwordsSevere.map(w => w.toLowerCase()));

// Allow runtime registration of additional profanity
let customBadwords: Set<string> | null = null;

export function registerBadwords(words: string[]) {
  customBadwords = new Set(words.map(w => w.toLowerCase()));
}

export const badwordsCheck: CheckFn = (value, ctx) => {
  // Merge default and custom badwords
  const badSet = customBadwords || defaultBadSet;
  
  const allow = new Set((ctx?.allowlist ?? []).map(w => w.toLowerCase()));
  const tokens = value.toLowerCase().match(/[a-z0-9@.\-_'']+/g) ?? [];
  const hits: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (allow.has(t)) continue;
    if (badSet.has(t)) hits.push(t);
  }
  const uniqueHits = Array.from(new Set(hits));
  return {
    name: "badwords",
    ok: hits.length === 0,
    message: hits.length ? `Contains blocked terms: ${uniqueHits.slice(0, 5).join(", ")}` : undefined,
    details: hits.length ? { hits: uniqueHits } : undefined,
  };
};
